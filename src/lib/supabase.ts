import { createClient } from '@supabase/supabase-js';

import type { RpcArgs, RpcName, RpcReturns, TableName, Tables } from '@/types/models';

import { toAppError } from './errors';
import { mmkvAuthStorage } from './mmkv';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * 목 모드: Supabase 환경변수가 없거나 EXPO_PUBLIC_USE_MOCK=1이면 켜진다.
 * 각 feature의 api.ts가 이 값을 보고 목 데이터 또는 실제 RPC 중 하나를 쓴다.
 * SV3 머지 후 .env에 URL/KEY를 넣고 EXPO_PUBLIC_USE_MOCK=0으로 바꾸면 된다.
 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1' || url === '' || anonKey === '';

/**
 * 임시 수기 타입 단계에서는 비제네릭 클라이언트를 쓴다(supabase-js 제네릭이 gen types 모양을 요구).
 * SV3 머지 후 `createClient<Database>`로 바꾸고 callRpc/selectRows의 캐스팅을 걷어낸다.
 */
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'mock-anon-key', {
  auth: {
    storage: mmkvAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * 타입이 붙은 RPC 호출. 에러는 AppError(한국어 문구 포함)로 바꿔 던진다.
 * 주의: supabase-js의 rpc 제네릭은 gen types 형태에 의존한다.
 * 임시 수기 타입에서 맞지 않으면 여기서만 캐스팅한다.
 */
export async function callRpc<N extends RpcName>(
  name: N,
  args?: RpcArgs<N>,
): Promise<RpcReturns<N>> {
  // 주의: supabase.rpc를 변수로 떼어 내 호출하면 this가 사라져 TypeError가 난다. 반드시 메서드로 호출한다.
  const client = supabase as unknown as {
    rpc: (fn: string, a?: unknown) => PromiseLike<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw toAppError(error);
  return data as RpcReturns<N>;
}

/** 테이블 SELECT 결과 타입 보조. 에러는 AppError로 던진다. */
export async function selectRows<T extends TableName>(
  run: () => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<Tables<T>[]> {
  const { data, error } = await run();
  if (error) throw toAppError(error);
  return (data ?? []) as Tables<T>[];
}
