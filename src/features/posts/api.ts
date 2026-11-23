import { LIMITS } from '@/constants/limits';
import { AppError, toAppError } from '@/lib/errors';
import { callRpc, selectRows, supabase, USE_MOCK } from '@/lib/supabase';
import type {
  CategoryRow,
  FeedPost,
  ParticipantRow,
  PayoutAccountRow,
  PickupPlaceRow,
  PostRow,
  RoomSummary,
  ZoneRow,
} from '@/types/database';
import {
  MOCK_USER_ID,
  mockCategories,
  mockInitialUnread,
  mockJoinedPostIds,
  mockMessages,
  mockPayoutAccount,
  mockPickupPlaces,
  mockPosts,
  mockZones,
  sleep,
  toFeedPost,
  toRoomSummary,
} from '@/types/mockData';

import type { CreatePostInput, PayoutAccountInput } from './schema';

// ───────── 참조 데이터 (구역·카테고리·픽업 장소) ─────────
export async function getZones(): Promise<ZoneRow[]> {
  if (USE_MOCK) return mockZones;
  const rows = await selectRows<'zones'>(() =>
    supabase.from('zones').select('*').eq('is_active', true).order('sort_order'),
  );
  return rows;
}

export async function getCategories(): Promise<CategoryRow[]> {
  if (USE_MOCK) return mockCategories;
  return selectRows<'categories'>(() =>
    supabase.from('categories').select('*').order('sort_order'),
  );
}

export async function getPickupPlaces(zoneId: number): Promise<PickupPlaceRow[]> {
  if (USE_MOCK) return mockPickupPlaces.filter((p) => p.zone_id === zoneId);
  return selectRows<'pickup_places'>(() =>
    supabase
      .from('pickup_places')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('is_active', true)
      .order('sort_order'),
  );
}

// ───────── 피드·글 ─────────
// 목 상태는 모듈 안에서만 바뀐다(앱을 다시 켜면 초기화).
const mockPostState = new Map<string, PostRow>(mockPosts.map((p) => [p.id, p]));
const mockJoined = new Set<string>(mockJoinedPostIds);
const mockHostNicknames = new Map<string, string>(); // 내가 만든 글의 방장 닉네임

export async function getFeed(
  zoneId: number,
  cursorDeadline?: string | null,
  limit: number = LIMITS.feed.pageSize,
): Promise<FeedPost[]> {
  if (USE_MOCK) {
    await sleep();
    // 서버(get_feed)와 같이: 모집 중, 숨김 아님, 마감 시각 오름차순, 커서 이후부터
    return [...mockPostState.values()]
      .filter((p) => p.zone_id === zoneId && p.status === 'open' && !p.hidden_at)
      .filter((p) => !cursorDeadline || p.deadline_at > cursorDeadline)
      .sort((a, b) => a.deadline_at.localeCompare(b.deadline_at))
      .slice(0, limit)
      .map((p) => toFeedPost(p, mockHostNicknames.get(p.id)));
  }
  return callRpc('get_feed', { zone_id: zoneId, cursor_deadline: cursorDeadline ?? null, limit });
}

export async function getPost(postId: string): Promise<PostRow> {
  if (USE_MOCK) {
    await sleep(100);
    const p = mockPostState.get(postId);
    if (!p) throw new AppError('POST_NOT_FOUND');
    return p;
  }
  const { data, error } = await supabase.from('posts').select('*').eq('id', postId).maybeSingle();
  if (error) throw toAppError(error);
  if (!data) throw new AppError('POST_NOT_FOUND');
  return data as PostRow;
}

export async function createPost(input: CreatePostInput): Promise<PostRow> {
  if (USE_MOCK) {
    await sleep();
    const id = `20000000-0000-4000-8000-${String(Date.now()).padStart(12, '0').slice(-12)}`;
    const now = new Date();
    const post: PostRow = {
      id,
      host_id: MOCK_USER_ID,
      zone_id: input.zone_id,
      category_id: input.category_id,
      store_name: input.store_name,
      store_url: input.store_url ?? null,
      pickup_place_id: input.pickup_place_id,
      pickup_note: input.pickup_note ?? null,
      max_members: input.max_members,
      member_count: 1,
      deadline_at: new Date(now.getTime() + input.deadline_minutes * 60_000).toISOString(),
      fee_note: input.fee_note ?? null,
      memo: input.memo ?? null,
      status: 'open',
      closed_at: null,
      completed_at: null,
      canceled_at: null,
      pay_due_at: null,
      pay_reminded_at: null,
      hidden_at: null,
      created_at: now.toISOString(),
    };
    mockPostState.set(id, post);
    mockHostNicknames.set(id, '목유저');
    mockJoined.add(id);
    return post;
  }
  return callRpc('create_post', input);
}

