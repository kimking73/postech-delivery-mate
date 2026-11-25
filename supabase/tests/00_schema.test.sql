-- SV3: 스키마 계약 스모크 테스트 (테이블·RLS·헬퍼·RPC 시그니처·실행 권한)
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(58);

-- 테이블 16개(SV1 7 + SV3 9)
select has_table('public', t, t || ' 테이블이 있다')
  from unnest(array[
    'reports', 'blocks', 'sanctions', 'push_tokens', 'category_subscriptions',
    'banned_words', 'deleted_accounts', 'rate_events', 'payout_accounts'
  ]) as t;

-- public 스키마의 모든 테이블에 RLS가 켜져 있다
select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0, 'public의 모든 테이블에 RLS가 켜져 있다');

-- 송금 컬럼(SV1에서 추가)
select has_column('public', 'posts', 'pay_due_at', 'posts.pay_due_at');
select has_column('public', 'posts', 'pay_reminded_at', 'posts.pay_reminded_at');
select has_column('public', 'participants', 'paid_at', 'participants.paid_at');

-- 헬퍼
select has_function('public', 'is_verified_member', array[]::text[]);
select has_function('public', 'is_participant', array['uuid']);
select has_function('public', 'is_blocked_between', array['uuid', 'uuid']);
select has_function('public', 'is_sanctioned', array['uuid']);
select has_function('public', 'can_view_payout', array['uuid']);
select has_function('public', 'assert_rate', array['text', 'integer', 'interval']);
select has_function('public', 'assert_clean', array['text']);
select has_function('public', 'hook_before_user_created', array['jsonb']);

-- RPC 25개 시그니처
select has_function('public', 'create_profile', array['text', 'smallint', 'boolean', 'boolean']);
select has_function('public', 'update_profile', array['text', 'smallint', 'boolean', 'boolean', 'boolean']);
select has_function('public', 'set_payout_account', array['text', 'text', 'text', 'text']);
select has_function('public', 'get_host_account', array['uuid']);
select has_function('public', 'create_post', array['smallint', 'smallint', 'text', 'smallint', 'smallint', 'integer', 'text', 'text', 'text', 'text']);
select has_function('public', 'join_post', array['uuid']);
select has_function('public', 'leave_post', array['uuid']);
select has_function('public', 'kick_member', array['uuid', 'uuid']);
select has_function('public', 'close_post', array['uuid']);
select has_function('public', 'complete_post', array['uuid']);
select has_function('public', 'cancel_post', array['uuid', 'text']);
select has_function('public', 'send_message', array['uuid', 'text', 'uuid']);
select has_function('public', 'mark_read', array['uuid', 'bigint']);
select has_function('public', 'mark_paid', array['uuid']);
select has_function('public', 'confirm_paid', array['uuid', 'uuid']);
select has_function('public', 'reject_paid', array['uuid', 'uuid']);
select has_function('public', 'get_feed', array['smallint', 'timestamp with time zone', 'uuid', 'integer']);
select hasnt_function('public', 'get_feed', array['smallint', 'timestamp with time zone', 'integer'], '옛 get_feed 시그니처가 남아 있지 않다(오버로드 금지)');
select has_function('public', 'get_my_rooms', array[]::text[]);
select has_function('public', 'get_messages', array['uuid', 'bigint', 'bigint', 'integer']);
select hasnt_function('public', 'get_messages', array['uuid', 'bigint', 'integer'], '옛 get_messages 시그니처가 남아 있지 않다(오버로드 금지)');
select has_index('public', 'posts', 'posts_feed_idx', array['zone_id', 'deadline_at', 'id'], 'posts_feed_idx가 (zone_id, deadline_at, id) 순서다');
select has_function('public', 'report', array['report_target', 'text', 'report_reason', 'text', 'uuid']);
select has_function('public', 'block_user', array['uuid']);
select has_function('public', 'unblock_user', array['uuid']);
select has_function('public', 'register_push_token', array['text', 'push_platform']);
select has_function('public', 'subscribe_category', array['smallint', 'smallint']);
select has_function('public', 'unsubscribe_category', array['smallint', 'smallint']);

-- 모든 public 함수가 SECURITY DEFINER + search_path='' 이다(pgTAP 자체 함수 제외)
select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      and (not p.prosecdef or not coalesce(p.proconfig, '{}') @> array['search_path=""'])),
  0, '모든 public 함수가 SECURITY DEFINER이고 search_path가 비어 있다');

-- 실행 권한
select ok(not has_function_privilege('anon', 'public.join_post(uuid)', 'execute'), 'anon은 RPC를 실행할 수 없다');
select ok(has_function_privilege('authenticated', 'public.join_post(uuid)', 'execute'), 'authenticated는 RPC를 실행할 수 있다');
select ok(not has_function_privilege('authenticated', 'public.assert_rate(text, int, interval)', 'execute'), 'assert_rate는 API로 노출하지 않는다');
select ok(not has_function_privilege('authenticated', 'public.assert_clean(text)', 'execute'), 'assert_clean는 API로 노출하지 않는다');
select ok(not has_function_privilege('authenticated', 'public.email_pepper()', 'execute'), 'email_pepper는 authenticated가 실행할 수 없다');
select ok(not has_function_privilege('authenticated', 'public.hook_before_user_created(jsonb)', 'execute'), 'hook은 authenticated가 실행할 수 없다');
select ok(has_function_privilege('supabase_auth_admin', 'public.hook_before_user_created(jsonb)', 'execute'), 'hook은 supabase_auth_admin이 실행한다');

-- payout_accounts check: 계좌 3종 모두 또는 toss_link
select throws_ok(
  $$ insert into public.payout_accounts (user_id, bank_name) values (gen_random_uuid(), '국민') $$,
  '23514', null, '계좌 정보가 불완전하면 거부한다');

select * from finish();
rollback;
