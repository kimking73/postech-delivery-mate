-- SV4 후속: 전체 코드 리뷰(2026-11-25) 반영
--   1) 기준 데이터(zones·pickup_places·categories)는 프로필이 없어도 메일 인증만 마친 POSTECH 사용자가 읽는다
--      (profile-setup 화면에서 구역을 골라야 create_profile을 부를 수 있다)
--   2) 탈퇴 설계: profiles는 auth.users에 묶지 않는다. 탈퇴하면 auth 사용자만 지우고 프로필은 익명화해 남긴다
--   3) 재가입 제재 회피 방지: deleted_accounts.blocked_until, hook은 유효한 차단만 막는다
--   4) POSTECH 메일 판정에서 '+'를 뺀다(plus 주소로 한 사람이 여러 계정을 만들지 못하게)
--   5) categories 기준 데이터(§2-2에 확정된 9종)

-- ===========================================================================
-- 4) 메일 판정 한 곳으로: is_postech_email(text)
--    로컬 부분은 영문 소문자·숫자·. _ % - 만. '+'는 허용하지 않는다.
--    내부 전용(grant 없음). hook·헬퍼(SECURITY DEFINER)가 소유자 권한으로 부른다.
-- ===========================================================================
create or replace function public.is_postech_email(p_email text)
returns boolean
language sql immutable security definer set search_path = ''
as $$
  select coalesce(lower(trim(p_email)) ~ '^[a-z0-9._%-]+@postech\.ac\.kr$', false);
$$;
revoke execute on function public.is_postech_email(text) from public, anon, authenticated;

-- ===========================================================================
-- 1) is_confirmed_postech(): JWT 메일이 POSTECH이고 메일 인증을 마쳤다(프로필은 묻지 않는다)
--    현재 사용자 자신만 답하므로 authenticated에 연다(RLS 정책에서 쓴다).
-- ===========================================================================
create or replace function public.is_confirmed_postech()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null
     and public.is_postech_email((select auth.jwt()) ->> 'email')
     and exists (
           select 1 from auth.users u
            where u.id = (select auth.uid())
              and u.email_confirmed_at is not null
         );
$$;
revoke execute on function public.is_confirmed_postech() from public, anon;
grant execute on function public.is_confirmed_postech() to authenticated;

-- is_verified_member(): 판정식만 is_postech_email로 바꾼다(그 밖의 조건은 0004와 같다)
create or replace function public.is_verified_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_postech_email((select auth.jwt()) ->> 'email')
     and exists (
           select 1
             from auth.users u
             join public.profiles p on p.id = u.id
            where u.id = (select auth.uid())
              and u.email_confirmed_at is not null
              and p.deleted_at is null
         );
$$;

-- assert_member(): 판정식만 is_postech_email로 바꾼다
create or replace function public.assert_member(p_require_profile boolean default true)
returns void
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null
     or not public.is_postech_email((select auth.jwt()) ->> 'email')
     or not exists (select 1 from auth.users u where u.id = v_uid and u.email_confirmed_at is not null) then
    raise exception using errcode = 'P0001', message = 'NOT_VERIFIED';
  end if;

  if p_require_profile and not public.is_verified_member() then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;

  if public.is_sanctioned(v_uid) then
    raise exception using errcode = 'P0001', message = 'SANCTIONED';
  end if;
end;
$$;

-- 기준 데이터 정책 교체
drop policy zones_select on public.zones;
drop policy pickup_places_select on public.pickup_places;
drop policy categories_select on public.categories;

create policy zones_select on public.zones
  for select to authenticated
  using ((select public.is_confirmed_postech()));

create policy pickup_places_select on public.pickup_places
  for select to authenticated
  using ((select public.is_confirmed_postech()));

create policy categories_select on public.categories
  for select to authenticated
  using ((select public.is_confirmed_postech()));

-- ===========================================================================
-- 2) 탈퇴 설계: profiles.id → auth.users FK를 끊는다
--    기존: ON DELETE CASCADE라 auth 사용자를 지우면 프로필이 지워지려 하고,
--          posts.host_id·participants.user_id(NO ACTION) 때문에 글·참여 이력이 있으면 삭제가 실패했다.
--    변경: delete-account는 (1) 프로필 익명화(nickname 대체, deleted_at) (2) 계좌·푸시 토큰·구독·차단 삭제
--          (3) deleted_accounts 기록 (4) auth 사용자 삭제 순서로 처리한다. 프로필 행은 남으므로
--          글·참여·메시지·제재 이력과 FK가 그대로 유지된다.
--    auth 사용자가 없는 프로필은 is_verified_member()가 false라 어떤 API로도 그 사용자로 행동할 수 없다.
-- ===========================================================================
alter table public.profiles drop constraint profiles_id_fkey;
comment on column public.profiles.id is
  'auth.users.id와 같은 값. FK는 두지 않는다(탈퇴 시 auth 사용자만 삭제하고 프로필은 익명화해 남긴다, 아키텍처 §2-2)';

-- ===========================================================================
-- 3) 재가입 제재 회피 방지
--    blocked_until: 탈퇴 시점에 유효했던 정지의 끝(영구 정지는 'infinity'). null이면 재가입 제한 없음.
--    hook은 blocked_until > now()일 때만 막는다(노쇼 3회 = 14일 정지가 탈퇴로 영구 차단이 되지 않게).
--    90일 정리 cron은 blocked_until > now()인 행을 지우지 않는다.
-- ===========================================================================
alter table public.deleted_accounts add column blocked_until timestamptz;
comment on column public.deleted_accounts.blocked_until is
  '탈퇴 시점에 유효했던 정지의 끝(영구는 infinity). 이 시각 전에는 같은 메일로 재가입할 수 없다';

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(event -> 'user' ->> 'email'));
begin
  if not public.is_postech_email(v_email) then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'POSTECH 메일(@postech.ac.kr)만 가입할 수 있습니다'));
  end if;
  if exists (select 1 from public.deleted_accounts d
              where d.email_hash = encode(extensions.digest(v_email || public.email_pepper(), 'sha256'), 'hex')
                and d.blocked_until > now()) then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', '이용이 제한된 계정입니다'));
  end if;
  return '{}'::jsonb;
end;
$$;

-- ===========================================================================
-- 5) categories 기준 데이터(§2-2). 구역·픽업 장소는 OP3에서 확정한다(로컬은 seed.sql의 임시 값).
-- ===========================================================================
insert into public.categories (name, emoji, sort_order) values
  ('치킨', '🍗', 1),
  ('피자', '🍕', 2),
  ('한식', '🍚', 3),
  ('중식', '🥟', 4),
  ('일식', '🍣', 5),
  ('분식', '🍢', 6),
  ('야식', '🌙', 7),
  ('카페·디저트', '🍰', 8),
  ('기타', '🍽️', 9)
on conflict (name) do nothing;
