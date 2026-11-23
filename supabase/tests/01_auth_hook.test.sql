-- SV3: Before User Created Hook (아키텍처 §3-1, 기획서 §1-1 메일 판정 규칙)
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(9);

create function pg_temp.hook(p_email text) returns jsonb language sql as $$
  select public.hook_before_user_created(jsonb_build_object('user', jsonb_build_object('email', p_email)));
$$;

-- 허용
select is(pg_temp.hook('student@postech.ac.kr'), '{}'::jsonb, '정상 POSTECH 메일은 허용한다');
select is(pg_temp.hook('  Student.Name@POSTECH.AC.KR '), '{}'::jsonb, '앞뒤 공백·대문자는 정규화 후 허용한다');

-- 거부 4종
select is(pg_temp.hook('a@mail.postech.ac.kr') -> 'error' ->> 'http_code', '403', '하위 도메인은 거부한다');
select is(pg_temp.hook('a@postech.ac.kr.evil.com') -> 'error' ->> 'http_code', '403', '접미사 위장은 거부한다');
select is(pg_temp.hook('a b@postech.ac.kr') -> 'error' ->> 'http_code', '403', '중간 공백은 거부한다');
select is(pg_temp.hook('a@gmail.com') -> 'error' ->> 'http_code', '403', '다른 도메인은 거부한다');
select is(
  pg_temp.hook('a@gmail.com') -> 'error' ->> 'message',
  'POSTECH 메일(@postech.ac.kr)만 가입할 수 있습니다', '거부 메시지가 명세와 같다');

-- 탈퇴 후 재가입: noshow_count >= 3이면 거부, 미만이면 허용
insert into public.deleted_accounts (email_hash, noshow_count) values
  (encode(extensions.digest('banned@postech.ac.kr' || public.email_pepper(), 'sha256'), 'hex'), 3),
  (encode(extensions.digest('okay@postech.ac.kr'   || public.email_pepper(), 'sha256'), 'hex'), 2);

select is(pg_temp.hook('Banned@postech.ac.kr') -> 'error' ->> 'message', '이용이 제한된 계정입니다',
  '노쇼 3회 이상으로 탈퇴한 메일은 재가입을 거부한다');
select is(pg_temp.hook('okay@postech.ac.kr'), '{}'::jsonb, '노쇼 3회 미만이면 재가입을 허용한다');

select * from finish();
rollback;
