-- SV4: create_profile, update_profile, set_payout_account, get_host_account (아키텍처 §4)
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(48);

-- ---------------------------------------------------------------------------
-- 준비(postgres 권한)
--   h: 방장(계좌 있음), m: 멤버, o: 비참여자, l: 나간 사람, n: 신규(프로필 없음), r: 재가입(탈퇴 기록 noshow 2)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'host@postech.ac.kr',     now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a2', 'member@postech.ac.kr',   now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a3', 'other@postech.ac.kr',    now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a4', 'leaver@postech.ac.kr',   now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a5', 'newbie@postech.ac.kr',   now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000a6', 'Rejoin@postech.ac.kr',   now(), 'authenticated', 'authenticated');

-- 기준 데이터는 지우지 않는다(로컬 DB의 개발용 행이 참조하면 FK 위반). 겹치지 않는 테스트 전용 id(901~)와 이름을 쓴다
insert into public.zones (id, name, is_active) values (901, '__t_구역A', true), (902, '__t_구역B', true), (903, '__t_폐쇄구역', false);
insert into public.categories (id, name) values (901, '__t_치킨');
insert into public.pickup_places (id, zone_id, name) values (901, 901, '__t_로비');
insert into public.banned_words (word) values ('나쁜말');

insert into public.profiles (id, nickname, home_zone_id) values
  ('00000000-0000-0000-0000-0000000000a1', '방장', 901),
  ('00000000-0000-0000-0000-0000000000a2', '멤버', 901),
  ('00000000-0000-0000-0000-0000000000a3', '구경꾼', 901),
  ('00000000-0000-0000-0000-0000000000a4', '나간사람', 901);

insert into public.deleted_accounts (email_hash, noshow_count) values
  (encode(extensions.digest('rejoin@postech.ac.kr' || public.email_pepper(), 'sha256'), 'hex'), 2);

