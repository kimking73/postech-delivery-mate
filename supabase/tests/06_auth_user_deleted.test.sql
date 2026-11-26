-- SV4 PR #15 리뷰 1번: delete-account를 거치지 않고 auth 사용자를 지워도 개인 데이터가 남지 않는다(0010)
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(9);

-- ---------------------------------------------------------------------------
-- 준비(postgres 권한)
--   d1: 대시보드에서 바로 지워지는 사용자(계좌·토큰·구독·차단·글 있음)
--   d2: delete-account가 먼저 익명화한 사용자
--   k : 남는 사용자(d1을 차단함)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, aud, role) values
  ('00000000-0000-0000-0000-0000000000d1', 'gone@postech.ac.kr',   now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d2', 'gone2@postech.ac.kr',  now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d3', 'keeper@postech.ac.kr', now(), 'authenticated', 'authenticated');

insert into public.zones (id, name) values (901, '__t_구역');
insert into public.categories (id, name) values (901, '__t_치킨');
insert into public.pickup_places (id, zone_id, name) values (901, 901, '__t_로비');

insert into public.profiles (id, nickname, deleted_at) values
  ('00000000-0000-0000-0000-0000000000d1', '떠난사람', null),
  ('00000000-0000-0000-0000-0000000000d2', '탈퇴_이미바꿈', now() - interval '1 minute'),
  ('00000000-0000-0000-0000-0000000000d3', '남는사람', null);

insert into public.payout_accounts (user_id, bank_name, account_number, account_holder) values
  ('00000000-0000-0000-0000-0000000000d1', '테스트은행', '123-456-7890', '떠난사람');
insert into public.push_tokens (user_id, expo_token, platform) values
  ('00000000-0000-0000-0000-0000000000d1', 'ExponentPushToken[gone]', 'ios');
insert into public.category_subscriptions (user_id, zone_id, category_id) values
  ('00000000-0000-0000-0000-0000000000d1', 901, 901);
insert into public.blocks (blocker_id, blocked_id) values
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000d1');
insert into public.posts (id, host_id, zone_id, category_id, store_name, pickup_place_id, max_members, member_count, deadline_at)
values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000d1', 901, 901, '치킨집', 901, 4, 1,
        now() + interval '30 minutes');

-- ---------------------------------------------------------------------------
-- auth 사용자 삭제(대시보드·auth.admin.deleteUser와 같은 경로)
-- ---------------------------------------------------------------------------
select lives_ok($$ delete from auth.users where id = '00000000-0000-0000-0000-0000000000d1' $$,
                '글이 있는 사용자도 auth 삭제가 성공한다(프로필 FK 없음)');

select is((select count(*)::int from public.payout_accounts where user_id = '00000000-0000-0000-0000-0000000000d1'), 0,
          '계좌 정보가 지워진다');
select is((select count(*)::int from public.push_tokens where user_id = '00000000-0000-0000-0000-0000000000d1'), 0,
          '푸시 토큰이 지워진다');
select is((select count(*)::int from public.category_subscriptions where user_id = '00000000-0000-0000-0000-0000000000d1'), 0,
          '카테고리 구독이 지워진다');
select is((select count(*)::int from public.blocks where blocked_id = '00000000-0000-0000-0000-0000000000d1'), 0,
          '남이 건 차단도 지워진다');
select is((select format('%s|%s|%s', p.nickname, p.deleted_at is not null, p.notify_chat)
             from public.profiles p where p.id = '00000000-0000-0000-0000-0000000000d1'),
          '탈퇴_000000000|t|f',
          '프로필은 남고 닉네임이 대체값으로 바뀌며 deleted_at·알림 끔이 채워진다');
select is((select count(*)::int from public.posts where host_id = '00000000-0000-0000-0000-0000000000d1'), 1,
          '글 이력은 그대로 남는다');

-- delete-account가 먼저 익명화한 경우: 프로필을 다시 바꾸지 않는다
select lives_ok($$ delete from auth.users where id = '00000000-0000-0000-0000-0000000000d2' $$,
                '이미 익명화한 사용자도 auth 삭제가 성공한다');
select is((select nickname from public.profiles where id = '00000000-0000-0000-0000-0000000000d2'), '탈퇴_이미바꿈',
          '이미 익명화한 프로필의 닉네임은 그대로 둔다');

select * from finish();
rollback;
