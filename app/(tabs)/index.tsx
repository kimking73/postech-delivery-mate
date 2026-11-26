// ⚠ CL3 실기기 확인 전용 임시 화면. 머지 금지.
import { Text } from 'react-native';

import { useSession, useSignOut } from '@/features/auth/hooks';
import { useMe } from '@/features/profile/hooks';
import { Btn, E2EScreen, useRun } from '@/dev/e2e-ui';

function Body() {
  const run = useRun();
  const { session } = useSession();
  const me = useMe(session?.userId);
  const out = useSignOut();
  return (
    <>
      <Text className="text-base text-black">🎉 로그인·프로필까지 완료된 상태</Text>
      <Text className="text-xs text-gray-700">메일: {session?.email}</Text>
      <Text className="text-xs text-gray-700">
        프로필: {me.data ? `${me.data.nickname} (구역 ${me.data.home_zone_id})` : '조회 중/없음'}
      </Text>
      <Btn title="로그아웃" tone="light" onPress={() => run('로그아웃', () => out.mutateAsync())} />
    </>
  );
}

export default function HomeE2E() {
  return (
    <E2EScreen title="홈 (임시)">
      <Body />
    </E2EScreen>
  );
}
