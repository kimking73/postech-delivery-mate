-- SV4: 프로필·계좌 RPC 구현 (아키텍처 §4, §3-3)
-- 0005의 스텁을 create or replace로 채운다. 시그니처(이름·인자·반환)는 §4 계약 그대로다.
--   create_profile, update_profile, set_payout_account, get_host_account
-- 에러는 모두 errcode P0001 + message <CODE> (§4-4).

-- ===========================================================================
-- 내부 헬퍼(API로 노출하지 않는다: grant 없음)
-- ===========================================================================

-- 닉네임 검사: 2~12자, 한글·영문·숫자·_ 만(§2-2) → INVALID_INPUT, 금칙어 → BANNED_WORD
create or replace function public.assert_nickname(p_nickname text)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_nickname is null
     or char_length(p_nickname) not between 2 and 12
     or p_nickname !~ '^[가-힣a-zA-Z0-9_]+$' then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;
  perform public.assert_clean(p_nickname);
end;
$$;

-- 생활 구역 검사: 존재하고 활성 상태여야 한다 → 아니면 INVALID_INPUT
create or replace function public.assert_zone(p_zone_id smallint)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_zone_id is null
     or not exists (select 1 from public.zones z where z.id = p_zone_id and z.is_active) then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;
end;
$$;

-- ===========================================================================
-- 닉네임 중복은 대소문자를 무시한다(Abc와 abc는 같은 닉네임: 사칭 방지).
--   위반 시 constraint_name = 'profiles_nickname_lower_key' → RPC가 NICKNAME_TAKEN으로 바꾼다.
-- ===========================================================================
create unique index profiles_nickname_lower_key on public.profiles (lower(nickname));

-- ===========================================================================
-- create_profile
--   - 약관·EULA 동의가 둘 다 true가 아니면 INVALID_INPUT
--   - 이미 프로필이 있으면 INVALID_STATE
--   - 닉네임 형식 INVALID_INPUT, 금칙어 BANNED_WORD, 중복(대소문자 무시) NICKNAME_TAKEN
--   - verified_at·terms_agreed_at·eula_agreed_at = now()
--   - 탈퇴 기록(deleted_accounts)이 있으면 noshow_count를 이어 받는다(재가입으로 노쇼 기록 세탁 방지).
--     정지 기간이 남은 채 탈퇴했으면 hook(§3-1, 0009 blocked_until)에서 이미 가입이 막힌다.
-- ===========================================================================
create or replace function public.create_profile(
  nickname      text,
  home_zone_id  smallint,
  agree_terms   boolean,
  agree_eula    boolean
) returns public.profiles
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_nick    text := trim(create_profile.nickname);
  v_email   text;
  v_noshow  smallint;
  v_row     public.profiles;
  v_con     text;
begin
  perform public.assert_member(false);  -- 프로필이 아직 없는 상태에서 부른다

  if exists (select 1 from public.profiles p where p.id = v_uid) then
    raise exception using errcode = 'P0001', message = 'INVALID_STATE';
  end if;

  if not coalesce(create_profile.agree_terms, false) or not coalesce(create_profile.agree_eula, false) then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;

  perform public.assert_nickname(v_nick);
  perform public.assert_zone(create_profile.home_zone_id);

  if exists (select 1 from public.profiles p where lower(p.nickname) = lower(v_nick)) then
    raise exception using errcode = 'P0001', message = 'NICKNAME_TAKEN';
  end if;

  select lower(trim(u.email)) into v_email from auth.users u where u.id = v_uid;
  select d.noshow_count into v_noshow
    from public.deleted_accounts d
   where d.email_hash = encode(extensions.digest(v_email || public.email_pepper(), 'sha256'), 'hex');

  begin
    insert into public.profiles as p
      (id, nickname, home_zone_id, verified_at, terms_agreed_at, eula_agreed_at, noshow_count)
    values
      (v_uid, v_nick, create_profile.home_zone_id, now(), now(), now(), coalesce(v_noshow, 0))
    returning p.* into v_row;
  exception when unique_violation then
    -- 동시 요청: 닉네임 경합이면 NICKNAME_TAKEN, 같은 사용자가 두 번 부른 것이면 INVALID_STATE
    get stacked diagnostics v_con = constraint_name;
    if v_con = 'profiles_pkey' then
      raise exception using errcode = 'P0001', message = 'INVALID_STATE';
    end if;
    raise exception using errcode = 'P0001', message = 'NICKNAME_TAKEN';
  end;

  return v_row;
end;
$$;

-- ===========================================================================
-- update_profile: null인 인자는 바꾸지 않는다. 모두 null이면 현재 프로필을 그대로 돌려준다.
--   닉네임·구역은 create_profile과 같은 규칙으로 검사한다. is_admin 등 나머지 컬럼은 바꿀 수 없다.
-- ===========================================================================
create or replace function public.update_profile(
  nickname            text     default null,
  home_zone_id        smallint default null,
  notify_chat         boolean  default null,
  notify_post_events  boolean  default null,
  notify_marketing    boolean  default null
) returns public.profiles
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_nick  text := trim(update_profile.nickname);
  v_row   public.profiles;
