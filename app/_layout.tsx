import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// CL1 최소 골격. Provider·인증 가드는 CL2(P3)가 이 파일을 대체한다(global.css import는 유지).
export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </>
  );
}
