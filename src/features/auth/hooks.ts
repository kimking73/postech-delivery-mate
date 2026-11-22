import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryClient';

import * as api from './api';
import type { AppSession, SignInResult } from './api';
import type { SignInInput, SignUpInput, VerifyOtpInput } from './schema';

/**
 * 현재 세션. `ready`가 false인 동안은 저장된 세션을 복원하는 중이다(스플래시 유지).
 * 세션이 바뀌면 서버 상태 캐시를 비워 다른 계정의 데이터가 남지 않게 한다.
 */
export function useSession(): { session: AppSession | null; ready: boolean } {
  const queryClient = useQueryClient();
  const [state, setState] = useState<{ session: AppSession | null; ready: boolean }>({
    session: null,
    ready: false,
  });

  useEffect(() => {
    let alive = true;
    api
      .getSession()
      .then((session) => alive && setState({ session, ready: true }))
      .catch(() => alive && setState({ session: null, ready: true }));

    let lastUserId: string | null | undefined;
    const unsubscribe = api.onSessionChange((session) => {
      if (!alive) return;
      const userId = session?.userId ?? null;
      if (lastUserId !== undefined && lastUserId !== userId) queryClient.clear();
      lastUserId = userId;
      setState({ session, ready: true });
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [queryClient]);

  return state;
}

export function useSignUp() {
  return useMutation<void, AppError, { input: SignUpInput; captchaToken?: string }>({
    mutationFn: ({ input, captchaToken }) => api.signUp(input, captchaToken),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, VerifyOtpInput>({
    mutationFn: api.verifyOtp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useResendSignupOtp() {
  return useMutation<void, AppError, string>({ mutationFn: api.resendSignupOtp });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation<SignInResult, AppError, SignInInput>({
    mutationFn: api.signIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useRequestPasswordReset() {
  return useMutation<void, AppError, { email: string; captchaToken?: string }>({
    mutationFn: ({ email, captchaToken }) => api.requestPasswordReset(email, captchaToken),
  });
}

export function useUpdatePassword() {
  return useMutation<void, AppError, string>({ mutationFn: api.updatePassword });
}

export function useReauthenticate() {
  return useMutation<void, AppError, { email: string; password: string }>({
    mutationFn: ({ email, password }) => api.reauthenticate(email, password),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, void>({
    mutationFn: api.signOut,
    onSuccess: () => queryClient.clear(),
  });
}
