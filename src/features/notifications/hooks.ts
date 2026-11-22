import { useMutation } from '@tanstack/react-query';

import type { AppError } from '@/lib/errors';

import * as api from './api';
import type { CategorySubscriptionInput, PushTokenInput } from './schema';

export const useRegisterPushToken = () =>
  useMutation<void, AppError, PushTokenInput>({ mutationFn: api.registerPushToken });

export const useSubscribeCategory = () =>
  useMutation<void, AppError, CategorySubscriptionInput>({ mutationFn: api.subscribeCategory });

export const useUnsubscribeCategory = () =>
  useMutation<void, AppError, CategorySubscriptionInput>({ mutationFn: api.unsubscribeCategory });
