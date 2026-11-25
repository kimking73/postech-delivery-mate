import { callRpc, USE_MOCK } from '@/lib/supabase';
import { sleep } from '@/types/mockData';

import type { CategorySubscriptionInput, PushTokenInput } from './schema';

// NOTE(CL6): 권한 요청(첫 참여 직후), 토큰 해제, 포그라운드 알림 숨김, 알림 탭 이동은 CL6에서 구현한다.
// 여기에는 서버 RPC 호출만 둔다(register_push_token, subscribe_category, unsubscribe_category).

export async function registerPushToken(input: PushTokenInput): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('register_push_token', input);
}

export async function subscribeCategory(input: CategorySubscriptionInput): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('subscribe_category', input);
}

export async function unsubscribeCategory(input: CategorySubscriptionInput): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('unsubscribe_category', input);
}
