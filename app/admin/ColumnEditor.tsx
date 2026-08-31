'use client';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';
import { saveColumnAction, type SaveState } from './actions';

const CATS = ['창업', '마케팅', '브랜딩', '커리어', 'AI·테크', '생산성', '재테크'];

export type EditorValues = {
  id?: number; slug?: string; cat?: string; title?: string; excerpt?: string;
  quote?: string; author?: string; role?: string;
  published?: boolean; featured?: boolean; body?: string;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admBtn" disabled={pending}>
      <Save size={15} /> {pending ? '저장 중…' : '저장'}
    </button>
  );
}

export default function ColumnEditor({ initial = {} }: { initial?: EditorValues }) {
  const [state, action] = useActionState<SaveState, FormData>(saveColumnAction, {});
  const [body, setBody] = useState(initial.body ?? '');
  const chars = body.replace(/\s+/g, '').length;

  return (
    <main className="admWrap">
      <header className="admTop">
        <div>
          <Link className="admBack" href="/admin"><ArrowLeft size={14} /> 목록</Link>
          <h1>{initial.id ? '칼럼 수정' : '새 칼럼'}</h1>
        </div>
      </header>

      <form action={action} className="admEditor">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        <div className="admField">
          <label htmlFor="f-title">제목</label>
          <input id="f-title" name="title" defaultValue={initial.title} required maxLength={200}
                 placeholder="예: 성장이 멈췄다고 느껴질 때" />
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-cat">카테고리</label>
            <input id="f-cat" name="cat" defaultValue={initial.cat ?? CATS[0]} required list="cats" maxLength={40} />
            <datalist id="cats">{CATS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="admField">
            <label htmlFor="f-slug">주소 (비우면 제목에서 자동 생성)</label>
            <input id="f-slug" name="slug" defaultValue={initial.slug} maxLength={80}
                   placeholder="direction-over-speed" spellCheck={false} />
          </div>
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-author">글쓴이</label>
            <input id="f-author" name="author" defaultValue={initial.author} required maxLength={60} />
          </div>
          <div className="admField">
            <label htmlFor="f-role">글쓴이 소개</label>
            <input id="f-role" name="role" defaultValue={initial.role} maxLength={80} placeholder="예: SaaS 창업가" />
          </div>
        </div>

        <div className="admField">
          <label htmlFor="f-excerpt">요약 <span className="hint">목록 카드에 보이는 2줄</span></label>
          <textarea id="f-excerpt" name="excerpt" defaultValue={initial.excerpt} rows={2} maxLength={500} />
        </div>

        <div className="admField">
          <label htmlFor="f-quote">핵심 문장 <span className="hint">상세 페이지의 인용 카드</span></label>
          <input id="f-quote" name="quote" defaultValue={initial.quote} maxLength={300} />
        </div>

        <div className="admField">
          <label htmlFor="f-body">
            본문
            <span className="hint">빈 줄로 문단을 나누고, 소제목은 <code>## 제목</code> 으로 씁니다. 마지막 문단은 마무리로 들어갑니다.</span>
          </label>
          <textarea
            id="f-body" name="body" required rows={22} value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={'도입 문단을 씁니다.\n\n두 번째 도입 문단.\n\n## 첫 번째 소제목\n\n본문 문단.\n\n## 두 번째 소제목\n\n본문 문단.\n\n마지막 문단은 마무리가 됩니다.'}
          />
          <p className="admCount">공백 제외 {chars.toLocaleString()}자 · 예상 읽기 {Math.max(1, Math.round(chars / 500))}분</p>
        </div>

        <div className="admChecks">
          <label><input type="checkbox" name="published" defaultChecked={initial.published} /> 공개 발행</label>
          <label><input type="checkbox" name="featured" defaultChecked={initial.featured} /> 이번 주 대표 칼럼으로 지정</label>
        </div>

        {state.error && <p className="admError" role="alert">{state.error}</p>}

        <div className="admActions">
          <Submit />
          <Link className="admBtn ghost" href="/admin">취소</Link>
        </div>
      </form>
    </main>
  );
}
