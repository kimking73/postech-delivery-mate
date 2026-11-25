-- SV4: RLS 정책과 직접 쓰기 차단 (아키텍처 §5)
-- 원칙
--   - 쓰기(INSERT/UPDATE/DELETE)는 RPC(SECURITY DEFINER)만 한다. anon·authenticated의 테이블 쓰기 권한을 회수한다.
--   - 읽기는 authenticated에만 정책으로 연다. 모든 정책의 전제는 is_verified_member()다(§3-1: hook이 빠져도 노출 0).
--   - auth.uid()와 헬퍼는 (select ...)로 감싸 행마다 다시 계산하지 않게 한다.
--   - 다른 테이블을 봐야 하면 헬퍼 함수(SECURITY DEFINER)를 거친다(정책끼리 재귀 방지).
-- realtime.messages 정책은 채팅 방송 작업(§6)에서 추가한다.

-- ===========================================================================
-- 헬퍼: is_admin() — 현재 사용자 본인이 관리자인지. 남의 id를 받지 않으므로 API로 열어도 된다.
-- ===========================================================================
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_verified_member()
     and exists (
           select 1 from public.profiles p
            where p.id = (select auth.uid())
              and p.is_admin
              and p.deleted_at is null
         );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ===========================================================================
-- 테이블 권한: 직접 쓰기 회수
-- ===========================================================================
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;
-- anon은 아무것도 읽지 않는다(정책도 authenticated에만 준다). 이중 방어로 SELECT도 회수.
revoke select on all tables in schema public from anon;
-- 함수 내부에서만 쓰는 테이블은 authenticated도 읽을 수 없다(§5 "없음").
revoke select on public.banned_words, public.deleted_accounts, public.rate_events from authenticated;
-- identity 시퀀스도 직접 쓸 일이 없다.
revoke all on all sequences in schema public from anon, authenticated;

-- 앞으로 만드는 테이블·뷰·시퀀스도 같은 상태로 시작한다(Supabase 기본값은 anon·authenticated 전체 권한).
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke select on tables from anon;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

-- ===========================================================================
-- SELECT 정책 (모두 to authenticated)
-- ===========================================================================

-- 기준 데이터: 인증된 회원
create policy zones_select on public.zones
  for select to authenticated
  using ((select public.is_verified_member()));

create policy pickup_places_select on public.pickup_places
  for select to authenticated
  using ((select public.is_verified_member()));

create policy categories_select on public.categories
  for select to authenticated
  using ((select public.is_verified_member()));

-- profiles: 테이블은 자기 행(전체 컬럼)만. 다른 사람은 public_profiles 뷰로 본다.
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select public.is_verified_member()) and id = (select auth.uid()));

-- posts: 숨기지 않은 글 + 자기가 참여 중인 글(숨김이어도)
create policy posts_select on public.posts
  for select to authenticated
  using ((select public.is_verified_member()) and (hidden_at is null or public.is_participant(id)));

-- participants: 같은 글의 참여자(joined)끼리
create policy participants_select on public.participants
  for select to authenticated
  using ((select public.is_verified_member()) and public.is_participant(post_id));

-- messages: 참여자 + (숨김 아님 또는 본인 메시지)
create policy messages_select on public.messages
  for select to authenticated
  using ((select public.is_verified_member())
         and public.is_participant(post_id)
         and (hidden_at is null or sender_id = (select auth.uid())));

-- payout_accounts: 본인 행만. 남의 계좌는 get_host_account(can_view_payout)로만.
create policy payout_accounts_select_own on public.payout_accounts
  for select to authenticated
  using ((select public.is_verified_member()) and user_id = (select auth.uid()));

-- reports: 본인이 낸 것, 관리자
create policy reports_select on public.reports
  for select to authenticated
  using ((select public.is_verified_member())
         and (reporter_id = (select auth.uid()) or (select public.is_admin())));

-- sanctions: 본인, 관리자
create policy sanctions_select on public.sanctions
  for select to authenticated
  using ((select public.is_verified_member())
         and (user_id = (select auth.uid()) or (select public.is_admin())));

-- blocks, push_tokens, category_subscriptions: 본인 행
create policy blocks_select_own on public.blocks
  for select to authenticated
  using ((select public.is_verified_member()) and blocker_id = (select auth.uid()));

create policy push_tokens_select_own on public.push_tokens
  for select to authenticated
  using ((select public.is_verified_member()) and user_id = (select auth.uid()));

create policy category_subscriptions_select_own on public.category_subscriptions
  for select to authenticated
  using ((select public.is_verified_member()) and user_id = (select auth.uid()));

-- banned_words, deleted_accounts, rate_events: 정책 없음(RLS on + 권한 회수) → 함수 내부에서만

-- ===========================================================================
-- public_profiles: 다른 사용자에게 보이는 프로필(§5)
--   id, nickname, noshow_level(노쇼 횟수 범주: 0회 none / 1~2회 some / 3회 이상 many)
--   뷰 소유자(postgres) 권한으로 profiles를 읽으므로 profiles의 자기 행 정책과 무관하게 모든 행이 보인다.
--   대신 뷰 안에서 is_verified_member()를 검사해 미인증 사용자에게는 0행이다.
--   탈퇴한 사용자도 지난 메시지의 발신자 표시를 위해 남긴다(닉네임은 delete-account가 익명화한다).
-- ===========================================================================
create view public.public_profiles
  with (security_barrier = true)
as
  select p.id,
         p.nickname,
         case
           when p.noshow_count = 0 then 'none'
           when p.noshow_count < 3 then 'some'
           else 'many'
         end::text as noshow_level
    from public.profiles p
   where (select public.is_verified_member());

comment on view public.public_profiles is
  '다른 사용자에게 공개하는 프로필(id, nickname, noshow_level). 미인증 사용자에게는 0행.';

revoke all on public.public_profiles from public, anon, authenticated;
grant select on public.public_profiles to authenticated;
