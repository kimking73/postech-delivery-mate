import { createMMKV } from 'react-native-mmkv';

/**
 * 로컬 저장소. 세션 토큰과 가벼운 UI 상태를 담는다.
 * react-native-mmkv v4 API(`createMMKV`, Nitro 기반, New Architecture 필요)를 가정한다. v3이 설치되면 이 파일만 고친다(`new MMKV`, `delete`).
 * 의존성 추가는 P5(CL1) 소관이다.
 */
export const mmkv = createMMKV({ id: 'app-storage' });

/** supabase-js `auth.storage` 어댑터 */
export const mmkvAuthStorage = {
  getItem: (key: string): string | null => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkv.set(key, value),
  removeItem: (key: string): void => {
    mmkv.remove(key);
  },
};
