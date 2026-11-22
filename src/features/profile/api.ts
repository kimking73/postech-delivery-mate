import { callRpc, supabase, USE_MOCK } from '@/lib/supabase';
import { toAppError } from '@/lib/errors';
import type { ProfileRow } from '@/types/database';
import { mockProfile, sleep } from '@/types/mockData';

import type { CreateProfileInput, UpdateProfileInput } from './schema';

let mockMe: ProfileRow | null = mockProfile;

/** 내 프로필. 프로필이 없으면 null (가드가 profile-setup으로 보낸다). */
export async function getMe(userId: string): Promise<ProfileRow | null> {
  if (USE_MOCK) {
    await sleep(100);
    return mockMe;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw toAppError(error);
  return (data as ProfileRow | null) ?? null;
}

export async function createProfile(input: CreateProfileInput): Promise<ProfileRow> {
  if (USE_MOCK) {
    await sleep();
    mockMe = { ...mockProfile, nickname: input.nickname, home_zone_id: input.home_zone_id };
    return mockMe;
  }
  return callRpc('create_profile', input);
}

export async function updateProfile(input: UpdateProfileInput): Promise<ProfileRow> {
  if (USE_MOCK) {
    await sleep();
    mockMe = { ...(mockMe ?? mockProfile), ...input };
    return mockMe;
  }
  return callRpc('update_profile', input);
}
