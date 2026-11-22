import { z } from 'zod';

import { LIMITS } from '@/constants/limits';

export const POSTECH_DOMAIN = '@postech.ac.kr';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('메일 형식이 올바르지 않아요.')
  .refine((v) => v.endsWith(POSTECH_DOMAIN), 'POSTECH 메일(@postech.ac.kr)로만 가입할 수 있어요.');

/** 아키텍처 §3-2: 최소 8자, 영문과 숫자 필수 */
export const passwordSchema = z
  .string()
  .min(LIMITS.password.min, `비밀번호는 ${LIMITS.password.min}자 이상이어야 해요.`)
  .regex(/[A-Za-z]/, '영문을 포함해 주세요.')
  .regex(/[0-9]/, '숫자를 포함해 주세요.');

export const otpSchema = z
  .string()
  .regex(new RegExp(`^[0-9]{${LIMITS.otp.length}}$`), `${LIMITS.otp.length}자리 숫자를 입력해 주세요.`);

export const signUpSchema = z.object({ email: emailSchema, password: passwordSchema });
export const signInSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: otpSchema,
  type: z.enum(['signup', 'recovery']),
});
export const resetPasswordSchema = z.object({ password: passwordSchema });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * 라우팅 가드 규칙 (아키텍처 §3-3). 순수 함수라서 RN 없이 테스트할 수 있다.
 *  1. 세션 없음 → (auth)
 *  2. 세션 있음 + 프로필 없음 → profile-setup
 *  3. 둘 다 있음 → (tabs)
 * 가드가 끝나면 목적지 그룹이 지금 위치와 같을 때 null(이동 불필요)을 돌려준다.
 */
export type GuardTarget = '/(auth)/sign-in' | '/(auth)/profile-setup' | '/(tabs)';

export interface GuardInput {
  /** 세션 복원이 끝났는지. false면 아무것도 하지 않는다(스플래시 유지). */
  ready: boolean;
  hasSession: boolean;
  /** 프로필 조회가 끝났는지. 세션이 있을 때만 의미가 있다. */
  profileReady: boolean;
  hasProfile: boolean;
  /** useSegments() 결과 */
  segments: readonly string[];
}

/** 인증 전에 열려 있어야 하는 (auth) 하위 화면 */
const PUBLIC_AUTH_SCREENS = new Set([
  'permissions', 'sign-in', 'sign-up', 'verify', 'forgot-password', 'reset-password',
]);

export function resolveGuardTarget(input: GuardInput): GuardTarget | null {
  const { ready, hasSession, profileReady, hasProfile, segments } = input;
  if (!ready) return null;

  const group = segments[0];
  const screen = segments[1];

  if (!hasSession) {
    // 비밀번호 재설정은 verifyOtp(recovery) 직후 세션이 생기므로 (auth) 안에서 유지한다.
    if (group === '(auth)' && screen !== undefined && PUBLIC_AUTH_SCREENS.has(screen)) return null;
    return '/(auth)/sign-in';
  }

  if (!profileReady) return null;

  if (!hasProfile) {
    return group === '(auth)' && screen === 'profile-setup' ? null : '/(auth)/profile-setup';
  }

  // 프로필까지 있으면 (auth)에 머물 이유가 없다. reset-password는 예외(재설정 중)
  if (group === '(auth)' && screen !== 'reset-password') return '/(tabs)';
  return null;
}
