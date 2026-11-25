import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryClient';
import type { ProfileRow } from '@/types/models';

import * as api from './api';
import type { CreateProfileInput, UpdateProfileInput } from './schema';

/**
 * 내 프로필. userId가 없으면(세션 없음) 조회하지 않는다.
 * data === null 이면 "프로필 없음"이라는 확정된 결과이고, isPending이면 아직 모르는 상태다.
 */
export function useMe(userId: string | null | undefined) {
  return useQuery<ProfileRow | null, AppError>({
    queryKey: queryKeys.me,
    queryFn: () => api.getMe(userId as string),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation<ProfileRow, AppError, CreateProfileInput>({
    mutationFn: api.createProfile,
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.me, profile),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<ProfileRow, AppError, UpdateProfileInput>({
    mutationFn: api.updateProfile,
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.me, profile),
  });
}
