-- SV4 PR #15 재리뷰 1번: 탈퇴 대체 닉네임 선점으로 auth 사용자 삭제가 실패하던 문제
--   0010의 대체 닉네임('탈퇴_' + id 앞 9자)은 일반 사용자도 create_profile·update_profile로 만들 수 있었다.
--   public_profiles로 남의 id를 알 수 있으므로, 미리 그 이름을 차지하면 트리거 UPDATE가 unique 위반을 내고
--   auth 삭제 전체가 롤백됐다. 탈퇴자로 위장하는 데도 쓸 수 있었다.
--   1) '탈퇴_' 접두사를 예약한다(사용자 닉네임으로 쓸 수 없음 → INVALID_INPUT)
--   2) 그래도 겹치면(자연 충돌, 예약 전 데이터) 트리거가 무작위 값으로 다시 시도한다

-- ---------------------------------------------------------------------------
-- 1) 예약 접두사
-- ---------------------------------------------------------------------------
create or replace function public.assert_nickname(p_nickname text)
returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_nickname is null
     or char_length(p_nickname) not between 2 and 12
     or p_nickname !~ '^[가-힣a-zA-Z0-9_]+$'
     or left(p_nickname, 3) = '탈퇴_' then  -- 탈퇴 대체 닉네임 전용(아키텍처 §2-2)
    raise exception using errcode = 'P0001', message = 'INVALID_INPUT';
  end if;
  perform public.assert_clean(p_nickname);
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) 트리거: 겹치면 무작위 9자로 최대 5번 다시 시도
-- ---------------------------------------------------------------------------
create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_suffix text := left(replace(old.id::text, '-', ''), 9);
begin
  for i in 1..6 loop
    begin
      update public.profiles
         set nickname           = '탈퇴_' || v_suffix,
             deleted_at         = now(),
             notify_chat        = false,
             notify_post_events = false,
             notify_marketing   = false
       where id = old.id
         and deleted_at is null;
      exit;
    exception when unique_violation then
      if i = 6 then raise; end if;
      v_suffix := left(replace(gen_random_uuid()::text, '-', ''), 9);
    end;
  end loop;

  delete from public.payout_accounts        where user_id = old.id;
  delete from public.push_tokens            where user_id = old.id;
  delete from public.category_subscriptions where user_id = old.id;
  delete from public.blocks                 where blocker_id = old.id or blocked_id = old.id;
  return old;
end $$;

revoke execute on function public.handle_auth_user_deleted() from public, anon, authenticated;
