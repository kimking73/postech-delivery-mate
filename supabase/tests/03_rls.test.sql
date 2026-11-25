-- SV4: RLS 정책과 직접 쓰기 차단 (아키텍처 §5)
-- 테이블마다 허용 1개 이상, 거부 1개 이상. 미인증 토큰은 어느 테이블도 0건.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(44);

-- ---------------------------------------------------------------------------
-- 준비(postgres 권한)
--   a: 방장, b: 멤버, c: 나간 사람·p3 방장, x: 관리자, e: 메일 미인증(프로필 없음), n: 메일 인증 완료·프로필 없음
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, aud, role) values
  ('00000000-0000-0000-0000-00000000000a', 'host@postech.ac.kr',    now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'member@postech.ac.kr',  now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000c', 'outsider@postech.ac.kr', now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@postech.ac.kr',   now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000e', 'pending@postech.ac.kr', null,  'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000f', 'newbie@postech.ac.kr',  now(), 'authenticated', 'authenticated');

insert into public.profiles (id, nickname, noshow_count, is_admin) values
  ('00000000-0000-0000-0000-00000000000a', 'host',     0, false),
  ('00000000-0000-0000-0000-00000000000b', 'member',   0, false),
  ('00000000-0000-0000-0000-00000000000c', 'outsider', 1, false),
  ('00000000-0000-0000-0000-0000000000ad', 'admin',    3, true);

-- 기준 데이터(seed·0009 categories)를 비우고 테스트용 값만 넣는다(트랜잭션이라 끝나면 되돌아간다)
delete from public.pickup_places; delete from public.zones; delete from public.categories;
insert into public.zones (id, name) values (1, '테스트구역');
insert into public.categories (id, name) values (1, '치킨');
insert into public.pickup_places (id, zone_id, name) values (1, 1, '로비');

insert into public.posts (id, host_id, zone_id, category_id, store_name, pickup_place_id, max_members, member_count, deadline_at, hidden_at) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 1, 1, '공개글', 1, 4, 2, now() + interval '30 minutes', null),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 1, 1, '숨김글', 1, 4, 2, now() + interval '30 minutes', now()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000c', 1, 1, 'c의글',  1, 4, 1, now() + interval '30 minutes', null);

insert into public.participants (post_id, user_id, role, state) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'host',   'joined'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'member', 'joined'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'member', 'left'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'host',   'joined'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', 'member', 'joined'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000c', 'host',   'joined');

insert into public.messages (post_id, sender_id, body, hidden_at) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'm1-공개',     null),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'm2-a숨김',    now()),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'm3-b숨김',    now()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000c', 'm4-c방',      null);

insert into public.payout_accounts (user_id, bank_name, account_number, account_holder, toss_link) values
  ('00000000-0000-0000-0000-00000000000a', '테스트은행', '123-456-7890', '방장', null),
  ('00000000-0000-0000-0000-00000000000b', null, null, null, 'https://toss.me/member');

insert into public.reports (reporter_id, target_type, target_post_id, target_user_id, reason) values
  ('00000000-0000-0000-0000-00000000000b', 'post', '10000000-0000-0000-0000-000000000003', null, 'spam'),
  ('00000000-0000-0000-0000-00000000000c', 'user', null, '00000000-0000-0000-0000-00000000000a', 'abuse');

insert into public.sanctions (user_id, type) values ('00000000-0000-0000-0000-00000000000c', 'warn');
insert into public.blocks (blocker_id, blocked_id) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000c');
insert into public.push_tokens (user_id, expo_token, platform) values
  ('00000000-0000-0000-0000-00000000000a', 'ExponentPushToken[a]', 'ios'),
  ('00000000-0000-0000-0000-00000000000b', 'ExponentPushToken[b]', 'android');
insert into public.category_subscriptions (user_id, zone_id, category_id) values
  ('00000000-0000-0000-0000-00000000000a', 1, 1),
  ('00000000-0000-0000-0000-00000000000b', 1, 1);
insert into public.banned_words (word) values ('나쁜말');
insert into public.rate_events (user_id, action) values ('00000000-0000-0000-0000-00000000000b', 't');

-- 호출자 권한으로 각 테이블 행 수를 센다(security_invoker라 RLS가 그대로 적용된다).
-- banned_words·deleted_accounts·rate_events는 SELECT 권한 자체가 없어 아래에서 따로 본다.
create temp view rls_counts with (security_invoker = true) as
  select 'zones'::text as t,                  (select count(*) from public.zones)::int as n
  union all select 'pickup_places',           (select count(*) from public.pickup_places)::int
  union all select 'categories',              (select count(*) from public.categories)::int
  union all select 'profiles',                (select count(*) from public.profiles)::int
  union all select 'public_profiles',         (select count(*) from public.public_profiles)::int
  union all select 'posts',                   (select count(*) from public.posts)::int
  union all select 'participants',            (select count(*) from public.participants)::int
  union all select 'messages',                (select count(*) from public.messages)::int
  union all select 'payout_accounts',         (select count(*) from public.payout_accounts)::int
  union all select 'reports',                 (select count(*) from public.reports)::int
  union all select 'sanctions',               (select count(*) from public.sanctions)::int
  union all select 'blocks',                  (select count(*) from public.blocks)::int
  union all select 'push_tokens',             (select count(*) from public.push_tokens)::int
  union all select 'category_subscriptions',  (select count(*) from public.category_subscriptions)::int;
