/**
 * 앱에서 쓰는 행·RPC 타입 별칭 (CL2).
 * `database.ts`는 `supabase gen types`가 만든 파일이라 직접 고치지 않는다(P4 소유, CI가 최신 여부 검사).
 * 앱 코드는 이 파일의 이름만 import한다. 타입은 모두 생성된 `Database`에서 뽑으므로 스키마가 바뀌면 함께 바뀐다.
 *
 * 주의: Postgres의 `RETURNS TABLE` 열은 gen types가 전부 non-null로 만든다.
 * 실제로 null이 올 수 있는 열은 아래 RPC 행 타입에서 `| null`로 되돌린다(근거: 원본 테이블 컬럼, 아키텍처 §4).
 */
import type { Database, Enums, Tables } from './database';

type Functions = Database['public']['Functions'];

export type RpcName = keyof Functions;
/**
 * gen types는 기본값이 있는 인자를 `?: T`로만 만든다. 0005·0006의 선택 인자는 기본값이 모두 null이라
 * null을 보내는 것과 생략하는 것이 같으므로 선택 인자에 null을 허용한다(예외: limit은 숫자로 보낸다).
 */
type NullableOptional<T> = { [K in keyof T]: undefined extends T[K] ? T[K] | null : T[K] };
export type RpcArgs<N extends RpcName> = NullableOptional<Functions[N]['Args']>;
export type RpcReturns<N extends RpcName> = Functions[N]['Returns'];
export type TableName = keyof Database['public']['Tables'];
export type { Tables };

/** RETURNS TABLE / SETOF RPC의 한 행 */
type RpcRow<N extends RpcName> = RpcReturns<N> extends (infer R)[] ? R : never;
/** 지정한 열만 nullable로 되돌린다 */
type WithNullable<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | null };

// enum ----------------------------------------------------------------------
export type PostStatus = Enums<'post_status'>;
export type ParticipantRole = Enums<'participant_role'>;
export type ParticipantState = Enums<'participant_state'>;
export type PaidState = Enums<'paid_state'>;
export type MessageType = Enums<'message_type'>;
export type ReportTarget = Enums<'report_target'>;
export type ReportReason = Enums<'report_reason'>;
export type ReportStatus = Enums<'report_status'>;
export type SanctionType = Enums<'sanction_type'>;
export type PushPlatform = Enums<'push_platform'>;

// 테이블 행 ------------------------------------------------------------------
export type ZoneRow = Tables<'zones'>;
export type PickupPlaceRow = Tables<'pickup_places'>;
export type CategoryRow = Tables<'categories'>;
export type ProfileRow = Tables<'profiles'>;
export type PostRow = Tables<'posts'>;
export type ParticipantRow = Tables<'participants'>;
export type MessageRow = Tables<'messages'>;
export type PayoutAccountRow = Tables<'payout_accounts'>;
export type BlockRow = Tables<'blocks'>;

// RPC 행 ---------------------------------------------------------------------
/** get_feed 행. zone_id는 입력 인자와 이름이 겹쳐 반환에서 빠졌다(요청한 구역 그대로). */
export type FeedPost = WithNullable<
  RpcRow<'get_feed'>,
  'store_url' | 'pickup_note' | 'fee_note' | 'memo'
>;

/** get_my_rooms 행(평평한 열). 메시지가 없는 방은 last_message_*가 null, 마감 전 방은 pay_due_at이 null. */
export type RoomSummary = WithNullable<
  RpcRow<'get_my_rooms'>,
  'pay_due_at' | 'last_message_id' | 'last_message_type' | 'last_message_body' | 'last_message_at'
>;

/** get_host_account 행. 은행 계좌 또는 토스 링크 중 하나만 있을 수 있다. */
export type HostAccount = WithNullable<
  RpcRow<'get_host_account'>,
  'bank_name' | 'account_number' | 'account_holder' | 'toss_link'
>;