begin
  perform public.assert_member();

  if v_nick is not null then
    perform public.assert_nickname(v_nick);
    if exists (select 1 from public.profiles p where lower(p.nickname) = lower(v_nick) and p.id <> v_uid) then
      raise exception using errcode = 'P0001', message = 'NICKNAME_TAKEN';
    end if;
  end if;

  if update_profile.home_zone_id is not null then
    perform public.assert_zone(update_profile.home_zone_id);
  end if;

  begin
    update public.profiles as p
       set nickname           = coalesce(v_nick, p.nickname),
           home_zone_id       = coalesce(update_profile.home_zone_id, p.home_zone_id),
           notify_chat        = coalesce(update_profile.notify_chat, p.notify_chat),
           notify_post_events = coalesce(update_profile.notify_post_events, p.notify_post_events),
           notify_marketing   = coalesce(update_profile.notify_marketing, p.notify_marketing)
     where p.id = v_uid
    returning p.* into v_row;
  exception when unique_violation then
    raise exception using errcode = 'P0001', message = 'NICKNAME_TAKEN';
  end;

  return v_row;
end;
$$;

-- ===========================================================================
-- set_payout_account: 본인 계좌 upsert. 빈 문자열은 null로 본다. 모두 null이면 행을 삭제한다.
--   - 은행 3필드(bank_name, account_number, account_holder)는 모두 채우거나 모두 비운다.
--   - bank_name 1~30자, account_number 숫자 묶음을 '-' 하나로 이은 형식(예: 123-456-7890) 10~20자, account_holder 2~20자
--   - toss_link는 https://toss.me/<아이디> 형식, 200자 이하
--   - 은행 계좌나 toss_link 중 하나는 있어야 한다(§2-2 check)
--   어긋나면 INVALID_INPUT.
-- ===========================================================================
create or replace function public.set_payout_account(
  bank_name       text default null,
  account_number  text default null,
  account_holder  text default null,
  toss_link       text default null
) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_bank    text := nullif(trim(set_payout_account.bank_name), '');
  v_number  text := nullif(trim(set_payout_account.account_number), '');
  v_holder  text := nullif(trim(set_payout_account.account_holder), '');
  v_toss    text := nullif(trim(set_payout_account.toss_link), '');
begin
  perform public.assert_member();

  if v_bank is null and v_number is null and v_holder is null and v_toss is null then
    delete from public.payout_accounts a where a.user_id = v_uid;
    return;
  end if;

  if (v_bank is null) <> (v_number is null) or (v_bank is null) <> (v_holder is null)
     or (v_bank is not null and char_length(v_bank) not between 1 and 30)
     or (v_number is not null and (v_number !~ '^[0-9]+(-[0-9]+)*$' or char_length(v_number) not between 10 and 20))
     or (v_holder is not null and char_length(v_holder) not between 2 and 20)
     or (v_toss is not null and (v_toss !~ '^https://toss\.me/[^/\s?#]+/?$' or char_length(v_toss) > 200)) then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;

  begin
    insert into public.payout_accounts as a
      (user_id, bank_name, account_number, account_holder, toss_link, updated_at)
    values
      (v_uid, v_bank, v_number, v_holder, v_toss, now())
    on conflict (user_id) do update
      set bank_name      = excluded.bank_name,
          account_number = excluded.account_number,
          account_holder = excluded.account_holder,
          toss_link      = excluded.toss_link,
          updated_at     = excluded.updated_at;
  exception when check_violation then
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end;
end;
$$;

-- ===========================================================================
-- get_host_account: can_view_payout(post_id)가 false면 NOT_PARTICIPANT.
--   현재 방장(posts.host_id)의 계좌를 돌려준다. 계좌가 없으면 0행(앱은 maybeSingle()).
-- ===========================================================================
create or replace function public.get_host_account(post_id uuid)
returns table (
  bank_name       text,
  account_number  text,
  account_holder  text,
  toss_link       text
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform public.assert_member();

  if not public.can_view_payout(get_host_account.post_id) then
    raise exception using errcode = 'P0001', message = 'NOT_PARTICIPANT';
  end if;

  return query
    select a.bank_name, a.account_number, a.account_holder, a.toss_link
      from public.posts p
      join public.payout_accounts a on a.user_id = p.host_id
     where p.id = get_host_account.post_id;
end;
$$;

-- ===========================================================================
-- 실행 권한: create or replace는 기존 권한을 유지하지만 계약을 분명히 하려고 다시 적는다.
-- 내부 헬퍼(assert_nickname, assert_zone)는 0005의 기본 권한 회수로 닫힌 상태다.
-- ===========================================================================
revoke execute on function
  public.assert_nickname(text),
  public.assert_zone(smallint)
from public, anon, authenticated;

revoke execute on function
  public.create_profile(text, smallint, boolean, boolean),
  public.update_profile(text, smallint, boolean, boolean, boolean),
  public.set_payout_account(text, text, text, text),
  public.get_host_account(uuid)
from public, anon;

grant execute on function
  public.create_profile(text, smallint, boolean, boolean),
  public.update_profile(text, smallint, boolean, boolean, boolean),
  public.set_payout_account(text, text, text, text),
  public.get_host_account(uuid)
to authenticated;
