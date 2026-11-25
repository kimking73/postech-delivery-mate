-- SV3: 나머지 테이블 (아키텍처 §2-2)
-- reports, blocks, sanctions, push_tokens, category_subscriptions, banned_words,
-- deleted_accounts, rate_events, payout_accounts
-- 모든 테이블에 RLS를 켠다. 정책은 SV4(0008_rls)에서 추가한다.
-- posts.pay_due_at·pay_reminded_at, participants.paid_at은 0002에 이미 있다.

-- ---------------------------------------------------------------------------
-- enum
-- ---------------------------------------------------------------------------
create type public.report_target as enum ('post', 'message', 'user', 'noshow');
create type public.report_reason as enum ('spam', 'abuse', 'scam', 'inappropriate', 'noshow', 'unpaid', 'other');
create type public.report_status as enum ('pending', 'actioned', 'dismissed');
create type public.sanction_type as enum ('warn', 'suspend', 'ban');
create type public.push_platform as enum ('ios', 'android');

-- ---------------------------------------------------------------------------
-- payout_accounts: 송금 받을 계좌 (사용자당 1행)
-- 다른 사용자는 get_host_account RPC(can_view_payout)로만 읽는다. 탈퇴 시 즉시 삭제.
-- ---------------------------------------------------------------------------
create table public.payout_accounts (
  user_id         uuid primary key references public.profiles (id) on delete cascade,
  bank_name       text check (bank_name is null or char_length(bank_name) between 1 and 30),
  account_number  text check (account_number is null
                              or (account_number ~ '^[0-9-]+$' and char_length(account_number) between 10 and 20)),
  account_holder  text check (account_holder is null or char_length(account_holder) between 2 and 20),
  toss_link       text check (toss_link is null
                              or (toss_link like 'https://toss.me/%' and char_length(toss_link) <= 200)),
  updated_at      timestamptz not null default now(),
  constraint payout_accounts_complete check (
    (bank_name is not null and account_number is not null and account_holder is not null)
    or toss_link is not null
  )
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id                 uuid primary key default gen_random_uuid(),
  reporter_id        uuid not null references public.profiles (id) on delete cascade,
  target_type        public.report_target not null,
  target_post_id     uuid references public.posts (id) on delete cascade,
  target_message_id  bigint references public.messages (id) on delete cascade,
  target_user_id     uuid references public.profiles (id) on delete cascade,
  reason             public.report_reason not null,
  detail             text check (detail is null or char_length(detail) <= 500),
  status             public.report_status not null default 'pending',
  handled_by         uuid references public.profiles (id) on delete set null,
  handled_at         timestamptz,
  created_at         timestamptz not null default now(),
  -- 대상에 맞는 컬럼만 채운다. noshow는 방(post)과 사람(user)을 함께 지목한다.
  constraint reports_target_columns check (
    case target_type
      when 'post'    then target_post_id is not null and target_message_id is null and target_user_id is null
      when 'message' then target_message_id is not null and target_user_id is null
      when 'user'    then target_user_id is not null and target_message_id is null and target_post_id is null
      when 'noshow'  then target_user_id is not null and target_post_id is not null and target_message_id is null
    end
  )
);

-- 같은 사람이 같은 대상을 중복 신고하지 못하게 한다(nulls not distinct: PG15+).
create unique index reports_dedup_idx on public.reports
  (reporter_id, target_type, target_post_id, target_message_id, target_user_id) nulls not distinct;
create index reports_pending_idx on public.reports (created_at) where status = 'pending';
create index reports_post_idx on public.reports (target_post_id) where target_post_id is not null;
create index reports_message_idx on public.reports (target_message_id) where target_message_id is not null;
create index reports_user_idx on public.reports (target_user_id) where target_user_id is not null;

-- ---------------------------------------------------------------------------
-- blocks
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

-- ---------------------------------------------------------------------------
-- sanctions: ends_at이 null이면 영구
-- ---------------------------------------------------------------------------
create table public.sanctions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        public.sanction_type not null,
  reason      text check (reason is null or char_length(reason) <= 500),
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz,
  created_by  uuid references public.profiles (id) on delete set null,  -- null이면 시스템 자동 제재
  created_at  timestamptz not null default now(),
  constraint sanctions_period check (ends_at is null or ends_at > starts_at)
);
create index sanctions_user_idx on public.sanctions (user_id, starts_at desc);

-- ---------------------------------------------------------------------------
-- push_tokens
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  expo_token  text not null unique check (char_length(expo_token) <= 200),
  platform    public.push_platform not null,
  updated_at  timestamptz not null default now()
);
create index push_tokens_user_idx on public.push_tokens (user_id);

-- ---------------------------------------------------------------------------
-- category_subscriptions
-- ---------------------------------------------------------------------------
create table public.category_subscriptions (
  user_id      uuid     not null references public.profiles (id) on delete cascade,
  zone_id      smallint not null references public.zones (id),
  category_id  smallint not null references public.categories (id),
  created_at   timestamptz not null default now(),
  primary key (user_id, zone_id, category_id)
);
-- 새 글이 올라왔을 때 구독자를 찾는 쿼리용
create index category_subscriptions_target_idx on public.category_subscriptions (zone_id, category_id);

-- ---------------------------------------------------------------------------
-- banned_words: 함수 내부에서만 읽는다
-- ---------------------------------------------------------------------------
create table public.banned_words (
  word        text primary key check (word = lower(word) and char_length(word) between 1 and 50),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- deleted_accounts: 탈퇴 후 재가입 제재 회피 방지. 90일 뒤 cron이 삭제한다.
-- email_hash = encode(digest(lower(email) || email_pepper(), 'sha256'), 'hex')
-- ---------------------------------------------------------------------------
create table public.deleted_accounts (
  email_hash    text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  noshow_count  smallint not null default 0,
  deleted_at    timestamptz not null default now()
);
create index deleted_accounts_deleted_idx on public.deleted_accounts (deleted_at);

-- ---------------------------------------------------------------------------
-- rate_events: 요청 횟수 제한. 1시간 지난 행은 cron이 삭제한다.
-- ---------------------------------------------------------------------------
create table public.rate_events (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  action      text not null,
  created_at  timestamptz not null default now()
);
create index rate_events_lookup_idx on public.rate_events (user_id, action, created_at desc);
create index rate_events_created_idx on public.rate_events (created_at);

-- ---------------------------------------------------------------------------
-- RLS: 모든 테이블에 켠다(정책은 SV4)
-- ---------------------------------------------------------------------------
alter table public.payout_accounts         enable row level security;
alter table public.reports                 enable row level security;
alter table public.blocks                  enable row level security;
alter table public.sanctions               enable row level security;
alter table public.push_tokens             enable row level security;
alter table public.category_subscriptions  enable row level security;
alter table public.banned_words            enable row level security;
alter table public.deleted_accounts        enable row level security;
alter table public.rate_events             enable row level security;