insert into public.posts (id, host_id, zone_id, category_id, store_name, pickup_place_id, max_members, member_count, deadline_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', 901, 901, '치킨집', 901, 4, 2, now() + interval '30 minutes');
insert into public.participants (post_id, user_id, role, state) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', 'host',   'joined'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a2', 'member', 'joined'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a4', 'member', 'left');

set local role authenticated;

-- ===========================================================================
-- create_profile
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a5","email":"newbie@postech.ac.kr","role":"authenticated"}', true);

select throws_ok($$ select public.create_profile('새사람', 901::smallint, false, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 약관 미동의는 INVALID_INPUT');
select throws_ok($$ select public.create_profile('새사람', 901::smallint, true, null) $$, 'P0001', 'INVALID_INPUT', 'create_profile: EULA 미동의(null)는 INVALID_INPUT');
select throws_ok($$ select public.create_profile('a', 901::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 1자 닉네임은 INVALID_INPUT');
select throws_ok($$ select public.create_profile('열세글자닉네임입니다아아아', 901::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 13자 이상 닉네임은 INVALID_INPUT');
select throws_ok($$ select public.create_profile('hi there', 901::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 공백·특수문자 닉네임은 INVALID_INPUT');
select throws_ok($$ select public.create_profile('탈퇴_abc', 901::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 탈퇴_ 접두사는 예약어라 INVALID_INPUT');
select throws_ok($$ select public.create_profile('나쁜말쟁이', 901::smallint, true, true) $$, 'P0001', 'BANNED_WORD', 'create_profile: 금칙어 닉네임은 BANNED_WORD');
select throws_ok($$ select public.create_profile('멤버', 901::smallint, true, true) $$, 'P0001', 'NICKNAME_TAKEN', 'create_profile: 중복 닉네임은 NICKNAME_TAKEN');
select throws_ok($$ select public.create_profile('새사람', 903::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 비활성 구역은 INVALID_INPUT');
select throws_ok($$ select public.create_profile('새사람', 99::smallint, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 없는 구역은 INVALID_INPUT');
select throws_ok($$ select public.create_profile('새사람', null, true, true) $$, 'P0001', 'INVALID_INPUT', 'create_profile: 구역 null은 INVALID_INPUT');

select is(
  (select format('%s|%s|%s|%s|%s', p.nickname, p.home_zone_id, p.noshow_count,
                 p.verified_at is not null and p.terms_agreed_at is not null and p.eula_agreed_at is not null, p.is_admin)
     from public.create_profile('  새사람_1 ', 901::smallint, true, true) p),
  '새사람_1|901|0|t|f',
  'create_profile: 앞뒤 공백을 정리해 저장하고 verified_at·동의 시각을 채운다');
select ok(public.is_verified_member(), 'create_profile 뒤에는 is_verified_member = true');
select throws_ok($$ select public.create_profile('또만들기', 901::smallint, true, true) $$, 'P0001', 'INVALID_STATE', 'create_profile: 이미 프로필이 있으면 INVALID_STATE');

-- 탈퇴 기록이 있는 메일로 재가입: noshow_count를 이어 받는다(메일 대소문자 무시)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a6","email":"rejoin@postech.ac.kr","role":"authenticated"}', true);
select is((select p.noshow_count from public.create_profile('재가입', 902::smallint, true, true) p), 2::smallint,
          'create_profile: 탈퇴 전 노쇼 횟수를 이어 받는다');

-- ===========================================================================
-- update_profile
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","email":"member@postech.ac.kr","role":"authenticated"}', true);

select is((select p.nickname from public.update_profile() p), '멤버', 'update_profile: 인자가 모두 null이면 그대로 돌려준다');
select is(
  (select format('%s|%s|%s|%s|%s', p.nickname, p.home_zone_id, p.notify_chat, p.notify_post_events, p.notify_marketing)
     from public.update_profile(nickname => '새멤버', home_zone_id => 902::smallint, notify_chat => false, notify_marketing => true) p),
  '새멤버|902|f|t|t', 'update_profile: 준 값만 바꾼다');
select is((select p.nickname from public.update_profile(nickname => '새멤버') p), '새멤버', 'update_profile: 자기 닉네임 그대로는 중복이 아니다');
select throws_ok($$ select public.update_profile(nickname => '방장') $$, 'P0001', 'NICKNAME_TAKEN', 'update_profile: 남의 닉네임은 NICKNAME_TAKEN');
select throws_ok($$ select public.update_profile(nickname => '나쁜말') $$, 'P0001', 'BANNED_WORD', 'update_profile: 금칙어는 BANNED_WORD');
select throws_ok($$ select public.update_profile(nickname => '탈퇴_abcdef010') $$, 'P0001', 'INVALID_INPUT', 'update_profile: 탈퇴_ 접두사는 예약어라 INVALID_INPUT');
select throws_ok($$ select public.update_profile(nickname => '') $$, 'P0001', 'INVALID_INPUT', 'update_profile: 빈 닉네임은 INVALID_INPUT');
select throws_ok($$ select public.update_profile(home_zone_id => 903::smallint) $$, 'P0001', 'INVALID_INPUT', 'update_profile: 비활성 구역은 INVALID_INPUT');
select is((select p.nickname from public.update_profile(nickname => 'Mate') p), 'Mate', 'update_profile: 영문 닉네임으로 바꾼다');

-- ===========================================================================
-- set_payout_account
-- ===========================================================================
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","email":"host@postech.ac.kr","role":"authenticated"}', true);

select throws_ok($$ select public.update_profile(nickname => 'mate') $$, 'P0001', 'NICKNAME_TAKEN', 'update_profile: 대소문자만 다른 닉네임은 NICKNAME_TAKEN');
select throws_ok($$ select public.set_payout_account(bank_name => '국민') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: 은행 3필드 중 일부만 주면 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account('국민', '12-34', '방장') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: 9자 이하 계좌번호는 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account('국민', '1234-5678-90ab', '방장') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: 숫자·- 외 문자는 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account('국민', '----------', '방장') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: 숫자 없이 -만 있으면 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account('국민', '123-456-7890', '방') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: 1자 예금주는 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account(toss_link => 'https://evil.com/toss.me/x') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: toss.me가 아닌 링크는 INVALID_INPUT');
select throws_ok($$ select public.set_payout_account(toss_link => 'http://toss.me/host') $$, 'P0001', 'INVALID_INPUT', 'set_payout_account: http 링크는 INVALID_INPUT');

select lives_ok($$ select public.set_payout_account(toss_link => 'https://toss.me/host') $$, 'set_payout_account: 토스 링크만으로 저장');
select lives_ok($$ select public.set_payout_account(' 국민 ', '123-456-7890', '방장', '') $$, 'set_payout_account: 은행 계좌로 덮어쓴다(빈 문자열은 null)');
select is((select format('%s|%s|%s|%s', bank_name, account_number, account_holder, coalesce(toss_link, '-')) from public.payout_accounts),
          '국민|123-456-7890|방장|-', 'set_payout_account: upsert 결과가 저장된다(이전 토스 링크는 지워진다)');

-- 멤버 m도 계좌를 만들었다가 지운다
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","email":"member@postech.ac.kr","role":"authenticated"}', true);
select lives_ok($$ select public.set_payout_account(toss_link => 'https://toss.me/member') $$, 'set_payout_account: 멤버 저장');
select lives_ok($$ select public.set_payout_account() $$, 'set_payout_account: 모두 null이면 삭제');
select is((select count(*)::int from public.payout_accounts), 0, 'set_payout_account: 삭제 후 본인 계좌 0건');

-- ===========================================================================
-- get_host_account: 마감 전에는 모두 거부, 마감 뒤에는 joined 참여자만
-- ===========================================================================
select throws_ok($$ select * from public.get_host_account('20000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 마감 전(open)에는 참여자도 거부');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a3","email":"other@postech.ac.kr","role":"authenticated"}', true);
select throws_ok($$ select * from public.get_host_account('20000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 마감 전 비참여자 거부');

reset role;
update public.posts set status = 'closed', closed_at = now(), pay_due_at = now() + interval '30 minutes'
 where id = '20000000-0000-0000-0000-000000000001';
set local role authenticated;

-- o: 비참여자
select throws_ok($$ select * from public.get_host_account('20000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 마감 뒤에도 비참여자는 거부');
-- l: 나간 사람
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a4","email":"leaver@postech.ac.kr","role":"authenticated"}', true);
select throws_ok($$ select * from public.get_host_account('20000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 마감 뒤에도 나간 사람(left)은 거부');
-- 없는 글
select throws_ok($$ select * from public.get_host_account(gen_random_uuid()) $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 없는 글은 NOT_PARTICIPANT');
-- m: joined 멤버
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","email":"member@postech.ac.kr","role":"authenticated"}', true);
select is((select format('%s|%s|%s', bank_name, account_number, account_holder)
             from public.get_host_account('20000000-0000-0000-0000-000000000001')),
          '국민|123-456-7890|방장', 'get_host_account: 마감 뒤 joined 참여자는 방장 계좌를 받는다');

-- 방장이 계좌를 지우면 0행
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","email":"host@postech.ac.kr","role":"authenticated"}', true);
select lives_ok($$ select public.set_payout_account() $$, '방장 계좌 삭제');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a2","email":"member@postech.ac.kr","role":"authenticated"}', true);
select is((select count(*)::int from public.get_host_account('20000000-0000-0000-0000-000000000001')), 0,
          'get_host_account: 방장 계좌가 없으면 0행');

-- 취소된 글은 거부
reset role;
update public.posts set status = 'canceled', canceled_at = now() where id = '20000000-0000-0000-0000-000000000001';
set local role authenticated;
select throws_ok($$ select * from public.get_host_account('20000000-0000-0000-0000-000000000001') $$, 'P0001', 'NOT_PARTICIPANT',
                 'get_host_account: 취소된 글은 참여자도 거부');

-- ===========================================================================
-- 실행 권한
-- ===========================================================================
reset role;
select ok(not has_function_privilege('authenticated', 'public.assert_nickname(text)', 'execute')
          and not has_function_privilege('authenticated', 'public.assert_zone(smallint)', 'execute'),
          '내부 검사 함수는 API로 노출하지 않는다');

select * from finish();
rollback;
