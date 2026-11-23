/**
 * 임시 수기 타입 (CL2). 아키텍처 §2-2(테이블), §4(RPC)를 옮기고,
 * RPC 시그니처·반환 열은 feat/sv-SV3-contract-stubs의 0005_rpc_stubs.sql(2026-11-22 기준)에 맞췄다.
 * SV3 머지 후 `supabase gen types typescript` 결과로 이 파일을 통째로 교체한다.
 * 교체해도 앱 코드가 깨지지 않도록 아래 이름(Database, Tables, Enums, Rpc*)만 쓴다.
 * 이 파일의 소유자는 P4(SV)이므로, 교체 후에는 직접 고치지 않는다.
 */

export type PostStatus = 'open' | 'closed' | 'completed' | 'canceled';
export type ParticipantRole = 'host' | 'member';
export type ParticipantState = 'joined' | 'left' | 'dropped' | 'kicked';
export type PaidState = 'none' | 'sent' | 'confirmed';
export type MessageType = 'text' | 'system';
export type ReportTarget = 'post' | 'message' | 'user' | 'noshow';
export type ReportReason =
  'spam' | 'abuse' | 'scam' | 'inappropriate' | 'noshow' | 'unpaid' | 'other';
export type ReportStatus = 'pending' | 'actioned' | 'dismissed';
export type SanctionType = 'warn' | 'suspend' | 'ban';
export type PushPlatform = 'ios' | 'android';

type Uuid = string;
type Timestamp = string; // ISO 8601 (UTC)

