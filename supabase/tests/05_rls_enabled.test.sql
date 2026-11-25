-- SV4: 기본 권한으로 RLS를 우회하는 객체가 생기지 않게 막는다(아키텍처 §5)
-- authenticated의 SELECT 권한은 Supabase 기본값으로 남아 있다. 그래서
--   - 테이블은 RLS가 켜져 있어야 하고(03_rls에도 같은 검사가 있다)
--   - public의 뷰는 security_invoker여야 한다. 아니면 뷰 소유자(postgres) 권한으로 실행돼 RLS를 건너뛴다.
--     예외: public_profiles(0008). 뷰 안에서 is_verified_member()를 검사하고 공개 컬럼만 고른다.
--   지표용 뷰처럼 RLS를 건너뛰어야 하는 뷰는 API에 노출되지 않는 스키마(private 등)에 만든다.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(2);

select is_empty(
  $$ select c.relname::text
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind in ('r', 'p')
        and not c.relrowsecurity $$,
  'public 스키마의 모든 테이블에 RLS가 켜져 있다(빠진 테이블 이름이 실패 메시지에 나온다)'
);

select is_empty(
  $$ select c.relname::text
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind in ('v', 'm')
        and c.relname <> 'public_profiles'
        and not coalesce(c.reloptions, '{}') && array['security_invoker=true', 'security_invoker=on'] $$,
  'public의 뷰는 public_profiles를 빼고 모두 security_invoker다(RLS 우회 방지)'
);

select * from finish();
rollback;
