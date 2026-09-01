'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Send, CheckCircle2 } from 'lucide-react';
import { applyAction, type ApplyState } from '../public-actions';

const TYPES = ['출연 신청', '교육 과정 문의', '기타 문의'];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="apSubmit" disabled={pending}>
      <Send size={15} /> {pending ? '보내는 중…' : '신청 보내기'}
    </button>
  );
}

export default function ApplyForm({ initialType }: { initialType: string }) {
  const [state, action] = useActionState<ApplyState, FormData>(applyAction, {});

  if (state.ok) {
    return (
      <div className="apCard apDone" role="status">
        <CheckCircle2 size={36} />
        <h2>신청이 접수됐습니다</h2>
        <p>내용을 검토한 뒤 남겨주신 연락처로 회신드리겠습니다.<br />보통 일주일 안에 답을 드립니다.</p>
      </div>
    );
  }

  return (
    <form action={action} className="apCard">
      {/* 허니팟 — 사람에게는 보이지 않는다 */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />

      <div className="apField">
        <label htmlFor="ap-type">문의 유형</label>
        <select id="ap-type" name="type" defaultValue={initialType}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="apGrid2">
        <div className="apField">
          <label htmlFor="ap-name">성함</label>
          <input id="ap-name" name="name" required maxLength={60} autoComplete="name" />
        </div>
        <div className="apField">
          <label htmlFor="ap-business">사업체명 <span>선택</span></label>
          <input id="ap-business" name="business" maxLength={120} autoComplete="organization" />
        </div>
      </div>

      <div className="apField">
        <label htmlFor="ap-contact">연락받을 곳</label>
        <input id="ap-contact" name="contact" required maxLength={120}
               placeholder="이메일 또는 전화번호" autoComplete="email" />
      </div>

      <div className="apField">
        <label htmlFor="ap-message">어떤 이야기인가요?</label>
        <textarea id="ap-message" name="message" required rows={7} maxLength={4000} minLength={10}
                  placeholder="어떤 사업을 하고 계신지, 어떤 결정과 과정을 지나오셨는지 편하게 적어주세요." />
      </div>

      {state.error && <p className="apError" role="alert">{state.error}</p>}
      <Submit />
      <p className="apPrivacy">남겨주신 정보는 검토와 회신에만 사용합니다.</p>
    </form>
  );
}
