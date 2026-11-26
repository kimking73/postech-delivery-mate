// ⚠ CL3 실기기 확인 전용 임시 화면. 머지 금지.
import { useState } from 'react';

import { useSignOut, useUpdatePassword } from '@/features/auth/hooks';
import { passwordSchema } from '@/features/auth/schema';
import { Btn, E2EScreen, Field, useRun } from '@/dev/e2e-ui';

function Body() {
  const run = useRun();
  const [pw, setPw] = useState('');
  const update = useUpdatePassword();
  const out = useSignOut();
  return (
    <>
      <Field label="새 비밀번호" value={pw} onChangeText={setPw} secure />
      <Btn
        title="새 비밀번호 저장"
        onPress={() => run('비밀번호 변경', () => update.mutateAsync(passwordSchema.parse(pw)))}
      />
      <Btn title="로그아웃" tone="light" onPress={() => run('로그아웃', () => out.mutateAsync())} />
    </>
  );
}

export default function ResetPasswordE2E() {
  return (
    <E2EScreen title="새 비밀번호 정하기 (임시)">
      <Body />
    </E2EScreen>
  );
}
