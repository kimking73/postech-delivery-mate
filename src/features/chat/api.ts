import { LIMITS } from '@/constants/limits';
import { callRpc, USE_MOCK } from '@/lib/supabase';
import type { HostAccount, MessageRow } from '@/types/database';
import { MOCK_USER_ID, mockHostAccount, mockMessages, sleep } from '@/types/mockData';

import type { SendMessageInput } from './schema';

const mockStore: MessageRow[] = [...mockMessages];
let mockNextId = mockStore.length + 1;

/**
 * 메시지는 id 내림차순(최신 → 과거)으로 온다고 가정한다(messages_room_idx (post_id, id DESC), §2-2).
 * `beforeId`보다 작은 id만, 최대 limit개. 정렬 방향이 다르면 SV7 명세 확인 후 여기서만 맞춘다.
 */
export async function getMessages(
  postId: string,
  beforeId?: number | null,
  limit: number = LIMITS.message.pageSize,
): Promise<MessageRow[]> {
  if (USE_MOCK) {
    await sleep(150);
    return mockStore
      .filter((m) => m.post_id === postId && (beforeId == null || m.id < beforeId))
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }
  return callRpc('get_messages', { post_id: postId, before_id: beforeId ?? null, limit });
}

export async function sendMessage(input: SendMessageInput): Promise<MessageRow> {
  if (USE_MOCK) {
    await sleep(150);
    const dup = mockStore.find((m) => m.client_msg_id === input.client_msg_id);
    if (dup) return dup; // client_msg_id로 중복 전송 방지(서버 unique와 같은 동작)
    const msg: MessageRow = {
      id: mockNextId++,
      post_id: input.post_id,
      sender_id: MOCK_USER_ID,
      type: 'text',
      body: input.body,
      client_msg_id: input.client_msg_id,
      hidden_at: null,
      created_at: new Date().toISOString(),
    };
    mockStore.push(msg);
    return msg;
  }
  return callRpc('send_message', input);
}

export async function markRead(postId: string, messageId: number): Promise<void> {
  if (USE_MOCK) return;
  await callRpc('mark_read', { post_id: postId, message_id: messageId });
}

// ───────── 송금 (수동 선송금, §4) ─────────
/** 방장 계좌. 서버가 can_view_payout으로 노출 범위를 통제하므로 클라이언트는 에러 코드만 처리한다. */
export async function getHostAccount(postId: string): Promise<HostAccount | null> {
  if (USE_MOCK) {
    await sleep(100);
    return mockHostAccount;
  }
  const rows = await callRpc('get_host_account', { post_id: postId }); // returns table → 배열
  return rows[0] ?? null;
}

export async function markPaid(postId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('mark_paid', { post_id: postId });
}

export async function confirmPaid(postId: string, userId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('confirm_paid', { post_id: postId, user_id: userId });
}

export async function rejectPaid(postId: string, userId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('reject_paid', { post_id: postId, user_id: userId });
}
