import { Text, View } from 'react-native';

import { mmkv } from '@/lib/mmkv';
import { APP_VARIANT, USE_MOCK } from '@/lib/supabase';

// CL1 동작 확인용 임시 화면. FE12(P1)가 (tabs)/index.tsx를 만들 때 이 파일을 지운다.
export default function Index() {
  const launches = (mmkv.getNumber('cl1.launches') ?? 0) + 1;
  mmkv.set('cl1.launches', launches);

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white px-6">
      <Text className="text-2xl font-bold text-gray-900">APP_NAME</Text>
      <Text className="text-base text-gray-600">dev client 실행 성공</Text>
      <Text className="text-sm text-gray-500">
        환경: {APP_VARIANT} · {USE_MOCK ? '목 모드' : 'Supabase 연결'} · 실행 {launches}회
      </Text>
    </View>
  );
}
