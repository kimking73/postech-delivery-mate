-- SV3: 헬퍼 함수(§2-3)와 RPC 스텁의 공통 검사(§4 머리말). SV4에서 구현된 RPC에 맞춰 2건 수정
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(32);

-- ---------------------------------------------------------------------------
-- 준비(postgres 권한)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, aud, role) values
  ('00000000-0000-0000-0000-00000000000a', 'host@postech.ac.kr',    now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000b', 'member@postech.ac.kr',  now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000c', 'outsider@postech.ac.kr', now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000d', 'newbie@postech.ac.kr',  now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000e', 'pending@postech.ac.kr', null,  'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-00000000000f', 'bad@postech.ac.kr',     now(), 'authenticated', 'authenticated');

insert into public.profiles (id, nickname) values
  ('00000000-0000-0000-0000-00000000000a', 'host'),
  ('00000000-0000-0000-0000-00000000000b', 'member'),
  ('00000000-0000-0000-0000-00000000000c', 'outsider'),
  ('00000000-0000-0000-0000-00000000000f', 'bad');

-- 기준 데이터(seed·0009 categories)를 비우고 테스트용 값만 넣는다(트랜잭션이라 끝나면 되돌아간다)
delete from public.pickup_places; delete from public.zones; delete from public.categories;
insert into public.zones (id, name) values (1, '테스트구역');
insert into public.categories (id, name) values (1, '치킨');
insert into public.pickup_places (id, zone_id, name) values (1, 1, '로비');

insert into public.posts (id, host_id, zone_id, category_id, store_name, pickup_place_id, max_members, member_count, deadline_at)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 1, 1, '치킨집', 1, 4, 2,
        now() + interval '30 minutes');

insert into public.participants (post_id, user_id, role, state) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'host',   'joined'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'member', 'joined'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'member', 'left');

insert into public.sanctions (user_id, type, ends_at) values
  ('00000000-0000-0000-0000-00000000000f', 'suspend', now() + interval '14 days'),
  ('00000000-0000-0000-0000-00000000000c', 'warn', null);

insert into public.blocks (blocker_id, blocked_id) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000c');

insert into public.banned_words (word) values ('나쁜말');

-- ---------------------------------------------------------------------------
-- 순수 헬퍼(postgres)
-- ---------------------------------------------------------------------------
select ok(public.is_blocked_between('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000c'), '차단: 차단한 쪽에서 본다');
select ok(public.is_blocked_between('00000000-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-00000000000a'), '차단: 차단당한 쪽에서도 본다');
select ok(not public.is_blocked_between('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b'), '차단 관계가 없으면 false');
select ok(public.is_sanctioned('00000000-0000-0000-0000-00000000000f'), '유효한 suspend는 제재 중이다');
select ok(not public.is_sanctioned('00000000-0000-0000-0000-00000000000c'), 'warn은 제재로 보지 않는다');
select lives_ok($$ select public.assert_clean('맛있는 치킨') $$, '금칙어가 없으면 통과');
select throws_ok($$ select public.assert_clean('이건 나 쁜 말 이야') $$, 'P0001', 'BANNED_WORD', '공백을 섞어도 금칙어를 잡는다');

-- assert_rate: auth.uid()가 필요하다
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@postech.ac.kr","role":"authenticated"}', true);
select lives_ok($$ select public.assert_rate('t', 2, interval '1 minute') $$, 'rate 1회째 통과');
select lives_ok($$ select public.assert_rate('t', 2, interval '1 minute') $$, 'rate 2회째 통과');
select throws_ok($$ select public.assert_rate('t', 2, interval '1 minute') $$, 'P0001', 'RATE_LIMITED', 'rate 한도 초과 시 RATE_LIMITED');

-- ---------------------------------------------------------------------------
-- authenticated 역할로 전환
-- ---------------------------------------------------------------------------
set local role authenticated;

