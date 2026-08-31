'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { LogIn } from 'lucide-react';
import { loginAction, type LoginState } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admBtn" disabled={pending}>
      <LogIn size={16} /> {pending ? '확인 중…' : '로그인'}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="admForm" autoComplete="on">
      <label>
        <span>아이디</span>
        <input
          name="username" type="text" required autoFocus
          autoComplete="username" maxLength={64} spellCheck={false}
        />
      </label>
      <label>
        <span>비밀번호</span>
        <input
          name="password" type="password" required
          autoComplete="current-password" maxLength={200}
        />
      </label>
      {state.error && <p className="admError" role="alert">{state.error}</p>}
      <Submit />
    </form>
  );
}
