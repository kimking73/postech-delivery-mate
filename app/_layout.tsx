import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useSession } from '@/features/auth/hooks';
import { resolveGuardTarget } from '@/features/auth/schema';
import { useMe } from '@/features/profile/hooks';
import { queryClient } from '@/lib/queryClient';
import { supabase, USE_MOCK } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * 앱이 포그라운드일 때만 토큰을 자동 갱신한다(supabase-js RN 권장 방식).
 * 백그라운드에서는 타이머를 멈추고, 돌아오면 다시 시작한다.
 */
function useAuthAutoRefresh() {
  useEffect(() => {
    if (USE_MOCK) return;
    supabase.auth.startAutoRefresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => {
      sub.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
}

/**
 * 인증 가드 (아키텍처 §3-3). 규칙 자체는 features/auth/schema.ts의 resolveGuardTarget에 있다.
 *  1. 세션 없음 → (auth)  2. 프로필 없음 → profile-setup  3. 둘 다 있음 → (tabs)
 */
function AuthGate() {
  useAuthAutoRefresh();
  const router = useRouter();
  const segments = useSegments();
  const { session, ready } = useSession();
  const me = useMe(session?.userId);

  const hasSession = !!session;
  // 프로필 조회 에러(네트워크 등)는 "프로필 없음"으로 보지 않는다. 가드는 판단을 미룬다.
  const profileReady = hasSession && !me.isPending && !me.isError;
  const hasProfile = !!me.data;

  const target = resolveGuardTarget({ ready, hasSession, profileReady, hasProfile, segments });

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  const settled = ready && (!hasSession || profileReady) && !target;
  useEffect(() => {
    if (settled) SplashScreen.hideAsync().catch(() => {});
  }, [settled]);

  return <Slot />;
}

// NOTE: 채팅 재구독·놓친 메시지 채우기(CL5), 알림 탭 이동(CL6), 딥링크(CL8, P5)는 이 파일에 이어 붙인다.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
