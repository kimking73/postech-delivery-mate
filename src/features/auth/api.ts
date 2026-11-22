import { toAppError } from '@/lib/errors';
import { supabase, USE_MOCK } from '@/lib/supabase';
import { MOCK_USER_ID, sleep } from '@/types/mockData';

import type { SignInInput, SignUpInput, VerifyOtpInput } from './schema';

/** 화면이 쓰는 최소 세션 모양. supabase Session 전체를 화면에 흘리지 않는다. */
export interface AppSession {
  userId: string;
  email: string;
}

type Listener = (s: AppSession | null) => void;

// ───────── 목 인증 상태 (USE_MOCK일 때만 쓴다) ─────────
// 기본값은 "로그인됨 + 프로필 있음"이라 FE가 바로 (tabs) 화면을 그릴 수 있다.
let mockSession: AppSession | null = { userId: MOCK_USER_ID, email: 'mock@postech.ac.kr' };
const mockListeners = new Set<Listener>();
const setMockSession = (s: AppSession | null) => {
  mockSession = s;
  mockListeners.forEach((l) => l(s));
};

const toAppSession = (s: { user: { id: string; email?: string | null } } | null): AppSession | null =>
  s ? { userId: s.user.id, email: s.user.email ?? '' } : null;

export async function getSession(): Promise<AppSession | null> {
  if (USE_MOCK) return mockSession;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAppError(error);
  return toAppSession(data.session);
}

/** 세션 변화를 구독한다. 반환값은 구독 해제 함수. */
export function onSessionChange(listener: Listener): () => void {
  if (USE_MOCK) {
    mockListeners.add(listener);
    return () => mockListeners.delete(listener);
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(toAppSession(session));
  });
  return () => data.subscription.unsubscribe();
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
    setMockSession({ userId: MOCK_USER_ID, email: input.email });
    return;
  }
  const { error } = await supabase.auth.verifyOtp({
    email: input.email,
    token: input.token,
    type: input.type,
  });
  if (error) throw toAppError(error);
}

export async function resendSignupOtp(email: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw toAppError(error);
}

export type SignInResult = { status: 'signed-in' } | { status: 'needs-verify'; email: string };

/**
 * 로그인. 인증 안 된 계정이면 코드를 다시 보내고 verify 화면으로 보내라는 결과를 돌려준다(§3-3).
 */
export async function signIn(input: SignInInput): Promise<SignInResult> {
  if (USE_MOCK) {
    await sleep();
    setMockSession({ userId: MOCK_USER_ID, email: input.email });
    return { status: 'signed-in' };
  }
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) {
    const appError = toAppError(error);
    if (appError.code === 'EMAIL_NOT_CONFIRMED') {
      await resendSignupOtp(input.email);
      return { status: 'needs-verify', email: input.email };
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

export async function updatePassword(password: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw toAppError(error);
}

/** 비밀번호 변경 전 현재 비밀번호 재확인(§3-3 change pw, delete) */
export async function reauthenticate(email: string, password: string): Promise<void> {
  if (USE_MOCK) return sleep();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toAppError(error);
}

export async function signOut(): Promise<void> {
  if (USE_MOCK) {
    setMockSession(null);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw toAppError(error);
}
