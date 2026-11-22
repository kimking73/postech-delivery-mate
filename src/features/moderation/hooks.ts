import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AppError } from '@/lib/errors';

import * as api from './api';
import type { ReportInput } from './schema';

/** DUPLICATE_REPORT 에러는 화면에서 errorMessage()로 그대로 보여주면 된다. */
export function useReport() {
  return useMutation<void, AppError, ReportInput>({ mutationFn: api.report });
}

/** 차단하면 피드(차단한 사용자의 글 제외)와 방 목록이 달라지므로 함께 새로 고친다. */
function useAfterBlockChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['feed'] });
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
  };
}

export function useBlockUser() {
  const after = useAfterBlockChange();
  return useMutation<void, AppError, string>({ mutationFn: api.blockUser, onSuccess: after });
}

export function useUnblockUser() {
  const after = useAfterBlockChange();
  return useMutation<void, AppError, string>({ mutationFn: api.unblockUser, onSuccess: after });
}
