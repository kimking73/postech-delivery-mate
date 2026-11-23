-- SV1: 확장 기능
-- 아키텍처 §1(스택), §7-2(푸시 큐: pgmq), §8(스케줄: pg_cron), §6·§7(Edge Function 호출: pg_net)

-- gen_random_uuid()는 PG13+ 기본 제공이지만, digest()(email_hash 등)를 위해 pgcrypto를 둔다.
create extension if not exists pgcrypto with schema extensions;

-- 스케줄 작업(§8). Supabase 권장대로 pg_catalog에 설치한다.
create extension if not exists pg_cron with schema pg_catalog;

-- DB에서 Edge Function(push-worker 등)을 HTTP로 호출할 때 쓴다. 스키마는 확장이 net을 직접 만든다.
create extension if not exists pg_net with schema extensions;

-- 푸시 발송 큐(§7-2). 확장이 pgmq 스키마를 만든다.
create extension if not exists pgmq;
