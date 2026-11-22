import { z } from 'zod';

import { LIMITS } from '@/constants/limits';

export const nicknameSchema = z
  .string()
  .trim()
  .min(LIMITS.nickname.min, `닉네임은 ${LIMITS.nickname.min}자 이상이어야 해요.`)
  .max(LIMITS.nickname.max, `닉네임은 ${LIMITS.nickname.max}자 이하여야 해요.`)
  .regex(LIMITS.nickname.pattern, '한글, 영문, 숫자, 밑줄(_)만 쓸 수 있어요.');

export const createProfileSchema = z.object({
  nickname: nicknameSchema,
  home_zone_id: z.number().int().positive('구역을 골라 주세요.'),
  agree_terms: z.literal(true, { message: '이용약관에 동의해 주세요.' }),
  agree_eula: z.literal(true, { message: '커뮤니티 이용 규칙에 동의해 주세요.' }),
});

export const updateProfileSchema = z
  .object({
    nickname: nicknameSchema,
    home_zone_id: z.number().int().positive(),
    notify_chat: z.boolean(),
    notify_post_events: z.boolean(),
    notify_marketing: z.boolean(),
  })
  .partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
