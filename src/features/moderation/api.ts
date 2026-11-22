import { callRpc, USE_MOCK } from '@/lib/supabase';
import { sleep } from '@/types/mockData';

import type { ReportInput } from './schema';

// NOTE(CL7a): 차단 목록 조회(blocked.tsx), 차단 사용자 메시지 접기 처리는 CL7a에서 추가한다.

export async function report(input: ReportInput): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('report', { ...input, detail: input.detail ?? null, post_id: input.post_id ?? null });
}

export async function blockUser(userId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('block_user', { user_id: userId });
}

export async function unblockUser(userId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('unblock_user', { user_id: userId });
}
