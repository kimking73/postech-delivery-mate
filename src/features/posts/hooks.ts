import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LIMITS } from '@/constants/limits';
import type { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/queryClient';
import type {
  CategoryRow,
  FeedPost,
  ParticipantRow,
  PayoutAccountRow,
  PickupPlaceRow,
  PostRow,
  RoomSummary,
  ZoneRow,
} from '@/types/models';

import * as api from './api';
import type { CreatePostInput, PayoutAccountInput } from './schema';

// ───────── 참조 데이터 ─────────
const REF_STALE = 60 * 60_000;

export const useZones = () =>
  useQuery<ZoneRow[], AppError>({
    queryKey: queryKeys.zones,
    queryFn: api.getZones,
    staleTime: REF_STALE,
  });

export const useCategories = () =>
  useQuery<CategoryRow[], AppError>({
    queryKey: queryKeys.categories,
    queryFn: api.getCategories,
    staleTime: REF_STALE,
  });

export const usePickupPlaces = (zoneId: number | null | undefined) =>
  useQuery<PickupPlaceRow[], AppError>({
    queryKey: queryKeys.pickupPlaces(zoneId ?? 0),
    queryFn: () => api.getPickupPlaces(zoneId as number),
    enabled: zoneId != null,
    staleTime: REF_STALE,
  });

// ───────── 피드·글 ─────────
/**
 * 구역별 피드. 마감 시각 커서 무한 스크롤.
 * 화면은 `data.pages.flat()`으로 목록을 만든다.
 */
export function useFeed(zoneId: number | null | undefined) {
  return useInfiniteQuery<
    FeedPost[],
    AppError,
    { pages: FeedPost[][] },
    ReturnType<typeof queryKeys.feed>,
    api.FeedCursor | null
  >({
    queryKey: queryKeys.feed(zoneId ?? 0),
    enabled: zoneId != null,
    initialPageParam: null,
    queryFn: ({ pageParam }) => api.getFeed(zoneId as number, pageParam, LIMITS.feed.pageSize),
    getNextPageParam: (last) =>
      last.length < LIMITS.feed.pageSize
        ? undefined
        : (() => {
            const tail = last[last.length - 1];
            return tail ? { deadline_at: tail.deadline_at, id: tail.id } : undefined;
          })(),
  });
}

export const usePost = (postId: string | undefined) =>
  useQuery<PostRow, AppError>({
    queryKey: queryKeys.post(postId ?? ''),
    queryFn: () => api.getPost(postId as string),
    enabled: !!postId,
  });

export const useMyRooms = () =>
  useQuery<RoomSummary[], AppError>({ queryKey: queryKeys.rooms, queryFn: api.getMyRooms });

/** 글·피드·방 목록을 한꺼번에 새로 고치는 공통 후처리 */
function useInvalidatePostQueries() {
  const queryClient = useQueryClient();
  return (postId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.feedRoot });
    queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
    if (postId) queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
  };
}

export function useCreatePost() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<PostRow, AppError, CreatePostInput>({
    mutationFn: api.createPost,
    onSuccess: (post) => invalidate(post.id),
  });
}

// NOTE(CL4): 아래 변경 훅의 낙관적 업데이트와 에러 코드별 롤백은 CL4에서 추가한다.
export function useJoin() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<ParticipantRow, AppError, string>({
    mutationFn: api.joinPost,
    onSettled: (_d, _e, postId) => invalidate(postId),
  });
}

export function useLeave() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<void, AppError, string>({
    mutationFn: api.leavePost,
    onSettled: (_d, _e, postId) => invalidate(postId),
  });
}

export function useKickMember() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<void, AppError, { postId: string; userId: string }>({
    mutationFn: ({ postId, userId }) => api.kickMember(postId, userId),
    onSettled: (_d, _e, v) => invalidate(v.postId),
  });
}

export function useClosePost() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<PostRow, AppError, string>({
    mutationFn: api.closePost,
    onSettled: (_d, _e, postId) => invalidate(postId),
  });
}

export function useCompletePost() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<PostRow, AppError, string>({
    mutationFn: api.completePost,
    onSettled: (_d, _e, postId) => invalidate(postId),
  });
}

export function useCancelPost() {
  const invalidate = useInvalidatePostQueries();
  return useMutation<PostRow, AppError, { postId: string; reason?: string | null }>({
    mutationFn: ({ postId, reason }) => api.cancelPost(postId, reason),
    onSettled: (_d, _e, v) => invalidate(v.postId),
  });
}

// ───────── 송금받을 계좌 (본인) ─────────
export const usePayoutAccount = (userId: string | null | undefined) =>
  useQuery<PayoutAccountRow | null, AppError>({
    queryKey: queryKeys.payoutAccount,
    queryFn: () => api.getPayoutAccount(userId as string),
    enabled: !!userId,
  });

export function useSetPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation<void, AppError, PayoutAccountInput>({
    mutationFn: api.setPayoutAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.payoutAccount }),
  });
}
