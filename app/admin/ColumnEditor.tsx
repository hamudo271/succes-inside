'use client';
import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Save, ArrowLeft, Check, Minus } from 'lucide-react';
import { saveColumnAction, type SaveState } from './actions';
import {
  slugify, parseKeywords, textWidth, SITE, TITLE_SUFFIX, TITLE_MAX, DESC_MIN, DESC_MAX,
} from '../../lib/seo';

const CATS = ['창업', '마케팅', '브랜딩', '커리어', 'AI·테크', '생산성', '재테크'];

export type EditorValues = {
  id?: number; slug?: string; cat?: string; title?: string; excerpt?: string;
  quote?: string; author?: string; role?: string;
  published?: boolean; featured?: boolean; body?: string;
  seoTitle?: string; seoDesc?: string; keywords?: string;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admBtn" disabled={pending}>
      <Save size={15} /> {pending ? '저장 중…' : '저장'}
    </button>
  );
}

/* ─────────── 검색 점검 ───────────
 * 글을 쓰는 동안 오른쪽에서 계속 다시 계산된다. 저장을 막지는 않는다 —
 * 검색엔진이 실제로 보는 것(제목·설명·주소·소제목·본문)만 본다. */

type Check = { ok: boolean; must: boolean; label: string; note: string };

const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase();
const has = (hay: string, needle: string) => !!needle && squash(hay).includes(squash(needle));
const han = (w: number) => `한글 약 ${Math.round(w / 2)}자`;

