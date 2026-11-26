// ⚠ CL3 실기기 확인 전용 임시 화면. 머지 금지. FE3가 진짜 화면을 만들면 지운다.
import { useState } from 'react';
import { Text } from 'react-native';

import {
  useRequestPasswordReset,
  useResendSignupOtp,
  useSignIn,
  useSignUp,
  useVerifyOtp,
} from '@/features/auth/hooks';
import { emailSchema, passwordSchema } from '@/features/auth/schema';
import { Btn, E2EScreen, Field, useRun } from '@/dev/e2e-ui';
import { USE_MOCK } from '@/lib/supabase';

function Body() {
  const run = useRun();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const signUp = useSignUp();
  const signIn = useSignIn();
  const verify = useVerifyOtp();
  const resend = useResendSignupOtp();
  const reset = useRequestPasswordReset();

  const checkEmail = () => {
    const r = emailSchema.safeParse(email);
    if (!r.success) throw new Error(r.error.issues.map((i) => i.message).join(' / '));
    return r.data;
  };

  return (
    <>
      <Text className="text-xs text-gray-500">
        모드: {USE_MOCK ? '⚠ 목 모드 (서버 아님)' : '실서버(Supabase)'}
      </Text>
      <Field label="메일" value={email} onChangeText={setEmail} keyboard="email-address" />
      <Field
        label="비밀번호 (8자 이상, 영문+숫자)"
        value={password}
        onChangeText={setPassword}
        secure
      />
      <Btn
        title="1. 가입 (코드 메일 발송)"
        onPress={() =>
          run('가입', async () => {
            const e = checkEmail();
            const p = passwordSchema.parse(password);
            await signUp.mutateAsync({ input: { email: e, password: p } });
          })
        }
      />
      <Field
        label="메일로 받은 6자리 코드"
        value={token}
        onChangeText={setToken}
        keyboard="number-pad"
      />
      <Btn
        title="2. 가입 코드 확인"
        onPress={() =>
          run('가입 코드 확인', () =>
            verify.mutateAsync({ email: checkEmail(), token, type: 'signup' }),
          )
        }
      />
      <Btn
        title="코드 다시 받기"
        tone="light"
        onPress={() => run('코드 재전송', () => resend.mutateAsync(checkEmail()))}
      />
      <Btn
        title="3. 로그인"
        onPress={() => run('로그인', () => signIn.mutateAsync({ email: checkEmail(), password }))}
      />
      <Btn
        title="비밀번호 재설정 코드 받기"
        tone="light"
        onPress={() => run('재설정 코드 요청', () => reset.mutateAsync({ email: checkEmail() }))}
      />
      <Btn
        title="재설정 코드 확인 (→ 새 비밀번호 화면)"
        tone="light"
        onPress={() =>
          run('재설정 코드 확인', () =>
            verify.mutateAsync({ email: checkEmail(), token, type: 'recovery' }),
          )
        }
      />
    </>
  );
}

export default function SignInE2E() {
  return (
    <E2EScreen title="CL3 실기기 확인 (임시)">
      <Body />
    </E2EScreen>
  );
}
