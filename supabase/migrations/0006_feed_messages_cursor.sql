-- SV3 후속: RPC 계약 정리 (CL2→P4 이슈, PR #3 리뷰 8번)
-- 1) get_feed 복합 커서: cursor_deadline만으로는 마감 시각이 같은 글이 페이지 경계에서 빠질 수 있다.
--    cursor_id를 추가하고 (deadline_at, id) 오름차순으로 반환한다.
-- 2) get_messages after_id: §6의 "앱 복귀 시 마지막 id 이후 채우기"용.
-- 3) report.post_id는 유지한다(noshow·unpaid를 방 단위로 세기 위해 필요, §4-3). 시그니처 변경 없음.
--
-- 인자를 추가하면 Postgres는 같은 이름의 함수를 하나 더 만든다(오버로드).
-- supabase-js 호출이 모호해지지 않도록 기존 함수를 지우고 다시 만든다.
-- 아직 스텁이므로 본문은 공통 검사 + NOT_IMPLEMENTED 그대로다.

-- ---------------------------------------------------------------------------
-- get_feed
-- ---------------------------------------------------------------------------
drop function public.get_feed(smallint, timestamptz, int);

-- 모집 중·숨김 아님·차단 관계 제외. (deadline_at, id) 오름차순.
-- 다음 페이지: 이전 페이지 마지막 행의 deadline_at, id를 cursor_deadline, cursor_id로 넘긴다.
--   조건: (deadline_at, id) > (cursor_deadline, cursor_id)
-- 첫 페이지는 둘 다 null. 둘 중 하나만 주면 INVALID_INPUT.
create function public.get_feed(
  zone_id          smallint,
  cursor_deadline  timestamptz default null,
  cursor_id        uuid        default null,
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

-- 피드 정렬·커서 조건과 같은 순서의 인덱스
drop index public.posts_feed_idx;
create index posts_feed_idx on public.posts (zone_id, deadline_at, id)
  where status = 'open' and hidden_at is null;

-- ---------------------------------------------------------------------------
-- get_messages
-- ---------------------------------------------------------------------------
drop function public.get_messages(uuid, bigint, int);

-- 참여자만.
--   - 둘 다 null: 최신 limit개, id 내림차순 (방 입장)
--   - before_id: id < before_id 중 최신 limit개, id 내림차순 (위로 스크롤)
--   - after_id:  id > after_id 중 오래된 것부터 limit개, id 오름차순 (앱 복귀 시 놓친 메시지)
--                limit개가 꽉 차면 앱은 마지막 id로 다시 부른다.
--   - 둘 다 주면 INVALID_INPUT.
create function public.get_messages(
  post_id    uuid,
  before_id  bigint default null,
  after_id   bigint default null,
  "limit"    int    default 50
) returns setof public.messages
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();
  raise exception using errcode = 'P0001', message = 'NOT_IMPLEMENTED';
end;
$$;

-- ---------------------------------------------------------------------------
-- 권한: 0005에서 기본 실행 권한을 회수했으므로 새로 만든 함수에 다시 준다.
-- ---------------------------------------------------------------------------
revoke execute on function
  public.get_feed(smallint, timestamptz, uuid, int),
  public.get_messages(uuid, bigint, bigint, int)
from public, anon;

grant execute on function
  public.get_feed(smallint, timestamptz, uuid, int),
  public.get_messages(uuid, bigint, bigint, int)
to authenticated;
