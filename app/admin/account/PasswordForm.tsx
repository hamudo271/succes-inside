'use client';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { KeyRound } from 'lucide-react';
import { changePasswordAction, type PasswordState } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admBtn" disabled={pending}>
      <KeyRound size={15} /> {pending ? '바꾸는 중…' : '비밀번호 바꾸기'}
    </button>
  );
}

export default function PasswordForm() {
  const [state, action] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // 성공하면 입력칸을 비운다. 비밀번호가 화면에 남아 있을 이유가 없다.
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="admForm">
      <label>
        <span>현재 비밀번호</span>
        <input name="current" type="password" required autoComplete="current-password" maxLength={200} />
      </label>
      <label>
        <span>새 비밀번호</span>
        <input name="next" type="password" required autoComplete="new-password" maxLength={200} />
      </label>
      <label>
        <span>새 비밀번호 확인</span>
        <input name="confirm" type="password" required autoComplete="new-password" maxLength={200} />
      </label>
      <p className="admHelp">12자 이상 · 소문자·대문자·숫자·기호 중 3종류 이상</p>
      {state.error && <p className="admError" role="alert">{state.error}</p>}
      {state.ok && <p className="admFlash" role="status">{state.ok}</p>}
      <Submit />
    </form>
  );
}