grant select on rls_counts to authenticated;

-- ===========================================================================
-- 미인증 토큰: 어느 테이블도 0건 (§3-1 "hook이 빠져도 데이터는 노출되지 않는다")
-- ===========================================================================
set local role authenticated;

select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select is(array(select t from rls_counts where n > 0), '{}'::text[], '토큰 없음(sub 없음): 모든 테이블 0건');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000e","email":"pending@postech.ac.kr","role":"authenticated"}', true);
select is(array(select t from rls_counts where n > 0), '{}'::text[], '메일 미인증 토큰: 모든 테이블 0건');

-- 메일 인증은 마쳤지만 프로필이 없는 사용자(profile-setup 화면): 기준 데이터만 읽는다
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000f","email":"newbie@postech.ac.kr","role":"authenticated"}', true);
select is(array(select t from rls_counts where n > 0 order by t), array['categories', 'pickup_places', 'zones'],
  '프로필 없는 인증 사용자: zones·pickup_places·categories만 읽는다(구역을 골라 create_profile 가능)');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000f","email":"newbie+2@postech.ac.kr","role":"authenticated"}', true);
select is(array(select t from rls_counts where n > 0), '{}'::text[], 'plus 주소(+) 메일 토큰: 모든 테이블 0건');

-- hook 누락 사고 가정: 프로필까지 있는 사용자지만 JWT 메일이 POSTECH가 아니다
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@gmail.com","role":"authenticated"}', true);
select is(array(select t from rls_counts where n > 0), '{}'::text[], 'POSTECH가 아닌 메일 토큰: 모든 테이블 0건');

-- ===========================================================================
-- b(멤버)
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@postech.ac.kr","role":"authenticated"}', true);

select is((select count(*)::int from public.zones), 1, 'zones: 인증된 회원은 읽는다');
select is((select count(*)::int from public.categories), 1, 'categories: 인증된 회원은 읽는다');
select is((select count(*)::int from public.pickup_places), 1, 'pickup_places: 인증된 회원은 읽는다');

select is(array(select id::text from public.profiles), array['00000000-0000-0000-0000-00000000000b'],
          'profiles: 테이블은 자기 행만 보인다');
select is((select count(*)::int from public.public_profiles), 4, 'public_profiles: 다른 회원 프로필은 뷰로 보인다');
select is(array(select nickname || ':' || noshow_level from public.public_profiles order by nickname),
          array['admin:many', 'host:none', 'member:none', 'outsider:some'],
          'public_profiles: noshow_level은 0 none / 1~2 some / 3+ many');
select is(array(select column_name::text from information_schema.columns
                 where table_schema = 'public' and table_name = 'public_profiles' order by ordinal_position),
          array['id', 'nickname', 'noshow_level'], 'public_profiles는 id, nickname, noshow_level만 노출한다');

select is(array(select store_name from public.posts order by store_name), array['c의글', '공개글', '숨김글'],
          'posts: 숨기지 않은 글 + 참여 중인 숨김 글이 보인다');
select is((select count(*)::int from public.participants), 5, 'participants: 내가 참여 중인 글(p1·p2)의 참여자만 보인다');
select is(array(select body from public.messages order by id), array['m1-공개', 'm3-b숨김'],
          'messages: 참여 중인 방의 숨기지 않은 메시지 + 숨겨진 본인 메시지만 보인다');
select is(array(select user_id::text from public.payout_accounts), array['00000000-0000-0000-0000-00000000000b'],
          'payout_accounts: 본인 계좌만 보인다(방장 계좌는 직접 못 읽는다)');
select is((select count(*)::int from public.reports), 1, 'reports: 본인이 낸 신고만 보인다');
select is((select count(*)::int from public.sanctions), 0, 'sanctions: 남의 제재는 보이지 않는다');
select is((select count(*)::int from public.blocks), 0, 'blocks: 남의 차단 목록은 보이지 않는다');
select is((select count(*)::int from public.push_tokens), 1, 'push_tokens: 본인 토큰만 보인다');
select is((select count(*)::int from public.category_subscriptions), 1, 'category_subscriptions: 본인 구독만 보인다');
select ok(not public.is_admin(), 'is_admin(): 일반 회원은 false');

-- ===========================================================================
-- c(p1에서 나감, p3 방장, 경고 1건, a에게 차단당함)
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","email":"outsider@postech.ac.kr","role":"authenticated"}', true);

