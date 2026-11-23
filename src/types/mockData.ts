/**
 * 목 데이터 (CL2). 각 feature의 api.ts가 USE_MOCK일 때만 쓴다.
 * 구역·픽업 장소·카테고리는 임시 값이다(실제 값은 OP3에서 확정).
 * 이 파일은 `src/types/**` 허용 경로에 두었다. 서버 연결 후에도 FE 스토리·테스트용으로 남겨도 된다.
 */
import type {
  CategoryRow,
  FeedPost,
  HostAccount,
  MessageRow,
  PayoutAccountRow,
  PickupPlaceRow,
  PostRow,
  ProfileRow,
  RoomSummary,
  ZoneRow,
} from './database';

export const MOCK_USER_ID = '00000000-0000-4000-8000-000000000001';
const HOST_ID = '00000000-0000-4000-8000-000000000002';
const now = () => new Date().toISOString();
const inMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

export const mockZones: ZoneRow[] = [
  { id: 1, name: '구역 A', sort_order: 1, is_active: true },
  { id: 2, name: '구역 B', sort_order: 2, is_active: true },
  { id: 3, name: '구역 C', sort_order: 3, is_active: true },
];

export const mockPickupPlaces: PickupPlaceRow[] = [
  { id: 1, zone_id: 1, name: '기숙사 1층 로비', sort_order: 1, is_active: true },
  { id: 2, zone_id: 1, name: '학생회관 앞', sort_order: 2, is_active: true },
  { id: 3, zone_id: 2, name: '정문', sort_order: 1, is_active: true },
  { id: 4, zone_id: 3, name: '도서관 앞', sort_order: 1, is_active: true },
];

const categoryNames: [string, string][] = [
  ['치킨', '🍗'],
  ['피자', '🍕'],
  ['한식', '🍚'],
  ['중식', '🥟'],
  ['일식', '🍣'],
  ['분식', '🍢'],
  ['야식', '🌙'],
  ['카페·디저트', '☕'],
  ['기타', '🍽️'],
];
export const mockCategories: CategoryRow[] = categoryNames.map(([name, emoji], i) => ({
  id: i + 1,
  name,
  emoji,
  sort_order: i + 1,
}));

export const mockProfile: ProfileRow = {
  id: MOCK_USER_ID,
  nickname: '목유저',
  home_zone_id: 1,
  verified_at: now(),
  noshow_count: 0,
  notify_chat: true,
  notify_post_events: true,
  notify_marketing: false,
  eula_agreed_at: now(),
  terms_agreed_at: now(),
  is_admin: false,
  deleted_at: null,
  created_at: now(),
};

const STORE_NAMES = ['BHC 치킨', '도미노피자', '신전떡볶이', '맘스터치'];

function post(i: number, over: Partial<PostRow> = {}): PostRow {
  return {
    id: `10000000-0000-4000-8000-00000000000${i}`,
    host_id: HOST_ID,
    zone_id: 1,
    category_id: (i % 9) + 1,
    store_name: STORE_NAMES[i % STORE_NAMES.length] ?? '가게',
    store_url: 'https://example.com/store',
    pickup_place_id: 1,
    pickup_note: '1층 로비 앞',
    max_members: 4,
    member_count: 2,
    deadline_at: inMinutes(20 + i * 15),
    fee_note: '배달비 4,000원 / 최소 15,000원',
    memo: '같이 시켜요!',
    status: 'open',
    closed_at: null,
    completed_at: null,
    canceled_at: null,
    pay_due_at: null,
    pay_reminded_at: null,
    hidden_at: null,
    created_at: now(),
    ...over,
  };
}

export const mockPosts: PostRow[] = [1, 2, 3, 4].map((i) => post(i));

/** 목 데이터의 첫 번째 글(내가 참여 중인 방). 배열이 비어 있을 수 없으므로 한 번만 단언한다. */
const FIRST_POST_ID = (mockPosts[0] as PostRow).id;

export const MOCK_HOST_NICKNAME = '방장닉';

/** PostRow → get_feed 반환 행 (SV3 스텁이 돌려주는 열만 남긴다) */
export function toFeedPost(p: PostRow, hostNickname: string = MOCK_HOST_NICKNAME): FeedPost {
  return {
    id: p.id,
    host_id: p.host_id,
    host_nickname: hostNickname,
    category_id: p.category_id,
    store_name: p.store_name,
    store_url: p.store_url,
    pickup_place_id: p.pickup_place_id,
    pickup_note: p.pickup_note,
    max_members: p.max_members,
    member_count: p.member_count,
    deadline_at: p.deadline_at,
    fee_note: p.fee_note,
    memo: p.memo,
    status: p.status,
    created_at: p.created_at,
  };
}

export const mockMessages: MessageRow[] = [
  {
    id: 1,
    post_id: FIRST_POST_ID,
    sender_id: null,
    type: 'system',
    body: '방장닉님이 모집을 시작했어요',
    client_msg_id: null,
    hidden_at: null,
    created_at: now(),
  },
  {
    id: 2,
    post_id: FIRST_POST_ID,
    sender_id: HOST_ID,
    type: 'text',
    body: '안녕하세요! 7시쯤 시킬게요',
    client_msg_id: null,
    hidden_at: null,
    created_at: now(),
  },
  {
    id: 3,
    post_id: FIRST_POST_ID,
    sender_id: MOCK_USER_ID,
    type: 'text',
    body: '참여했어요~',
    client_msg_id: null,
    hidden_at: null,
    created_at: now(),
  },
];

/** PostRow + 마지막 메시지 → get_my_rooms 반환 행 */
export function toRoomSummary(
  p: PostRow,
  last: MessageRow | null,
  unread = 0,
  role: 'host' | 'member' = 'member',
): RoomSummary {
  return {
    post_id: p.id,
    store_name: p.store_name,
    category_id: p.category_id,
    status: p.status,
    role,
    paid_state: 'none',
    member_count: p.member_count,
    max_members: p.max_members,
    deadline_at: p.deadline_at,
    pay_due_at: p.pay_due_at,
    muted: false,
    last_message_id: last?.id ?? null,
    last_message_type: last?.type ?? null,
    last_message_body: last?.body ?? null,
    last_message_at: last?.created_at ?? null,
    unread_count: Math.min(unread, 99),
  };
}

/** 처음부터 참여 중인 목 방 */
export const mockJoinedPostIds: string[] = [FIRST_POST_ID];
export const mockInitialUnread: Record<string, number> = { [FIRST_POST_ID]: 2 };

export const mockPayoutAccount: PayoutAccountRow = {
  user_id: MOCK_USER_ID,
  bank_name: '카카오뱅크',
  account_number: '3333-01-1234567',
  account_holder: '홍길동',
  toss_link: null,
  updated_at: now(),
};

export const mockHostAccount: HostAccount = {
  bank_name: '카카오뱅크',
  account_number: '3333-02-7654321',
  account_holder: '김방장',
  toss_link: null,
};

/** 목 모드 응답 지연(ms). 로딩 상태를 화면에서 볼 수 있게 한다. */
export const MOCK_DELAY_MS = 300;
export const sleep = (ms = MOCK_DELAY_MS) => new Promise<void>((r) => setTimeout(r, ms));
