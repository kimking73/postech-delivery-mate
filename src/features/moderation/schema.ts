import { z } from 'zod';

import { LIMITS } from '@/constants/limits';

/**
 * target_id: post·user는 uuid, message는 bigint를 문자열로 넘긴다. noshow는 대상 사용자 id다(SV3 스텁 주석).
 * post_id: noshow 신고에서 어느 방인지 알려 준다. §4 표에 없는 추가 인자라 아키텍처 반영 승인 대기 중이다(J2에서 확정).
 */
export const reportSchema = z
  .object({
    target_type: z.enum(['post', 'message', 'user', 'noshow']),
    target_id: z.string().min(1),
    reason: z.enum(['spam', 'abuse', 'scam', 'inappropriate', 'noshow', 'unpaid', 'other']),
    detail: z
      .string()
      .trim()
      .max(LIMITS.report.detailMax, `상세 내용은 ${LIMITS.report.detailMax}자까지 쓸 수 있어요.`)
      .nullable()
      .optional(),
    post_id: z.string().uuid().nullable().optional(),
  })
  .refine((v) => v.target_type !== 'noshow' || !!v.post_id, {
    message: '노쇼 신고는 방 정보가 필요해요.',
    path: ['post_id'],
  });

export type ReportInput = z.infer<typeof reportSchema>;
