import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';

import { signOut } from '@/features/auth/api';
import { useSession } from '@/features/auth/hooks';
import { resolveGuardTarget } from '@/features/auth/schema';
import { useMe } from '@/features/profile/hooks';
import { errorMessage } from '@/lib/errors';
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

/** 프로필 조회가 실패했을 때 보여 주는 재시도 화면. 문구·디자인은 P1·P2가 다듬는다. */
function ProfileLoadError({
  message,
  onRetry,
  onSignOut,
}: {
  message: string;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white p-6">
      <Text className="text-center text-base text-black">{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        className="rounded-lg bg-black px-6 py-3"
      >
        <Text className="text-white">다시 시도</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onSignOut} className="px-6 py-2">
        <Text className="text-gray-500">로그아웃</Text>
      </Pressable>
    </View>
  );
}

/**
 * 인증 가드 (아키텍처 §3-3). 규칙 자체는 features/auth/schema.ts의 resolveGuardTarget에 있다.
 *  1. 세션 없음 → (auth)  2. 프로필 없음 → profile-setup  3. 둘 다 있음 → (tabs)
 *  + 비밀번호 재설정 중(recovering)에는 reset-password에 머문다.
 */
function AuthGate() {
  useAuthAutoRefresh();
  const router = useRouter();
  const segments = useSegments();
  const { session, ready } = useSession();
  const me = useMe(session?.userId);

  const hasSession = !!session;
  // 프로필 조회 에러(네트워크 등)는 "프로필 없음"으로 보지 않는다. 가드는 판단을 미루고 재시도 화면을 보여 준다.
  const profileError = hasSession && me.isError;
  const profileReady = hasSession && !me.isPending && !me.isError;
  const hasProfile = !!me.data;

  const target = resolveGuardTarget({
    ready,
    hasSession,
    recovering: session?.recovery ?? false,
    profileReady,
    hasProfile,
    segments,
  });

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  // 스플래시는 판단이 끝났거나(이동할 곳 없음) 에러 화면을 보여 줄 때 내린다. 에러에서 멈추지 않도록 한다.
  const settled = ready && (!hasSession || profileReady || profileError) && !target;
  useEffect(() => {
    if (settled) SplashScreen.hideAsync().catch(() => {});
  }, [settled]);

  if (profileError) {
    return (
      <>
        <ProfileLoadError
          message={errorMessage(me.error)}
          onRetry={() => void me.refetch()}
          onSignOut={() => void signOut()}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="dark" />
    </>
  );
}

// NOTE: 채팅 재구독·놓친 메시지 채우기(CL5), 알림 탭 이동(CL6), 딥링크(CL8, P5)는 이 파일에 이어 붙인다.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
