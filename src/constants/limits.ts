/**
 * 서버(RPC·CHECK 제약)와 같은 숫자를 쓰는 기준 파일. 아키텍처 §2-2, §4, §9.
 * 서버 쪽 규칙이 바뀌면 이 파일도 같은 PR에서 함께 고친다.
 */
export const LIMITS = {
  nickname: { min: 2, max: 12, pattern: /^[가-힣a-zA-Z0-9_]+$/ },
  post: {
    storeName: { min: 1, max: 30 },
    storeUrlMax: 500,
    pickupNoteMax: 50,
    maxMembers: { min: 2, max: 8 }, // 방장 포함
    deadlineMinutes: { min: 10, max: 180 },
    feeNoteMax: 100,
    memoMax: 500,
  },
  message: { min: 1, max: 1000, pageSize: 50 },
  feed: { pageSize: 20 },
  report: { detailMax: 500 },
  payout: {
    bankName: { min: 1, max: 30 },
    tossLinkMax: 200,
    accountNumber: { min: 10, max: 20, pattern: /^[0-9-]+$/ },
    holder: { min: 2, max: 20 },
    tossLinkPrefix: 'https://toss.me/',
  },
  otp: { length: 6 },
  password: { min: 8 }, // Auth 설정(§3-2)과 맞출 것
  rooms: { maxJoined: 5 },
  unreadCap: 99,
  payDueMinutes: 30, // 마감 후 송금 기한(서버가 pay_due_at을 계산, 표시용)
} as const;
