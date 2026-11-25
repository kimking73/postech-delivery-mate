-- SV3: 헬퍼 함수(아키텍처 §2-3)와 가입 도메인 강제 hook(§3-1)
-- 공통: SECURITY DEFINER, set search_path = ''. 모든 객체는 스키마를 붙여 쓴다.
-- 실행 권한(GRANT/REVOKE)은 0005 끝에서 한 번에 정리한다.

-- ---------------------------------------------------------------------------
-- is_verified_member(): RLS와 RPC의 전제 조건
-- JWT의 email이 @postech.ac.kr이고, 메일 인증을 마쳤고, 탈퇴하지 않은 프로필이 있으면 true.
-- ---------------------------------------------------------------------------
create or replace function public.is_verified_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(lower((select auth.jwt()) ->> 'email') ~ '^[a-z0-9._%+-]+@postech\.ac\.kr$', false)
     and exists (
           select 1
             from auth.users u
             join public.profiles p on p.id = u.id
            where u.id = (select auth.uid())
              and u.email_confirmed_at is not null
              and p.deleted_at is null
         );
$$;

-- ---------------------------------------------------------------------------
-- is_participant(p_post): 현재 사용자가 그 글에 joined 상태로 있는지
-- ---------------------------------------------------------------------------
create or replace function public.is_participant(p_post uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.participants pa
     where pa.post_id = p_post
       and pa.user_id = (select auth.uid())
       and pa.state = 'joined'
  );
$$;

-- ---------------------------------------------------------------------------
-- is_blocked_between(a, b): 어느 한쪽이라도 상대를 차단했는지
-- ---------------------------------------------------------------------------
create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.blocks bl
     where (bl.blocker_id = a and bl.blocked_id = b)
        or (bl.blocker_id = b and bl.blocked_id = a)
  );
$$;

-- ---------------------------------------------------------------------------
-- is_sanctioned(uid): 지금 유효한 suspend 또는 ban이 있으면 true (warn은 제외)
-- ---------------------------------------------------------------------------
create or replace function public.is_sanctioned(uid uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.sanctions s
     where s.user_id = uid
       and s.type in ('suspend', 'ban')
       and s.starts_at <= now()
       and (s.ends_at is null or s.ends_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- can_view_payout(p_post): 방장 계좌 노출의 유일한 관문
-- 현재 사용자가 그 글의 joined 참여자이고, 글이 closed 또는 completed일 때 true.
-- ---------------------------------------------------------------------------
create or replace function public.can_view_payout(p_post uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.is_verified_member()
     and exists (
           select 1
             from public.participants pa
             join public.posts p on p.id = pa.post_id
            where pa.post_id = p_post
              and pa.user_id = (select auth.uid())
              and pa.state = 'joined'
              and p.status in ('closed', 'completed')
         );
$$;

-- ---------------------------------------------------------------------------
-- assert_rate(action, max, window): window 안에 action이 max회 이상이면 RATE_LIMITED.
-- 통과하면 이번 요청을 rate_events에 기록한다(그래서 VOLATILE).
-- 같은 (사용자, action)의 동시 요청은 트랜잭션 advisory lock으로 직렬화한다.
-- ---------------------------------------------------------------------------
create or replace function public.assert_rate(p_action text, p_max int, p_window interval)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_cnt int;
begin
  if v_uid is null then
    raise exception using errcode = 'P0001', message = 'NOT_VERIFIED';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || p_action, 0));

  select count(*) into v_cnt
    from public.rate_events r
   where r.user_id = v_uid
     and r.action = p_action
     and r.created_at > now() - p_window;

  if v_cnt >= p_max then
    raise exception using errcode = 'P0001', message = 'RATE_LIMITED';
  end if;

  insert into public.rate_events (user_id, action) values (v_uid, p_action);
end;
$$;

-- ---------------------------------------------------------------------------
-- assert_clean(text): 금칙어(부분 일치, 대소문자·공백 무시)가 있으면 BANNED_WORD
-- ---------------------------------------------------------------------------
create or replace function public.assert_clean(p_text text)
returns void
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_norm text := lower(regexp_replace(coalesce(p_text, ''), '\s', '', 'g'));
begin
  if v_norm = '' then
    return;
  end if;
  if exists (select 1 from public.banned_words w where strpos(v_norm, w.word) > 0) then
    raise exception using errcode = 'P0001', message = 'BANNED_WORD';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- assert_member(p_require_profile): 모든 RPC의 공통 시작 검사(§4 머리말)
--   - 메일이 @postech.ac.kr이 아니거나 인증 전이면 NOT_VERIFIED
--   - p_require_profile이고 프로필이 없거나 탈퇴했으면 PROFILE_REQUIRED
--   - 정지·영구 정지 중이면 SANCTIONED
-- create_profile만 p_require_profile = false로 부른다. API로는 노출하지 않는다.
-- ---------------------------------------------------------------------------
create or replace function public.assert_member(p_require_profile boolean default true)
returns void
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null
     or not coalesce(lower((select auth.jwt()) ->> 'email') ~ '^[a-z0-9._%+-]+@postech\.ac\.kr$', false)
     or not exists (select 1 from auth.users u where u.id = v_uid and u.email_confirmed_at is not null) then
    raise exception using errcode = 'P0001', message = 'NOT_VERIFIED';
  end if;

  if p_require_profile and not public.is_verified_member() then
    raise exception using errcode = 'P0001', message = 'PROFILE_REQUIRED';
  end if;

  if public.is_sanctioned(v_uid) then
    raise exception using errcode = 'P0001', message = 'SANCTIONED';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- email_pepper(): Vault의 email_pepper 비밀값. 없으면 예외(설정 누락을 숨기지 않는다).
-- 실행: 함수 소유자와 supabase_auth_admin만(0005에서 권한 정리).
-- ---------------------------------------------------------------------------
create or replace function public.email_pepper()
returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v text;
begin
  select ds.decrypted_secret into v
    from vault.decrypted_secrets ds
   where ds.name = 'email_pepper'
   limit 1;
  if v is null or v = '' then
    raise exception 'email_pepper is not configured in Vault';
  end if;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- hook_before_user_created (§3-1): Before User Created Auth Hook
-- 대시보드(또는 config.toml [auth.hook.before_user_created])에 등록한다.
-- ---------------------------------------------------------------------------
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(event -> 'user' ->> 'email'));
begin
  if v_email is null or v_email !~ '^[a-z0-9._%+-]+@postech\.ac\.kr$' then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'POSTECH 메일(@postech.ac.kr)만 가입할 수 있습니다'));
  end if;
  if exists (select 1 from public.deleted_accounts d
              where d.email_hash = encode(extensions.digest(v_email || public.email_pepper(), 'sha256'), 'hex')
                and d.noshow_count >= 3) then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', '이용이 제한된 계정입니다'));
  end if;
  return '{}'::jsonb;
end;
$$;
