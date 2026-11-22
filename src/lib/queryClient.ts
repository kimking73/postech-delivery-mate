import { QueryClient } from '@tanstack/react-query';

import { toAppError } from './errors';

/** 재시도하지 않는 에러: 사용자가 고쳐야 하는 서버 규칙 위반. 네트워크·알 수 없는 오류만 재시도한다. */
const RETRYABLE = new Set(['NETWORK', 'UNKNOWN']);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) =>
        failureCount < 2 && RETRYABLE.has(toAppError(error).code),
      refetchOnWindowFocus: false, // RN은 AppState로 별도 처리(CL5)
    },
    mutations: { retry: false },
  },
});

/** 서버 상태 쿼리 키 (아키텍처 §9). 키는 여기서만 만든다. */
export const queryKeys = {
  me: ['me'] as const,
  feed: (zoneId: number) => ['feed', zoneId] as const,
  post: (id: string) => ['post', id] as const,
  rooms: ['rooms'] as const,
  messages: (postId: string) => ['messages', postId] as const,
  hostAccount: (postId: string) => ['hostAccount', postId] as const,
  payoutAccount: ['payoutAccount'] as const,
  zones: ['zones'] as const,
  categories: ['categories'] as const,
  pickupPlaces: (zoneId: number) => ['pickupPlaces', zoneId] as const,
};
