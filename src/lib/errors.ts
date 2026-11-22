/**
 * 서버 에러 코드 → 한국어 문구. 아키텍처 §4-4.
 * RPC는 `raise exception using errcode='P0001', message='<CODE>'`로 던지므로
 * PostgrestError.message에 코드가 들어 있다.
 * 문구는 임시다. 최종 문구는 P2(디자인)가 `constants/strings.ts` 기준으로 확정하면 여기서 가져다 쓴다.
 */

export const ERROR_CODES = [
  'NOT_VERIFIED',
  'SANCTIONED',
  'PROFILE_REQUIRED',
  'NICKNAME_TAKEN',
  'BANNED_WORD',
  'RATE_LIMITED',
  'POST_NOT_FOUND',
  'POST_CLOSED',
  'POST_FULL',
  'BLOCKED',
  'KICKED',
  'TOO_MANY_ROOMS',
  'NOT_HOST',
  'NOT_PARTICIPANT',
  'INVALID_STATE',
  'INVALID_INPUT',
  'DUPLICATE_REPORT',
  'ACCOUNT_REQUIRED',
  'PAY_DEADLINE_PASSED',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** 서버 코드가 아닌 클라이언트·네트워크·Auth 쪽 에러 */
export type ClientErrorCode =
  | 'NETWORK'
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_OTP'
  | 'EMAIL_DOMAIN'
  | 'WEAK_PASSWORD'
  | 'CAPTCHA_FAILED'
  | 'EMAIL_RATE_LIMITED'
  | 'UNKNOWN';

export type AppErrorCode = ErrorCode | ClientErrorCode;

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  NOT_VERIFIED: 'POSTECH 메일 인증이 필요해요.',
  SANCTIONED: '이용이 제한된 계정이에요. 문의는 운영 메일로 보내 주세요.',
  PROFILE_REQUIRED: '먼저 프로필을 만들어 주세요.',
  NICKNAME_TAKEN: '이미 사용 중인 닉네임이에요.',
  BANNED_WORD: '사용할 수 없는 표현이 포함되어 있어요.',
  RATE_LIMITED: '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.',
  POST_NOT_FOUND: '삭제되었거나 볼 수 없는 글이에요.',
  POST_CLOSED: '이미 마감된 모집이에요.',
  POST_FULL: '정원이 가득 찼어요.',
  BLOCKED: '이 모집에는 참여할 수 없어요.',
  KICKED: '이 방에서 내보내진 이력이 있어 다시 참여할 수 없어요.',
  TOO_MANY_ROOMS: '동시에 참여할 수 있는 방은 최대 5개예요.',
  NOT_HOST: '방장만 할 수 있어요.',
  NOT_PARTICIPANT: '참여 중인 사람만 볼 수 있어요.',
  INVALID_STATE: '지금은 할 수 없는 동작이에요.',
  INVALID_INPUT: '입력한 내용을 다시 확인해 주세요.',
  DUPLICATE_REPORT: '이미 신고한 대상이에요.',
  ACCOUNT_REQUIRED: '글을 올리려면 송금받을 계좌를 먼저 등록해 주세요.',
  PAY_DEADLINE_PASSED: '송금 기한이 지났어요.',
  NETWORK: '네트워크 연결을 확인해 주세요.',
  EMAIL_NOT_CONFIRMED: '메일 인증이 아직 끝나지 않았어요.',
  INVALID_CREDENTIALS: '메일 또는 비밀번호가 올바르지 않아요.',
  INVALID_OTP: '인증 코드가 올바르지 않거나 만료되었어요.',
  EMAIL_DOMAIN: 'POSTECH 메일(@postech.ac.kr)로만 가입할 수 있어요.',
  WEAK_PASSWORD: '비밀번호는 8자 이상, 영문과 숫자를 포함해야 해요.',
  CAPTCHA_FAILED: '보안 확인에 실패했어요. 다시 시도해 주세요.',
  EMAIL_RATE_LIMITED: '메일은 잠시 후에 다시 보낼 수 있어요.',
  UNKNOWN: '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, cause?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

const SERVER_CODES: ReadonlySet<string> = new Set(ERROR_CODES);

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && SERVER_CODES.has(value);
}

function readMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return typeof e === 'string' ? e : '';
}

/**
 * supabase-js 에러(Postgrest, Auth, 네트워크)를 AppError로 바꾼다.
 * Auth 에러 문자열은 supabase-js 버전에 따라 달라질 수 있어 소문자 부분 일치로 판별한다.
 * 실제 문구는 CL3에서 실측해 보정한다.
 */
export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;

  const message = readMessage(e).trim();
  if (isErrorCode(message)) return new AppError(message, e);

  const lower = message.toLowerCase();
  if (lower.includes('email not confirmed')) return new AppError('EMAIL_NOT_CONFIRMED', e);
  if (lower.includes('invalid login credentials')) return new AppError('INVALID_CREDENTIALS', e);
  if (lower.includes('token has expired') || lower.includes('otp') || lower.includes('invalid token')) {
    return new AppError('INVALID_OTP', e);
  }
  if (lower.includes('captcha')) return new AppError('CAPTCHA_FAILED', e);
  if (lower.includes('password') && (lower.includes('weak') || lower.includes('at least') || lower.includes('pwned'))) {
    return new AppError('WEAK_PASSWORD', e);
  }
  if (lower.includes('rate limit') || lower.includes('only request this after')) {
    return new AppError('EMAIL_RATE_LIMITED', e);
  }
  if (lower.includes('postech') || lower.includes('domain')) return new AppError('EMAIL_DOMAIN', e);
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('timeout')) {
    return new AppError('NETWORK', e);
  }
  return new AppError('UNKNOWN', e);
}

/** 화면에 보여줄 한국어 문구 */
export function errorMessage(e: unknown): string {
  return toAppError(e).message;
}
