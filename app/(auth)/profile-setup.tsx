// ⚠ CL3 실기기 확인 전용 임시 화면. 머지 금지.
import { useState } from 'react';
import { Text } from 'react-native';

import { useSignOut } from '@/features/auth/hooks';
import { useCreateProfile } from '@/features/profile/hooks';
import { useZones } from '@/features/posts/hooks';
import { Btn, E2EScreen, Field, useRun } from '@/dev/e2e-ui';

function Body() {
  const run = useRun();
  const [nickname, setNickname] = useState('');
  const [zoneId, setZoneId] = useState<number | null>(null);
  const zones = useZones();
  const create = useCreateProfile();
  const out = useSignOut();
  return (
    <>
      <Field label="닉네임 (2~12자)" value={nickname} onChangeText={setNickname} />
      <Text className="text-xs text-gray-500">
        구역 {zones.isPending ? '불러오는 중…' : `${zones.data?.length ?? 0}개`}
        {zones.isError ? ` · 오류: ${zones.error.message}` : ''}
        {zones.data?.length === 0 ? ' · 0건이면 staging에 구역 데이터가 없는 것(#21)' : ''}
      </Text>
      {zones.data?.map((z) => (
        <Btn
          key={z.id}
          title={`${zoneId === z.id ? '✔ ' : ''}${z.name}`}
          tone={zoneId === z.id ? 'dark' : 'light'}
          onPress={() => setZoneId(z.id)}
        />
      ))}
      <Btn
        title="프로필 만들기 (약관·EULA 동의 포함)"
        disabled={zoneId === null}
        onPress={() =>
          run('프로필 생성', () =>
            create.mutateAsync({
              nickname,
              home_zone_id: zoneId as number,
              agree_terms: true,
              agree_eula: true,
            }),
          )
        }
      />
      <Btn title="로그아웃" tone="light" onPress={() => run('로그아웃', () => out.mutateAsync())} />
    </>
  );
}

export default function ProfileSetupE2E() {
  return (
    <E2EScreen title="프로필 만들기 (임시)">
      <Body />
    </E2EScreen>
  );
}
