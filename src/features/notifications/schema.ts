import { z } from 'zod';

export const pushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
});

export const categorySubscriptionSchema = z.object({
  zone_id: z.number().int().positive(),
  category_id: z.number().int().positive(),
});

export type PushTokenInput = z.infer<typeof pushTokenSchema>;
export type CategorySubscriptionInput = z.infer<typeof categorySubscriptionSchema>;
