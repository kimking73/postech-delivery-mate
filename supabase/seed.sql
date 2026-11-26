-- 로컬 개발·CI 전용 시드. staging/production에는 적용되지 않는다(db reset에서만 실행).

-- email_pepper(아키텍처 §2-2 deleted_accounts, §3-1 hook): 로컬 전용 더미 값.
-- staging/production은 대시보드 Vault에서 같은 이름(email_pepper)으로 무작위 값을 따로 만든다.
select vault.create_secret('local-dev-pepper-not-a-secret', 'email_pepper', 'email hash pepper (local only)');

-- 생활 구역·픽업 장소: 로컬 개발용 임시 값(실제 목록은 OP3에서 확정해 마이그레이션으로 넣는다).
-- categories는 마이그레이션 0009에 있다.
insert into public.zones (name, sort_order) values
  ('임시구역A', 1), ('임시구역B', 2), ('임시구역C', 3);
insert into public.pickup_places (zone_id, name, sort_order)
  select z.id, z.name || ' 정문', 1 from public.zones z where z.name like '임시구역%';
