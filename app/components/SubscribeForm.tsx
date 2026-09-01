'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Check } from 'lucide-react';
import { subscribeAction, type SubscribeState } from '../public-actions';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? '전송 중…' : label}</button>;
}

/**
 * 뉴스레터 구독 폼 — 홈 사이드바·칼럼 CTA 공용.
 * 감싸는 쪽의 .newsletter / .clCtaForm 스타일을 그대로 입는다.
 */
export default function SubscribeForm({ source, label = '구독하기' }: { source: string; label?: string }) {
  const [state, action] = useActionState<SubscribeState, FormData>(subscribeAction, {});

  if (state.ok) {
    return <p className="subDone" role="status"><Check size={15} /> {state.message}</p>;
  }
  return (
    <>
      <form action={action} className="subForm">
        <input type="hidden" name="source" value={source} />
        {/* 허니팟 — 사람에게는 보이지 않는다 */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
        <input type="email" name="email" required placeholder="이메일 주소" aria-label="이메일 주소" maxLength={254} />
        <Submit label={label} />
      </form>
      {state.error && <p className="subError" role="alert">{state.error}</p>}
    </>
  );
}
