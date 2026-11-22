import { z } from 'zod';

import { LIMITS } from '@/constants/limits';

const L = LIMITS.post;
const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);

export const createPostSchema = z.object({
  zone_id: z.number().int().positive('구역을 골라 주세요.'),
  category_id: z.number().int().positive('카테고리를 골라 주세요.'),
  store_name: z.string().trim().min(L.storeName.min, '가게 이름을 입력해 주세요.').max(L.storeName.max),
  store_url: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(L.storeUrlMax)
      .refine((v) => v.startsWith('https://'), 'https:// 로 시작하는 주소만 쓸 수 있어요.')
      .nullable()
      .optional(),
  ),
  pickup_place_id: z.number().int().positive('픽업 장소를 골라 주세요.'),
  pickup_note: z.preprocess(emptyToNull, z.string().trim().max(L.pickupNoteMax).nullable().optional()),
  max_members: z.number().int().min(L.maxMembers.min).max(L.maxMembers.max),
  deadline_minutes: z.number().int().min(L.deadlineMinutes.min).max(L.deadlineMinutes.max),
  fee_note: z.preprocess(emptyToNull, z.string().trim().max(L.feeNoteMax).nullable().optional()),
  memo: z.preprocess(emptyToNull, z.string().trim().max(L.memoMax).nullable().optional()),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

const P = LIMITS.payout;

/** 계좌: (은행+계좌번호+예금주 모두) 또는 토스 링크. 모두 비면 삭제(서버 규칙, §4 set_payout_account). */
export const payoutAccountSchema = z
  .object({
    bank_name: z.preprocess(
      emptyToNull,
      z.string().trim().min(P.bankName.min).max(P.bankName.max).nullable().optional(),
    ),
    account_number: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .min(P.accountNumber.min)
        .max(P.accountNumber.max)
        .regex(P.accountNumber.pattern, '숫자와 -만 입력할 수 있어요.')
        .nullable()
        .optional(),
    ),
    account_holder: z.preprocess(
      emptyToNull,
      z.string().trim().min(P.holder.min).max(P.holder.max).nullable().optional(),
    ),
    toss_link: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(P.tossLinkMax)
        .refine((v) => v.startsWith(P.tossLinkPrefix), `${P.tossLinkPrefix} 로 시작하는 링크만 쓸 수 있어요.`)
        .nullable()
        .optional(),
    ),
  })
  .superRefine((v, ctx) => {
    const bankSet = [v.bank_name, v.account_number, v.account_holder].filter(Boolean).length;
    const hasToss = !!v.toss_link;
    const allEmpty = bankSet === 0 && !hasToss;
    if (allEmpty) return; // 삭제 요청
    if (bankSet !== 0 && bankSet !== 3 && !hasToss) {
      ctx.addIssue({ code: 'custom', message: '은행, 계좌번호, 예금주를 모두 입력해 주세요.' });
    }
  });

export type PayoutAccountInput = z.infer<typeof payoutAccountSchema>;
