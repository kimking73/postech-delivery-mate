import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LIMITS } from '@/constants/limits';
import type { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryClient';
import type { HostAccount, MessageRow } from '@/types/database';

import * as api from './api';
import type { SendMessageInput } from './schema';

/**
 * 채팅 메시지. 최신 → 과거 순 페이지(`data.pages`), 위로 스크롤하면 fetchNextPage로 과거를 더 불러온다.
 * 실시간 수신(Broadcast 구독, 중복 제거, 재구독, 놓친 메시지 채우기)은 CL5에서 이 키에 붙인다.
 */
export function useMessages(postId: string | undefined) {
  return useInfiniteQuery<MessageRow[], AppError, { pages: MessageRow[][] }, ReturnType<typeof queryKeys.messages>, number | null>({
    queryKey: queryKeys.messages(postId ?? ''),
    enabled: !!postId,
    initialPageParam: null,
    queryFn: ({ pageParam }) => api.getMessages(postId as string, pageParam, LIMITS.message.pageSize),
    getNextPageParam: (last) =>
      last.length < LIMITS.message.pageSize ? undefined : (last[last.length - 1]?.id ?? undefined),
  });
}

// NOTE(CL5): 낙관적 전송(client_msg_id), 실패 시 재전송 버튼, 수신 id 중복 제거는 CL5에서 구현한다.
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<MessageRow, AppError, SendMessageInput>({
    mutationFn: api.sendMessage,
    onSuccess: (_msg, v) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(v.post_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, { postId: string; messageId: number }>({
    mutationFn: ({ postId, messageId }) => api.markRead(postId, messageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.rooms }),
  });
}

// ───────── 송금 ─────────
export const useHostAccount = (postId: string | undefined, enabled = true) =>
  useQuery<HostAccount | null, AppError>({
    queryKey: queryKeys.hostAccount(postId ?? ''),
    queryFn: () => api.getHostAccount(postId as string),
    enabled: !!postId && enabled,
    retry: false, // NOT_PARTICIPANT 등은 재시도해도 같다
  });

/** 송금 상태가 바뀌면 방 정보와 메시지(시스템 메시지)를 새로 고친다. */
function useAfterPayChange() {
  const queryClient = useQueryClient();
  return (postId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.messages(postId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
  };
}

export function useMarkPaid() {
  const after = useAfterPayChange();
  return useMutation<void, AppError, string>({
    mutationFn: api.markPaid,
    onSettled: (_d, _e, postId) => after(postId),
  });
}

export function useConfirmPaid() {
  const after = useAfterPayChange();
  return useMutation<void, AppError, { postId: string; userId: string }>({
    mutationFn: ({ postId, userId }) => api.confirmPaid(postId, userId),
    onSettled: (_d, _e, v) => after(v.postId),
  });
}

export function useRejectPaid() {
  const after = useAfterPayChange();
  return useMutation<void, AppError, { postId: string; userId: string }>({
    mutationFn: ({ postId, userId }) => api.rejectPaid(postId, userId),
    onSettled: (_d, _e, v) => after(v.postId),
  });
}