function audit(a: { title: string; desc: string; slug: string; focus: string; body: string }): Check[] {
  const tw = textWidth(a.title + TITLE_SUFFIX);
  const dw = textWidth(a.desc);
  const heads = [...a.body.matchAll(/^\s*##\s+(.+?)\s*$/gm)].map(m => m[1]!);
  const paras = a.body.split(/\n\s*\n/).map(p => p.trim()).filter(p => p && !/^##\s/.test(p));
  const chars = a.body.replace(/\s+/g, '').length;
  const longest = paras.reduce((m, p) => Math.max(m, p.replace(/\s+/g, '').length), 0);
  const ascii = /^[a-z0-9-]*$/.test(a.slug);
  const f = a.focus;

  return [
    { must: true, ok: !!a.title && tw <= TITLE_MAX, label: '검색 제목 길이',
      note: !a.title ? '제목이 비어 있습니다' : `${han(tw)} (브랜드명 포함) · 권장 ${han(TITLE_MAX)} 이내` },
    { must: true, ok: dw >= DESC_MIN && dw <= DESC_MAX, label: '검색 설명 길이',
      note: dw === 0 ? '비어 있으면 검색엔진이 본문에서 임의로 뽑습니다' : `${han(dw)} · 권장 한글 ${DESC_MIN / 2}~${DESC_MAX / 2}자` },
    { must: true, ok: !!f, label: '핵심 키워드',
      note: f ? `“${f}”` : '키워드 칸의 첫 번째 단어가 핵심 키워드가 됩니다' },
    { must: true, ok: has(a.title, f), label: '핵심 키워드가 제목에',
      note: f ? (has(a.title, f) ? '들어 있습니다' : '제목 앞쪽에 넣을수록 좋습니다') : '—' },
    { must: true, ok: has(a.desc, f), label: '핵심 키워드가 설명에',
      note: f ? (has(a.desc, f) ? '들어 있습니다' : '설명 첫 문장에 자연스럽게') : '—' },
    { must: true, ok: has(paras[0] ?? '', f), label: '핵심 키워드가 첫 문단에',
      note: f ? (has(paras[0] ?? '', f) ? '들어 있습니다' : '도입 문단에서 한 번은 언급하세요') : '—' },
    { must: false, ok: heads.length >= 2, label: '소제목 2개 이상',
      note: heads.length ? `${heads.length}개` : '## 소제목 으로 글의 뼈대를 세우세요' },
    { must: false, ok: heads.some(h => has(h, f)), label: '핵심 키워드가 소제목에',
      note: f ? (heads.some(h => has(h, f)) ? '들어 있습니다' : '소제목 하나에는 넣는 게 좋습니다') : '—' },
    { must: false, ok: chars >= 1000, label: '본문 1,000자 이상',
      note: `공백 제외 ${chars.toLocaleString()}자` },
    { must: false, ok: longest > 0 && longest <= 300, label: '문단 길이',
      note: longest > 300 ? `가장 긴 문단 ${longest}자 — 300자 안쪽으로 나누세요` : '읽기 좋은 길이입니다' },
    { must: false, ok: ascii && a.slug.length > 0, label: '영문 주소',
      note: ascii ? (a.slug ? '공유해도 깨지지 않습니다' : '제목에서 자동 생성됩니다') : '한글 주소는 공유 시 %EC%84%B1… 으로 보입니다' },
  ];
}

export default function ColumnEditor({ initial = {} }: { initial?: EditorValues }) {
  const [state, action] = useActionState<SaveState, FormData>(saveColumnAction, {});
  const [title, setTitle] = useState(initial.title ?? '');
  const [slug, setSlug] = useState(initial.slug ?? '');
  const [cat, setCat] = useState(initial.cat ?? CATS[0]!);
  const [author, setAuthor] = useState(initial.author ?? '성공인사이드');
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? '');
  const [body, setBody] = useState(initial.body ?? '');
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle ?? '');
  const [seoDesc, setSeoDesc] = useState(initial.seoDesc ?? '');
  const [keywords, setKeywords] = useState(initial.keywords ?? '');

  const chars = body.replace(/\s+/g, '').length;
  const effTitle = seoTitle.trim() || title.trim();
  const effDesc = seoDesc.trim() || excerpt.trim();
  const effSlug = slugify(slug || title);
  const focus = parseKeywords(keywords)[0] ?? '';

  const checks = useMemo(
    () => audit({ title: effTitle, desc: effDesc, slug: effSlug, focus, body }),
    [effTitle, effDesc, effSlug, focus, body],
  );
  const must = checks.filter(c => c.must);
  const nice = checks.filter(c => !c.must);
  const mustOk = must.filter(c => c.ok).length;
  const niceOk = nice.filter(c => c.ok).length;

  return (
    <main className="admWrap admWide">
      <header className="admTop">
        <div>
          <Link className="admBack" href="/admin"><ArrowLeft size={14} /> 목록</Link>
          <h1>{initial.id ? '칼럼 수정' : '새 칼럼'}</h1>
        </div>
      </header>

      <div className="admEditorGrid">
      <form action={action} className="admEditor">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        <div className="admField">
          <label htmlFor="f-title">제목</label>
          <input id="f-title" name="title" value={title} onChange={e => setTitle(e.target.value)} required maxLength={200}
                 placeholder="예: 성장이 멈췄다고 느껴질 때" />
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-cat">카테고리</label>
            <input id="f-cat" name="cat" value={cat} onChange={e => setCat(e.target.value)} required list="cats" maxLength={40} />
            <datalist id="cats">{CATS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="admField">
            <label htmlFor="f-slug">주소 <span className="hint">비우면 제목에서 만듭니다 · 영문·숫자·하이픈 권장</span></label>
            <input id="f-slug" name="slug" value={slug} onChange={e => setSlug(e.target.value)} maxLength={80}
                   placeholder="direction-over-speed" spellCheck={false} />
            <p className="admUrl">{SITE.replace('https://', '')}/columns/<b>{effSlug || '…'}</b></p>
          </div>
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-author">글쓴이</label>
            <input id="f-author" name="author" value={author} onChange={e => setAuthor(e.target.value)} required maxLength={60} />
          </div>
          <div className="admField">
            <label htmlFor="f-role">글쓴이 소개</label>
            <input id="f-role" name="role" defaultValue={initial.role ?? '편집부'} maxLength={80} placeholder="예: 편집부" />
          </div>
        </div>

        <div className="admField">
          <label htmlFor="f-excerpt">요약 <span className="hint">목록에 보이는 2줄. 검색 설명을 따로 쓰지 않으면 이 글이 검색 결과에도 나갑니다.</span></label>
          <textarea id="f-excerpt" name="excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} maxLength={500} />
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

        <fieldset className="admFieldset">
          <legend>검색 최적화</legend>
          <p className="admFieldsetNote">검색 결과와 공유 카드에 나가는 문구입니다. 비우면 제목과 요약을 그대로 씁니다.</p>

          <div className="admField">
            <label htmlFor="f-seo-title">
              검색 제목
              <span className="hint">끝에 “{TITLE_SUFFIX.trim()}”가 자동으로 붙습니다 · 지금 {han(textWidth(effTitle + TITLE_SUFFIX))}</span>
            </label>
            <input id="f-seo-title" name="seo_title" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                   maxLength={120} placeholder={title || '비우면 제목을 씁니다'} />
          </div>

          <div className="admField">
            <label htmlFor="f-seo-desc">
              검색 설명
              <span className="hint">검색 결과의 두 줄 · 지금 {han(textWidth(effDesc))}</span>
            </label>
            <textarea id="f-seo-desc" name="seo_desc" value={seoDesc} onChange={e => setSeoDesc(e.target.value)}
                      rows={2} maxLength={320} placeholder={excerpt || '비우면 요약을 씁니다'} />
          </div>

          <div className="admField">
            <label htmlFor="f-keywords">키워드 <span className="hint">쉼표로 구분 · 첫 번째가 핵심 키워드 · 최대 10개</span></label>
            <input id="f-keywords" name="keywords" value={keywords} onChange={e => setKeywords(e.target.value)}
                   maxLength={600} placeholder="예: 매출 정체, 사업 방향, 창업 성장" />
          </div>
        </fieldset>

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

      <aside className="admSeo" aria-label="검색 미리보기와 점검">
        <h2>검색 결과에서</h2>
        <div className="admSerp">
          <div className="admSerpSite">
            <i>성</i>
            <div><b>성공인사이드</b><small>{SITE.replace('https://', '')} › columns › {effSlug || '…'}</small></div>
          </div>
          <h3>{effTitle ? effTitle + TITLE_SUFFIX : '제목을 쓰면 여기에 보입니다'}</h3>
          <p className={effDesc ? '' : 'empty'}>{effDesc || '요약이나 검색 설명을 쓰면 여기에 보입니다.'}</p>
        </div>

        <h2>공유 카드</h2>
        <div className="admOg">
          <div className="admOgIn">
            <div className="admOgTop"><span className="admOgMark" /><span>성공인사이드 <em>· 칼럼</em></span></div>
            <div className="admOgMid">
              <span className="admOgCat">{cat || '카테고리'}</span>
              <strong data-len={effTitle.length > 30 ? 'long' : effTitle.length > 18 ? 'mid' : 'short'}>
                {effTitle || '제목'}
              </strong>
            </div>
            <div className="admOgFoot"><span>{author || '글쓴이'}</span><span>successinside.kr</span></div>
          </div>
        </div>

        <h2>점검 <em>필수 {mustOk}/{must.length} · 권장 {niceOk}/{nice.length}</em></h2>
        <ul className="admAudit">
          {checks.map(c => (
            <li key={c.label} className={c.ok ? 'ok' : c.must ? 'miss' : 'soft'}>
              <i>{c.ok ? <Check size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}</i>
              <div><b>{c.label}</b><small>{c.note}</small></div>
            </li>
          ))}
        </ul>
      </aside>
      </div>
    </main>
  );
}
