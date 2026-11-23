import { toAppError } from '@/lib/errors';
import { supabase, USE_MOCK } from '@/lib/supabase';
import { MOCK_USER_ID, sleep } from '@/types/mockData';

import type { SignInInput, SignUpInput, VerifyOtpInput } from './schema';

/** 화면이 쓰는 최소 세션 모양. supabase Session 전체를 화면에 흘리지 않는다. */
export interface AppSession {
  userId: string;
  email: string;
  /**
   * 비밀번호 재설정 중인가. verifyOtp(recovery) 성공 시 세션이 생기므로, 새 비밀번호를 정하기 전까지
   * 가드가 (tabs)로 보내지 않고 reset-password에 붙잡아 둔다. 앱이 이 도중에 종료되면 플래그는 사라진다
   * (코드 인증을 마친 본인 세션이므로 일반 로그인 상태로 복귀한다).
   */
  recovery: boolean;
}

type Listener = (s: AppSession | null) => void;
type BaseSession = { userId: string; email: string };

// ───────── 세션 저장소 (모듈 하나가 세션·재설정 플래그를 소유한다) ─────────
let base: BaseSession | null = null;
let recovery = false;
const listeners = new Set<Listener>();

const snapshot = (): AppSession | null => (base ? { ...base, recovery } : null);
const publish = () => {
  const s = snapshot();
  listeners.forEach((l) => l(s));
};
const setBase = (next: BaseSession | null) => {
  base = next;
  if (!next) recovery = false;
  publish();
};
const setRecovery = (value: boolean) => {
  recovery = value;
  publish();
};

const toBase = (s: { user: { id: string; email?: string | null } } | null): BaseSession | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '' } : null;

// 목 모드 기본값은 "로그인됨 + 프로필 있음"이라 FE가 바로 (tabs) 화면을 그릴 수 있다.
if (USE_MOCK) base = { userId: MOCK_USER_ID, email: 'mock@postech.ac.kr' };

let authSubscribed = false;
/** supabase 인증 이벤트를 앱 전체에서 한 번만 구독한다. */
function ensureSubscribed() {
  if (USE_MOCK || authSubscribed) return;
  authSubscribed = true;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') recovery = true;
    setBase(toBase(session));
  });
}

export async function getSession(): Promise<AppSession | null> {
  if (USE_MOCK) return snapshot();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAppError(error);
  base = toBase(data.session);
  return snapshot();
}

/** 세션 변화를 구독한다. 반환값은 구독 해제 함수. */
export function onSessionChange(listener: Listener): () => void {
  ensureSubscribed();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 가입: 6자리 OTP 메일 발송. Turnstile 토큰은 CL3에서 화면과 연결한다. */
export async function signUp(input: SignUpInput, captchaToken?: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { captchaToken },
  });
  if (error) throw toAppError(error);
}

export async function verifyOtp(input: VerifyOtpInput): Promise<void> {
  if (USE_MOCK) {
    await sleep();
    if (input.token !== '123456') throw toAppError({ message: 'Token has expired or is invalid' });
    if (input.type === 'recovery') recovery = true;
    setBase({ userId: MOCK_USER_ID, email: input.email });
    return;
  }
  // recovery는 세션이 생기기 전에 먼저 표시해, 가드가 (tabs)로 보내는 틈을 없앤다.
  if (input.type === 'recovery') recovery = true;
  const { error } = await supabase.auth.verifyOtp({
    email: input.email,
    token: input.token,
    type: input.type,
  });
  if (error) {
    if (input.type === 'recovery') recovery = false;
    throw toAppError(error);
  }
}

export async function resendSignupOtp(email: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw toAppError(error);
}

export type SignInResult =
  | { status: 'signed-in' }
  /** resent=false면 재발송이 실패한 것(예: 60초 제한). 가입 때 받은 코드가 아직 유효할 수 있어 verify 화면은 그대로 연다. */
  | { status: 'needs-verify'; email: string; resent: boolean };

/**
 * 로그인. 인증 안 된 계정이면 코드를 다시 보내고 verify 화면으로 보내라는 결과를 돌려준다(§3-3).
 * 재발송이 실패해도 needs-verify는 항상 돌려준다.
 */
export async function signIn(input: SignInInput): Promise<SignInResult> {
  if (USE_MOCK) {
    await sleep();
    setBase({ userId: MOCK_USER_ID, email: input.email });
    return { status: 'signed-in' };
  }
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) {
    const appError = toAppError(error);
    if (appError.code === 'EMAIL_NOT_CONFIRMED') {
      const resent = await resendSignupOtp(input.email).then(
        () => true,
        () => false,
      );
      return { status: 'needs-verify', email: input.email, resent };
    }
    throw appError;
  }
  return { status: 'signed-in' };
}

export async function requestPasswordReset(email: string, captchaToken?: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { captchaToken });
  if (error) throw toAppError(error);
}

/** 새 비밀번호를 저장한다. 성공하면 재설정 상태가 풀려 가드가 (tabs)로 보낸다. */
export async function updatePassword(password: string): Promise<void> {
  if (USE_MOCK) {
    await sleep();
    setRecovery(false);
    return;
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAppError(error);
  setRecovery(false);
}

/** 비밀번호 변경 전 현재 비밀번호 재확인(§3-3 change pw, delete) */
export async function reauthenticate(email: string, password: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAppError(error);
}

export async function signOut(): Promise<void> {
  if (USE_MOCK) {
    setBase(null);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw toAppError(error);
}
