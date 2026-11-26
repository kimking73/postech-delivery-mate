import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import type { RpcArgs, RpcName, RpcReturns, TableName, Tables } from '@/types/models';

import { toAppError } from './errors';
import { mmkvAuthStorage } from './mmkv';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * app.config.ts의 extra.appVariant: development | preview | production.
 * 값이 없으면 'unknown'으로 둔다. 'development'로 두면 설정이 빠진 출시 빌드도 검사를 통과해 버린다.
 */
export const APP_VARIANT = String(Constants.expoConfig?.extra?.appVariant ?? 'unknown');

/**
 * 목 모드: Supabase 환경변수가 없거나 EXPO_PUBLIC_USE_MOCK=1이면 켜진다.
 * 각 feature의 api.ts가 이 값을 보고 목 데이터 또는 실제 RPC 중 하나를 쓴다.
 * SV3 머지 후 .env에 URL/KEY를 넣고 EXPO_PUBLIC_USE_MOCK=0으로 바꾸면 된다.
 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1' || url === '' || anonKey === '';

/**
 * 설정 오류. development 빌드에서만 목 모드를 허용한다.
 * preview·production에서 env가 빠졌는데 가짜 데이터로 정상처럼 돌면 QA에서 놓치기 때문이다.
 * import 시점에 throw하면 app/_layout.tsx가 스플래시를 내리기 전에 메시지 없이 죽으므로,
 * 상태만 export하고 _layout.tsx가 설정 오류 화면을 보여 준다.
 */
export const CONFIG_ERROR: string | null =
  USE_MOCK && APP_VARIANT !== 'development'
    ? `${APP_VARIANT} 빌드는 목 모드로 실행할 수 없어요. EXPO_PUBLIC_SUPABASE_URL·EXPO_PUBLIC_SUPABASE_ANON_KEY를 넣고 EXPO_PUBLIC_USE_MOCK을 빼 주세요.`
    : null;

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