function mockPatch(postId: string, patch: Partial<PostRow>): PostRow {
  const p = mockPostState.get(postId);
  if (!p) throw new AppError('POST_NOT_FOUND');
  const next = { ...p, ...patch };
  mockPostState.set(postId, next);
  return next;
}

export async function joinPost(postId: string): Promise<ParticipantRow> {
  if (USE_MOCK) {
    await sleep();
    const p = mockPostState.get(postId);
    if (!p) throw new AppError('POST_NOT_FOUND');
    if (p.status !== 'open') throw new AppError('POST_CLOSED');
    if (p.member_count >= p.max_members) throw new AppError('POST_FULL');
    if (!mockJoined.has(postId)) {
      mockJoined.add(postId);
      mockPatch(postId, { member_count: p.member_count + 1 });
    }
    return {
      post_id: postId,
      user_id: MOCK_USER_ID,
      role: 'member',
      state: 'joined',
      paid_state: 'none',
      paid_at: null,
      muted: false,
      last_read_message_id: 0,
      joined_at: new Date().toISOString(),
      left_at: null,
    };
  }
  return callRpc('join_post', { post_id: postId });
}

export async function leavePost(postId: string): Promise<void> {
  if (USE_MOCK) {
    await sleep();
    const p = mockPostState.get(postId);
    if (p && mockJoined.delete(postId))
      mockPatch(postId, { member_count: Math.max(1, p.member_count - 1) });
    return;
  }
  await callRpc('leave_post', { post_id: postId });
}

export async function kickMember(postId: string, userId: string): Promise<void> {
  if (USE_MOCK) return sleep();
  await callRpc('kick_member', { post_id: postId, user_id: userId });
}

export async function closePost(postId: string): Promise<PostRow> {
  if (USE_MOCK) {
    await sleep();
    const now = new Date();
    return mockPatch(postId, {
      status: 'closed',
      closed_at: now.toISOString(),
      pay_due_at: new Date(now.getTime() + LIMITS.payDueMinutes * 60_000).toISOString(),
    });
  }
  return callRpc('close_post', { post_id: postId });
}

export async function completePost(postId: string): Promise<PostRow> {
  if (USE_MOCK) {
    await sleep();
    return mockPatch(postId, { status: 'completed', completed_at: new Date().toISOString() });
  }
  return callRpc('complete_post', { post_id: postId });
}

export async function cancelPost(postId: string, reason?: string | null): Promise<PostRow> {
  if (USE_MOCK) {
    await sleep();
    return mockPatch(postId, { status: 'canceled', canceled_at: new Date().toISOString() });
  }
  return callRpc('cancel_post', { post_id: postId, reason: reason ?? null });
}

export async function getMyRooms(): Promise<RoomSummary[]> {
  if (USE_MOCK) {
    await sleep();
    return [...mockJoined].flatMap((id) => {
      const post = mockPostState.get(id);
      if (!post) return [];
      const last =
        mockMessages.filter((m) => m.post_id === id).sort((a, b) => b.id - a.id)[0] ?? null;
      const role = post.host_id === MOCK_USER_ID ? 'host' : 'member';
      return [toRoomSummary(post, last, mockInitialUnread[id] ?? 0, role)];
    });
  }
  return callRpc('get_my_rooms');
}

// ───────── 송금받을 계좌 (본인) ─────────
let mockPayout: PayoutAccountRow | null = mockPayoutAccount;

export async function getPayoutAccount(userId: string): Promise<PayoutAccountRow | null> {
  if (USE_MOCK) {
    await sleep(100);
    return mockPayout;
  }
  const { data, error } = await supabase
    .from('payout_accounts')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw toAppError(error);
  return (data as PayoutAccountRow | null) ?? null;
}

/** 모두 비어 있으면 삭제(서버 규칙). */
export async function setPayoutAccount(input: PayoutAccountInput): Promise<void> {
  if (USE_MOCK) {
    await sleep();
    const empty =
      !input.bank_name && !input.account_number && !input.account_holder && !input.toss_link;
    mockPayout = empty
      ? null
      : {
          user_id: MOCK_USER_ID,
          bank_name: input.bank_name ?? null,
          account_number: input.account_number ?? null,
          account_holder: input.account_holder ?? null,
          toss_link: input.toss_link ?? null,
          updated_at: new Date().toISOString(),
        };
    return;
  }
  await callRpc('set_payout_account', input);
}