select is(array(select store_name from public.posts order by store_name), array['c의글', '공개글'],
          'posts: 참여하지 않은 숨김 글은 보이지 않는다');
select is(array(select post_id::text from public.participants), array['10000000-0000-0000-0000-000000000003'],
          'participants: 나간 방(left)의 참여자는 보이지 않는다');
select is(array(select body from public.messages), array['m4-c방'], 'messages: 나간 방의 메시지는 보이지 않는다');
select is((select count(*)::int from public.sanctions), 1, 'sanctions: 본인 제재는 보인다');
select is((select count(*)::int from public.blocks), 0, 'blocks: 나를 차단한 기록은 보이지 않는다');
select is((select count(*)::int from public.payout_accounts), 0, 'payout_accounts: 계좌가 없으면 0건(남의 계좌 안 보임)');

-- ===========================================================================
-- a(방장, c를 차단)
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","email":"host@postech.ac.kr","role":"authenticated"}', true);
select is((select count(*)::int from public.blocks), 1, 'blocks: 본인 차단 목록은 보인다');
select is((select count(*)::int from public.reports), 0, 'reports: 나를 대상으로 한 신고는 보이지 않는다');

-- ===========================================================================
-- 관리자
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000ad","email":"admin@postech.ac.kr","role":"authenticated"}', true);
select ok(public.is_admin(), 'is_admin(): 관리자는 true');
select is((select count(*)::int from public.reports), 2, 'reports: 관리자는 모든 신고를 본다');
select is((select count(*)::int from public.sanctions), 1, 'sanctions: 관리자는 모든 제재를 본다');

-- ===========================================================================
-- 직접 쓰기 차단(정상 회원 b)
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@postech.ac.kr","role":"authenticated"}', true);

select throws_ok($$ update public.profiles set is_admin = true where id = '00000000-0000-0000-0000-00000000000b' $$,
                 '42501', null, 'profiles: 본인 행이라도 직접 UPDATE 불가(is_admin 상승 차단)');
select throws_ok($$ insert into public.posts (host_id, zone_id, category_id, store_name, pickup_place_id, max_members, deadline_at)
                    values ('00000000-0000-0000-0000-00000000000b', 1, 1, 'x', 1, 2, now() + interval '20 minutes') $$,
                 '42501', null, 'posts: 직접 INSERT 불가');
select throws_ok($$ update public.participants set paid_state = 'confirmed' where user_id = '00000000-0000-0000-0000-00000000000b' $$,
                 '42501', null, 'participants: 직접 UPDATE 불가');
select throws_ok($$ delete from public.messages $$, '42501', null, 'messages: 직접 DELETE 불가');
select throws_ok($$ insert into public.payout_accounts (user_id, toss_link) values ('00000000-0000-0000-0000-00000000000b', 'https://toss.me/x')
                    on conflict (user_id) do update set toss_link = excluded.toss_link $$,
                 '42501', null, 'payout_accounts: 직접 쓰기 불가');
select throws_ok($$ select count(*) from public.rate_events $$, '42501', null,
                 'rate_events: 함수 내부 전용 테이블은 SELECT도 불가');

reset role;

-- ===========================================================================
-- 권한 목록(postgres로 조회)
-- ===========================================================================
select is(
  array(select format('%s:%s:%s', r.rolname, c.relname, pr.p)
          from pg_class c
          join pg_namespace n on n.oid = c.relnamespace
          cross join (values ('anon'), ('authenticated')) r(rolname)
          cross join (values ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE')) pr(p)
         where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm')
           and has_table_privilege(r.rolname, c.oid, pr.p)
         order by 1),
  '{}'::text[], 'anon·authenticated는 public의 어떤 테이블·뷰에도 쓰기 권한이 없다');

select is(
  array(select c.relname::text from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm')
           and has_table_privilege('anon', c.oid, 'SELECT')
         order by 1),
  '{}'::text[], 'anon은 public의 어떤 테이블·뷰도 읽을 수 없다');

select is(
  array(select c.relname::text from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relname in ('banned_words', 'deleted_accounts', 'rate_events')
           and has_table_privilege('authenticated', c.oid, 'SELECT')
         order by 1),
  '{}'::text[], 'banned_words·deleted_accounts·rate_events는 authenticated도 읽을 수 없다');

select is(
  array(select c.relname::text from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity
         order by 1),
  '{}'::text[], 'public의 모든 테이블에 RLS가 켜져 있다');

-- 앞으로 만드는 테이블도 쓰기 권한 없이 시작한다(기본 권한 회수)
create table public.__probe_default_table (id int);
select ok(not has_table_privilege('authenticated', 'public.__probe_default_table', 'INSERT')
          and not has_table_privilege('anon', 'public.__probe_default_table', 'SELECT'),
          '새 테이블은 authenticated 쓰기·anon 읽기 권한 없이 만들어진다');

select * from finish();
rollback;
