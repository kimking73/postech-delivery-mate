-- SV4 PR #15 리뷰 1번: auth 사용자가 delete-account를 거치지 않고 지워져도 개인 데이터가 남지 않게 한다
--   0009에서 profiles.id → auth.users FK(ON DELETE CASCADE)를 끊었다. 그래서 대시보드나
--   auth.admin.deleteUser로 사용자를 지우면 계좌·푸시 토큰·구독·차단 행과 실제 닉네임이 그대로 남았다.
--   delete-account의 1·2단계(아키텍처 §2-2 "탈퇴 처리")를 auth.users 삭제 트리거로도 수행한다.
--   - delete-account가 먼저 익명화했으면(deleted_at 있음) 프로필은 건드리지 않는다. 삭제는 몇 번 해도 같다.
--   - 3단계(deleted_accounts 기록)는 메일 pepper가 필요해 delete-account에만 둔다.
--     그래서 delete-account를 거치지 않은 삭제는 노쇼·정지 이력이 재가입으로 이어지지 않는다.

create or replace function public.handle_auth_user_deleted()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- 대체 닉네임: '탈퇴_' + id 앞 9자(hex) = 12자. profiles_nickname_format(2~12자, 한글·영문·숫자·_)을 지킨다
  update public.profiles
     set nickname           = '탈퇴_' || left(replace(old.id::text, '-', ''), 9),
         deleted_at         = now(),
         notify_chat        = false,
         notify_post_events = false,
         notify_marketing   = false
   where id = old.id
     and deleted_at is null;

  delete from public.payout_accounts        where user_id = old.id;
  delete from public.push_tokens            where user_id = old.id;
  delete from public.category_subscriptions where user_id = old.id;
  delete from public.blocks                 where blocker_id = old.id or blocked_id = old.id;
  return old;
end $$;

revoke execute on function public.handle_auth_user_deleted() from public, anon, authenticated;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_auth_user_deleted();
