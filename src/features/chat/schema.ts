import { z } from 'zod';

import { LIMITS } from '@/constants/limits';

export const messageBodySchema = z
  .string()
  .trim()
  .min(LIMITS.message.min, '메시지를 입력해 주세요.')
  .max(LIMITS.message.max, `메시지는 ${LIMITS.message.max}자까지 보낼 수 있어요.`);

export const sendMessageSchema = z.object({
  post_id: z.string().uuid(),
  body: messageBodySchema,
  client_msg_id: z.string().uuid(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/**
 * 목록에서 쓰는 메시지 표시 상태. 서버 행(MessageRow)에는 없는 클라이언트 전용 값이다.
 * CL5에서 낙관적 전송과 '다시 보내기'에 사용한다.
 */
export type DeliveryState = 'sent' | 'sending' | 'failed';