-- 토큰 없음
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select ok(not public.is_verified_member(), '토큰이 없으면 is_verified_member = false');
select throws_ok($$ select public.join_post('10000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_VERIFIED', '토큰이 없으면 NOT_VERIFIED');

-- 메일 미인증
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000e","email":"pending@postech.ac.kr","role":"authenticated"}', true);
select throws_ok($$ select public.create_profile('pending', 1::smallint, true, true) $$, 'P0001', 'NOT_VERIFIED', '메일 미인증이면 create_profile도 NOT_VERIFIED');

-- JWT 메일이 POSTECH가 아님(hook 누락 사고 대비)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@gmail.com","role":"authenticated"}', true);
select ok(not public.is_verified_member(), 'JWT 메일이 POSTECH가 아니면 false');
select throws_ok($$ select public.mark_paid('10000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_VERIFIED', 'JWT 메일이 POSTECH가 아니면 NOT_VERIFIED');

-- 인증했지만 프로필 없음
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d","email":"newbie@postech.ac.kr","role":"authenticated"}', true);
-- 동의 false로 불러 프로필을 만들지 않고, 공통 검사를 통과해 본문 검사(INVALID_INPUT)까지 가는지만 본다(SV4 구현).
select throws_ok($$ select public.create_profile('newbie', 1::smallint, false, true) $$, 'P0001', 'INVALID_INPUT', '프로필 없이 create_profile은 공통 검사를 통과한다');
select throws_ok($$ select public.get_my_rooms() $$, 'P0001', 'PROFILE_REQUIRED', '프로필이 없으면 다른 RPC는 PROFILE_REQUIRED');

-- 제재 중
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000f","email":"bad@postech.ac.kr","role":"authenticated"}', true);
select throws_ok($$ select public.send_message('10000000-0000-0000-0000-000000000001', 'hi', gen_random_uuid()) $$, 'P0001', 'SANCTIONED', '정지 중이면 SANCTIONED');

-- 정상 멤버
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@postech.ac.kr","role":"authenticated"}', true);
select ok(public.is_verified_member(), '인증·프로필이 있으면 is_verified_member = true');
select ok(public.is_participant('10000000-0000-0000-0000-000000000001'), 'joined 참여자는 is_participant = true');
select ok(not public.can_view_payout('10000000-0000-0000-0000-000000000001'), '모집 중(open)에는 참여자도 계좌를 볼 수 없다');
select throws_ok($$ select * from public.get_feed(1::smallint) $$, 'P0001', 'NOT_IMPLEMENTED', '공통 검사를 통과하면 스텁은 NOT_IMPLEMENTED');

-- 나간 사람
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c","email":"outsider@postech.ac.kr","role":"authenticated"}', true);
select ok(not public.is_participant('10000000-0000-0000-0000-000000000001'), 'left 상태는 is_participant = false');

-- 마감 후 계좌 열람
reset role;
update public.posts set status = 'closed', closed_at = now(), pay_due_at = now() + interval '30 minutes'
 where id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;

select ok(not public.can_view_payout('10000000-0000-0000-0000-000000000001'), '마감 후에도 나간 사람은 계좌를 볼 수 없다');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","email":"member@postech.ac.kr","role":"authenticated"}', true);
select ok(public.can_view_payout('10000000-0000-0000-0000-000000000001'), '마감 후 joined 참여자는 계좌를 볼 수 있다');

-- 직접 테이블 읽기는 RLS 정책(SV4, 0008)으로 연다. 자세한 검사는 03_rls
select is((select count(*)::int from public.posts), 1, 'RLS: 인증된 참여자는 posts를 읽을 수 있다');

reset role;
set local role anon;
select throws_ok($$ select public.join_post('10000000-0000-0000-0000-000000000001') $$, '42501', null, 'anon은 RPC 실행 권한이 없다');

reset role;

-- ---------------------------------------------------------------------------
-- 실행 권한: 임의 id를 받는 헬퍼는 API로 노출하지 않는다. 새 함수는 닫힌 상태로 시작한다.
-- ---------------------------------------------------------------------------
select ok(not has_function_privilege('authenticated', 'public.is_blocked_between(uuid, uuid)', 'execute'),
          'authenticated는 is_blocked_between을 직접 부를 수 없다(남의 차단 관계 노출 방지)');
select ok(not has_function_privilege('authenticated', 'public.is_sanctioned(uuid)', 'execute'),
          'authenticated는 is_sanctioned를 직접 부를 수 없다(남의 제재 여부 노출 방지)');
select is((select count(*)::int
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')),
          0, 'anon이 실행할 수 있는 public 함수는 없다');

create function public.__probe_default_privileges() returns int language sql as 'select 1';
select ok(not has_function_privilege('anon', 'public.__probe_default_privileges()', 'execute'),
          '새로 만든 함수는 anon이 실행할 수 없다(기본 권한 회수)');
select ok(not has_function_privilege('authenticated', 'public.__probe_default_privileges()', 'execute'),
          '새로 만든 함수는 grant 전까지 authenticated도 실행할 수 없다');

select * from finish();
rollback;
