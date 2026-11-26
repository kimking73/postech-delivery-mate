// ⚠ CL3 실기기 확인 전용 임시 화면용 부품. 머지 금지(wip/cl3-e2e-screens). FE12·FE3가 진짜 화면을 만들면 지운다.
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { toAppError } from '@/lib/errors';

export function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  keyboard?: 'default' | 'email-address' | 'number-pad';
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-gray-500">{props.label}</Text>
      <TextInput
        className="rounded-lg border border-gray-300 px-3 py-2 text-base text-black"
        value={props.value}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secure}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.keyboard ?? 'default'}
      />
    </View>
  );
}

export function Btn({
  title,
  onPress,
  tone = 'dark',
  disabled,
}: {
  title: string;
  onPress: () => void;
  tone?: 'dark' | 'light';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`items-center rounded-lg px-4 py-3 ${tone === 'dark' ? 'bg-black' : 'border border-gray-300 bg-white'} ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={tone === 'dark' ? 'text-white' : 'text-black'}>{title}</Text>
    </Pressable>
  );
}

type LogFn = (label: string, run: () => Promise<unknown>) => Promise<void>;
const LogCtx = createContext<LogFn>(async () => {});
export const useRun = () => useContext(LogCtx);

/** 화면 + 하단 결과 로그. run(label, fn)이 성공·실패와 에러 코드를 줄로 남긴다. */
export function E2EScreen({ title, children }: { title: string; children: ReactNode }) {
  const [lines, setLines] = useState<string[]>([]);
  const run = useCallback<LogFn>(async (label, fn) => {
    const t = new Date().toLocaleTimeString('ko-KR');
    try {
      const r = await fn();
      setLines((l) => [
        `✅ ${t} ${label}${r === undefined ? '' : ' → ' + JSON.stringify(r)}`,
        ...l,
      ]);
    } catch (e) {
      const a = toAppError(e);
      const c = a.cause as { code?: unknown; message?: unknown; status?: unknown } | undefined;
      setLines((l) => [
        `❌ ${t} ${label}\n   앱코드=${a.code} · 화면문구="${a.message}"\n   서버: code=${String(c?.code ?? '-')} status=${String(c?.status ?? '-')} msg=${String(c?.message ?? '-')}`,
        ...l,
      ]);
    }
  }, []);
  return (
    <LogCtx.Provider value={run}>
      <ScrollView className="flex-1 bg-white" contentContainerClassName="gap-3 p-5 pt-14">
        <Text className="text-xl font-bold text-black">{title}</Text>
        {children}
        <View className="mt-2 gap-2 rounded-lg bg-gray-100 p-3">
          <Text className="text-xs font-bold text-gray-600">결과 로그 (최신이 위)</Text>
          {lines.length === 0 ? <Text className="text-xs text-gray-400">아직 없음</Text> : null}
          {lines.map((l, i) => (
            <Text key={i} className="text-xs text-gray-800">
              {l}
            </Text>
          ))}
        </View>
      </ScrollView>
    </LogCtx.Provider>
  );
}
