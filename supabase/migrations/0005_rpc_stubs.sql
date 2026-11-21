-- SV3: RPC 시그니처 스텁 (아키텍처 §4)
-- 목적: 전 팀이 쓸 계약(이름·인자·반환 타입)을 먼저 고정해 `supabase gen types`가 가능하게 한다.
-- 본문은 공통 검사(assert_member: NOT_VERIFIED / PROFILE_REQUIRED / SANCTIONED)만 하고
-- 임시 코드 NOT_IMPLEMENTED를 던진다. 실제 구현은 후속 작업에서 create or replace로 채운다
-- (시그니처를 바꾸면 계약 변경이다: 아키텍처 §4를 먼저 고친다).
--
-- 인자 이름은 앱이 rpc('<name>', { ... })로 그대로 넘기는 이름이다(§3-3). 접두사를 붙이지 않는다.
-- 본문에서 컬럼과 이름이 겹치면 `<함수명>.<인자명>`으로 한정해서 쓴다.
-- admin_* RPC는 신고·제재 작업에서 추가한다.

-- 공통 본문 ---------------------------------------------------------------
-- perform public.assert_member();
-- raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';

-- ===========================================================================
-- 프로필·계좌
-- ===========================================================================
create or replace function public.create_profile(
  nickname      text,
  home_zone_id  smallint,
  agree_terms   boolean,
  agree_eula    boolean
) returns public.profiles
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member(false);  -- 프로필이 아직 없는 상태에서 부른다
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.update_profile(
  nickname            text     default null,
  home_zone_id        smallint default null,
  notify_chat         boolean  default null,
  notify_post_events  boolean  default null,
  notify_marketing    boolean  default null
) returns public.profiles
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- 모든 인자가 null이면 계좌 삭제
create or replace function public.set_payout_account(
  bank_name       text default null,
  account_number  text default null,
  account_holder  text default null,
  toss_link       text default null
) returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- can_view_payout(post_id)가 false면 NOT_PARTICIPANT. 계좌가 없으면 0행(앱은 maybeSingle()).
create or replace function public.get_host_account(post_id uuid)
returns table (
  bank_name       text,
  account_number  text,
  account_holder  text,
  toss_link       text
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 모집 글
-- ===========================================================================
create or replace function public.create_post(
  zone_id           smallint,
  category_id       smallint,
  store_name        text,
  pickup_place_id   smallint,
  max_members       smallint,
  deadline_minutes  int,       -- 10~180
  store_url         text default null,
  pickup_note       text default null,
  fee_note          text default null,
  memo              text default null
) returns public.posts
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.join_post(post_id uuid)
returns public.participants
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.leave_post(post_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.kick_member(post_id uuid, user_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.close_post(post_id uuid)
returns public.posts
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.complete_post(post_id uuid)
returns public.posts
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.cancel_post(post_id uuid, reason text default null)
returns public.posts
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 채팅
-- ===========================================================================
create or replace function public.send_message(post_id uuid, body text, client_msg_id uuid)
returns public.messages
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.mark_read(post_id uuid, message_id bigint)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 송금(수동)
-- ===========================================================================
create or replace function public.mark_paid(post_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.confirm_paid(post_id uuid, user_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.reject_paid(post_id uuid, user_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 조회
-- ===========================================================================
-- 모집 중·숨김 아님·차단 관계 제외. deadline_at 오름차순, cursor_deadline 이후부터.
create or replace function public.get_feed(
  zone_id          smallint,
  cursor_deadline  timestamptz default null,
  "limit"          int         default 20
) returns table (
  id               uuid,
  host_id          uuid,
  host_nickname    text,
  -- zone_id는 입력 인자와 이름이 같아 반환 열에서 뺀다(요청한 구역 그대로다)
  category_id      smallint,
  store_name       text,
  store_url        text,
  pickup_place_id  smallint,
  pickup_note      text,
  max_members      smallint,
  member_count     smallint,
  deadline_at      timestamptz,
  fee_note         text,
  memo             text,
  status           public.post_status,
  created_at       timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- 참여 중인 방 + 마지막 메시지 + 안 읽은 수(최대 99)
create or replace function public.get_my_rooms()
returns table (
  post_id            uuid,
  store_name         text,
  category_id        smallint,
  status             public.post_status,
  role               public.participant_role,
  paid_state         public.paid_state,
  member_count       smallint,
  max_members        smallint,
  deadline_at        timestamptz,
  pay_due_at         timestamptz,
  muted              boolean,
  last_message_id    bigint,
  last_message_type  public.message_type,
  last_message_body  text,
  last_message_at    timestamptz,
  unread_count       int
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- 참여자만. id 내림차순, before_id 미만부터.
create or replace function public.get_messages(
  post_id    uuid,
  before_id  bigint default null,
  "limit"    int    default 50
) returns setof public.messages
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 신고·차단
-- ===========================================================================
-- target_id: post/user는 uuid, message는 bigint를 문자열로 넘긴다.
-- noshow 신고는 target_id = 대상 사용자 id다. 어느 방인지는 post_id(선택 인자)로 받는다.
--   ※ post_id 인자는 §4 표에 없는 추가 인자다(아키텍처 반영 승인 대기, J2에서 확정).
create or replace function public.report(
  target_type  public.report_target,
  target_id    text,
  reason       public.report_reason,
  detail       text default null,
  post_id      uuid default null
) returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.block_user(user_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.unblock_user(user_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 푸시·구독
-- ===========================================================================
create or replace function public.register_push_token(token text, platform public.push_platform)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.subscribe_category(zone_id smallint, category_id smallint)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

create or replace function public.unsubscribe_category(zone_id smallint, category_id smallint)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ===========================================================================
-- 실행 권한
-- Supabase는 public 스키마의 새 함수에 anon·authenticated EXECUTE를 기본으로 준다.
-- 여기서 전부 회수한 뒤 필요한 것만 다시 준다.
-- ===========================================================================
revoke execute on all functions in schema public from public, anon, authenticated;

-- 앱이 부르는 RPC: 로그인한 사용자만
grant execute on function
  public.create_profile(text, smallint, boolean, boolean),
  public.update_profile(text, smallint, boolean, boolean, boolean),
  public.set_payout_account(text, text, text, text),
  public.get_host_account(uuid),
  public.create_post(smallint, smallint, text, smallint, smallint, int, text, text, text, text),
  public.join_post(uuid),
  public.leave_post(uuid),
  public.kick_member(uuid, uuid),
  public.close_post(uuid),
  public.complete_post(uuid),
  public.cancel_post(uuid, text),
  public.send_message(uuid, text, uuid),
  public.mark_read(uuid, bigint),
  public.mark_paid(uuid),
  public.confirm_paid(uuid, uuid),
  public.reject_paid(uuid, uuid),
  public.get_feed(smallint, timestamptz, int),
  public.get_my_rooms(),
  public.get_messages(uuid, bigint, int),
  public.report(public.report_target, text, public.report_reason, text, uuid),
  public.block_user(uuid),
  public.unblock_user(uuid),
  public.register_push_token(text, public.push_platform),
  public.subscribe_category(smallint, smallint),
  public.unsubscribe_category(smallint, smallint)
to authenticated;

-- RLS 정책에서 쓰는 헬퍼(정책은 호출자 권한으로 평가되므로 authenticated에 필요)
grant execute on function
  public.is_verified_member(),
  public.is_participant(uuid),
  public.is_blocked_between(uuid, uuid),
  public.is_sanctioned(uuid),
  public.can_view_payout(uuid)
to authenticated;

-- assert_rate, assert_clean, assert_member, email_pepper: RPC 내부(소유자 권한)에서만 쓴다 → 추가 권한 없음

-- Auth hook: supabase_auth_admin만 실행. hook이 읽는 테이블은 SECURITY DEFINER로 접근한다.
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant execute on function public.email_pepper() to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