export interface ZoneRow {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface PickupPlaceRow {
  id: number;
  zone_id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryRow {
  id: number;
  name: string;
  emoji: string | null;
  sort_order: number;
}

export interface ProfileRow {
  id: Uuid;
  nickname: string;
  home_zone_id: number | null;
  verified_at: Timestamp | null;
  noshow_count: number;
  notify_chat: boolean;
  notify_post_events: boolean;
  notify_marketing: boolean;
  eula_agreed_at: Timestamp | null;
  terms_agreed_at: Timestamp | null;
  is_admin: boolean;
  deleted_at: Timestamp | null;
  created_at: Timestamp;
}

export interface PostRow {
  id: Uuid;
  host_id: Uuid;
  zone_id: number;
  category_id: number;
  store_name: string;
  store_url: string | null;
  pickup_place_id: number;
  pickup_note: string | null;
  max_members: number;
  member_count: number;
  deadline_at: Timestamp;
  fee_note: string | null;
  memo: string | null;
  status: PostStatus;
  closed_at: Timestamp | null;
  completed_at: Timestamp | null;
  canceled_at: Timestamp | null;
  pay_due_at: Timestamp | null;
  pay_reminded_at: Timestamp | null;
  hidden_at: Timestamp | null;
  created_at: Timestamp;
}

export interface ParticipantRow {
  post_id: Uuid;
  user_id: Uuid;
  role: ParticipantRole;
  state: ParticipantState;
  paid_state: PaidState;
  paid_at: Timestamp | null;
  muted: boolean;
  last_read_message_id: number;
  joined_at: Timestamp;
  left_at: Timestamp | null;
}

export interface MessageRow {
  id: number;
  post_id: Uuid;
  sender_id: Uuid | null; // 시스템 메시지는 null
  type: MessageType;
  body: string;
  client_msg_id: Uuid | null;
  hidden_at: Timestamp | null;
  created_at: Timestamp;
}

export interface PayoutAccountRow {
  user_id: Uuid;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  toss_link: string | null;
  updated_at: Timestamp;
}

export interface BlockRow {
  blocker_id: Uuid;
  blocked_id: Uuid;
  created_at: Timestamp;
}

/**
 * get_feed 반환 행. SV3 스텁이 돌려주는 열만 담는다.
 * zone_id는 입력 인자와 이름이 겹쳐 반환에서 빠졌다(요청한 구역 그대로). hidden_at·closed_at·pay_due_at 등도 없다.
 */
export interface FeedPost {
  id: Uuid;
  host_id: Uuid;
  host_nickname: string;
  category_id: number;
  store_name: string;
  store_url: string | null;
  pickup_place_id: number;
  pickup_note: string | null;
  max_members: number;
  member_count: number;
  deadline_at: Timestamp;
  fee_note: string | null;
  memo: string | null;
  status: PostStatus;
  created_at: Timestamp;
}

/** get_my_rooms 반환 행 (평평한 열). 마지막 메시지가 없는 방은 last_message_* 가 null이다. */
export interface RoomSummary {
  post_id: Uuid;
  store_name: string;
  category_id: number;
  status: PostStatus;
  role: ParticipantRole;
  paid_state: PaidState;
  member_count: number;
  max_members: number;
  deadline_at: Timestamp;
  pay_due_at: Timestamp | null;
  muted: boolean;
  last_message_id: number | null;
  last_message_type: MessageType | null;
  last_message_body: string | null;
  last_message_at: Timestamp | null;
  unread_count: number; // 최대 99
}

export interface HostAccount {
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  toss_link: string | null;
}

export interface Database {
  public: {
    Tables: {
      zones: { Row: ZoneRow };
      pickup_places: { Row: PickupPlaceRow };
      categories: { Row: CategoryRow };
      profiles: { Row: ProfileRow };
      posts: { Row: PostRow };
      participants: { Row: ParticipantRow };
      messages: { Row: MessageRow };
      payout_accounts: { Row: PayoutAccountRow };
      blocks: { Row: BlockRow };
    };
    Functions: {
      create_profile: {
        Args: { nickname: string; home_zone_id: number; agree_terms: boolean; agree_eula: boolean };
        Returns: ProfileRow;
      };
      set_payout_account: {
        Args: {
          bank_name?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          toss_link?: string | null;
        };
        Returns: undefined;
      };
      /** returns table → 행 배열로 온다(권한이 있고 계좌가 있으면 1행, 없으면 빈 배열). */
      get_host_account: { Args: { post_id: Uuid }; Returns: HostAccount[] };
      update_profile: {
        Args: {
          nickname?: string;
          home_zone_id?: number;
          notify_chat?: boolean;
          notify_post_events?: boolean;
          notify_marketing?: boolean;
        };
        Returns: ProfileRow;
      };
      create_post: {
        Args: {
          zone_id: number;
          category_id: number;
          store_name: string;
          store_url?: string | null;
          pickup_place_id: number;
          pickup_note?: string | null;
          max_members: number;
          deadline_minutes: number;
          fee_note?: string | null;
          memo?: string | null;
        };
        Returns: PostRow;
      };
      join_post: { Args: { post_id: Uuid }; Returns: ParticipantRow };
      leave_post: { Args: { post_id: Uuid }; Returns: undefined };
      kick_member: { Args: { post_id: Uuid; user_id: Uuid }; Returns: undefined };
      close_post: { Args: { post_id: Uuid }; Returns: PostRow };
      complete_post: { Args: { post_id: Uuid }; Returns: PostRow };
      cancel_post: { Args: { post_id: Uuid; reason?: string | null }; Returns: PostRow };
      send_message: {
        Args: { post_id: Uuid; body: string; client_msg_id: Uuid };
        Returns: MessageRow;
      };
      mark_read: { Args: { post_id: Uuid; message_id: number }; Returns: undefined };
      mark_paid: { Args: { post_id: Uuid }; Returns: undefined };
      confirm_paid: { Args: { post_id: Uuid; user_id: Uuid }; Returns: undefined };
      reject_paid: { Args: { post_id: Uuid; user_id: Uuid }; Returns: undefined };
      get_feed: {
        Args: { zone_id: number; cursor_deadline?: Timestamp | null; limit?: number };
        Returns: FeedPost[];
      };
      get_my_rooms: { Args: Record<string, never>; Returns: RoomSummary[] };
      get_messages: {
        Args: { post_id: Uuid; before_id?: number | null; limit?: number };
        Returns: MessageRow[];
      };
      report: {
        Args: {
          target_type: ReportTarget;
          target_id: string;
          reason: ReportReason;
          detail?: string | null;
          /** noshow 신고는 어느 방인지 필요하다. §4 표에 없는 추가 인자(승인 대기, J2에서 확정). */
          post_id?: Uuid | null;
        };
        Returns: undefined;
      };
      block_user: { Args: { user_id: Uuid }; Returns: undefined };
      unblock_user: { Args: { user_id: Uuid }; Returns: undefined };
      register_push_token: { Args: { token: string; platform: PushPlatform }; Returns: undefined };
      subscribe_category: { Args: { zone_id: number; category_id: number }; Returns: undefined };
      unsubscribe_category: { Args: { zone_id: number; category_id: number }; Returns: undefined };
    };
    Enums: {
      post_status: PostStatus;
      participant_role: ParticipantRole;
      participant_state: ParticipantState;
      paid_state: PaidState;
      message_type: MessageType;
      report_target: ReportTarget;
      report_reason: ReportReason;
      report_status: ReportStatus;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type RpcName = keyof Database['public']['Functions'];
export type RpcArgs<N extends RpcName> = Database['public']['Functions'][N]['Args'];
export type RpcReturns<N extends RpcName> = Database['public']['Functions'][N]['Returns'];
