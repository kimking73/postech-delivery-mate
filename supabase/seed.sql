-- 로컬 개발·CI 전용 시드. staging/production에는 적용되지 않는다(db reset에서만 실행).

-- email_pepper(아키텍처 §2-2 deleted_accounts, §3-1 hook): 로컬 전용 더미 값.
-- staging/production은 대시보드 Vault에서 같은 이름(email_pepper)으로 무작위 값을 따로 만든다.
select vault.create_secret('local-dev-pepper-not-a-secret', 'email_pepper', 'email hash pepper (local only)');
