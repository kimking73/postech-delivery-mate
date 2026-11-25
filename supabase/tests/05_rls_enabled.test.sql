-- SV4: public 스키마의 모든 테이블에 RLS가 켜져 있는지(아키텍처 §5)
-- authenticated의 SELECT 권한은 기본값으로 남아 있으므로, RLS를 빠뜨린 새 테이블은 그대로 읽힌다. 그걸 여기서 막는다.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(1);

select is_empty(
  $$ select c.relname::text
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind in ('r', 'p')
        and not c.relrowsecurity $$,
  'public 스키마의 모든 테이블에 RLS가 켜져 있다(빠진 테이블 이름이 실패 메시지에 나온다)'
);

select * from finish();
rollback;
