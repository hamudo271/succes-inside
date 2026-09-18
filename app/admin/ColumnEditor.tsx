'use client';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Save, ArrowLeft, Check, Minus, ExternalLink } from 'lucide-react';
import { saveColumnAction, type SaveState } from './actions';
import { useImageInsert, ImageButton, FormatButtons } from './ImageInsert';
import { SUGGESTED_CATS } from '../columns/cats';
import {
  slugify, parseKeywords, textWidth, stripSiteName, clipWidth, SITE, TITLE_SUFFIX, TITLE_MAX, DESC_MIN, DESC_MAX,
} from '../../lib/seo';
import { plainText, links, images as imagesIn } from '../../lib/inline';

export type EditorValues = {
  id?: number; slug?: string; cat?: string; title?: string; excerpt?: string;
  quote?: string; author?: string; role?: string;
  published?: boolean; featured?: boolean; body?: string;
  seoTitle?: string; seoDesc?: string; keywords?: string;
  publishedAt?: string | null;
};

/** 폼의 모든 칸. 전부 React 상태로 들고 있어야 저장 뒤 초기화되지 않고, 바뀐 게 있는지 알 수 있다. */
type Fields = {
  title: string; slug: string; cat: string; author: string; role: string;
  excerpt: string; quote: string; body: string;
  seoTitle: string; seoDesc: string; keywords: string;
  published: boolean; featured: boolean;
};
const fromInitial = (i: EditorValues): Fields => ({
  title: i.title ?? '', slug: i.slug ?? '', cat: i.cat ?? SUGGESTED_CATS[0]!, author: i.author ?? '성공인사이드',
  role: i.role ?? '편집부', excerpt: i.excerpt ?? '', quote: i.quote ?? '', body: i.body ?? '',
  seoTitle: i.seoTitle ?? '', seoDesc: i.seoDesc ?? '', keywords: i.keywords ?? '',
  published: !!i.published, featured: !!i.featured,
});
const same = (a: Fields, b: Fields) => JSON.stringify(a) === JSON.stringify(b);

/** 브라우저 임시 저장 — 탭을 닫거나 새로고침해도 쓰던 글이 남는다. 글마다 한 칸. */
const draftKey = (id: number | null) => `si:draft:${id ?? 'new'}`;
type Draft = { f: Fields; at: string };
function readDraft(id: number | null): Draft | null {
  try { const raw = localStorage.getItem(draftKey(id)); return raw ? JSON.parse(raw) as Draft : null; } catch { return null; }
}
function writeDraft(id: number | null, f: Fields) {
  try { localStorage.setItem(draftKey(id), JSON.stringify({ f, at: new Date().toISOString() })); } catch { /* 저장 공간 없음 — 조용히 */ }
}
function clearDraft(id: number | null) {
  try { localStorage.removeItem(draftKey(id)); localStorage.removeItem(draftKey(null)); } catch { /* */ }
}

const fmtDate = (s: string) => { const d = new Date(s); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
const fmtTime = (s: string) => { const d = new Date(s); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

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
  const rawParas = a.body.split(/\n\s*\n/).map(p => p.trim()).filter(p => p && !/^##\s/.test(p));
  const paras = rawParas.map(plainText).filter(Boolean);
  const chars = paras.join('').replace(/\s+/g, '').length;
  const longest = paras.reduce((m, p) => Math.max(m, p.replace(/\s+/g, '').length), 0);
  const internal = rawParas.flatMap(links).filter(l => !l.external).length;
  const images = rawParas.flatMap(imagesIn);
  const noAlt = images.filter(i => !i.alt).length;
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
    { must: false, ok: internal >= 1, label: '내부 링크 1개 이상',
      note: internal ? `${internal}개 — 검색엔진이 사이트 안을 따라 다닙니다` : '관련 인터뷰나 칼럼으로 [글자](/columns/…) 하나는 거세요' },
    { must: false, ok: noAlt === 0, label: '이미지 설명',
      note: images.length ? (noAlt ? `설명 없는 이미지 ${noAlt}장 — ![설명](주소)의 설명은 검색엔진이 읽는 글자입니다` : `${images.length}장 모두 설명 있음`) : '이미지 없음' },
    { must: false, ok: ascii && a.slug.length > 0, label: '영문 주소',
      note: ascii ? (a.slug ? '공유해도 깨지지 않습니다' : '제목에서 자동 생성됩니다') : '한글 주소는 공유 시 %EC%84%B1… 으로 보입니다' },
  ];
}

export default function ColumnEditor({ initial = {} }: { initial?: EditorValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveColumnAction, {});
  const [id, setId] = useState<number | null>(initial.id ?? null);
  const [f, setF] = useState<Fields>(() => fromInitial(initial));
  const [saved, setSaved] = useState<Fields>(() => fromInitial(initial));       // 마지막으로 저장된 상태
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(initial.publishedAt ?? null);
  const [restore, setRestore] = useState<Draft | null>(null);                 // 불러올 임시 글
  const submitted = useRef<Fields | null>(null);                               // 저장 눌렀을 때의 값
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [dropping, setDropping] = useState(false);

  const set = <K extends keyof Fields>(k: K) => (v: Fields[K]) => setF(p => ({ ...p, [k]: v }));
  const setBody = (u: (prev: string) => string) => setF(p => ({ ...p, body: u(p.body) }));
  const img = useImageInsert(bodyRef, setBody);
  const dirty = !same(f, saved);

  /* 저장 결과 — 제자리에서 반영한다. 새 글이면 주소창을 수정 주소로 바꿔 새로고침해도 이어 쓴다. */
  useEffect(() => {
    if (!state.ok || !state.savedAt) return;
    const base = submitted.current ?? f;
    const next = { ...base, slug: state.slug ?? base.slug };
    setId(state.id ?? null);
    setPublishedAt(state.publishedAt ?? null);
    setSavedAt(state.savedAt);
    setSaved(next);
    setF(p => ({ ...p, slug: state.slug ?? p.slug }));
    clearDraft(state.id ?? null);
    if (!initial.id && state.id && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin/edit/${state.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.savedAt]);

  /* 임시 저장 — 바뀐 게 있을 때만, 손 뗀 뒤 0.6초 */
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => writeDraft(id, f), 600);
    return () => clearTimeout(t);
  }, [f, dirty, id]);

  /* 처음 열 때 임시 글이 있으면 묻는다 */
  useEffect(() => {
    const d = readDraft(initial.id ?? null);
    if (d && !same(d.f, fromInitial(initial))) setRestore(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 탭을 닫거나 새로고침하려 하면 한 번 묻는다 */
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  /* 본문 칸은 글 길이대로 자란다 */
  useEffect(() => {
    const el = bodyRef.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight + 2, 460)}px`;
  }, [f.body]);

  const leaveGuard = (e: React.MouseEvent) => {
    if (dirty && !window.confirm('저장하지 않은 내용이 있습니다. 그래도 나갈까요?')) e.preventDefault();
  };

  const chars = f.body.split(/\n\s*\n/).map(plainText).join('').replace(/\s+/g, '').length;
  // 저장할 때 사이트명 꼬리를 떼므로, 미리보기도 뗀 것으로 본다.
  const effTitle = stripSiteName(f.seoTitle) || stripSiteName(f.title);
  const typedSiteName = /성공\s*인사이드\s*$/.test(f.seoTitle.trim()) || /성공\s*인사이드\s*$/.test(f.title.trim());
  const effDesc = f.seoDesc.trim() || f.excerpt.trim();
  const effSlug = slugify(f.slug || f.title);
  const slugChanged = !!id && !!saved.published && !!saved.slug && effSlug !== saved.slug;
  const focus = parseKeywords(f.keywords)[0] ?? '';
  const readMin = Math.max(1, Math.round(chars / 500));

  const checks = useMemo(
    () => audit({ title: effTitle, desc: effDesc, slug: effSlug, focus, body: f.body }),
    [effTitle, effDesc, effSlug, focus, f.body],
  );
  const must = checks.filter(c => c.must);
  const nice = checks.filter(c => !c.must);
  const mustOk = must.filter(c => c.ok).length;
  const niceOk = nice.filter(c => c.ok).length;

  return (
    <main className="admWrap admWide">
      <header className="admTop">
        <div>
          <Link className="admBack" href="/admin" onClick={leaveGuard}><ArrowLeft size={14} /> 목록</Link>
          <h1>
            {id ? '칼럼 수정' : '새 칼럼'}
            {/* 지금 이 글이 어디에 있는지 — 발행 중인지, 초안인지, 저장 안 한 게 있는지 */}
            <span className={`admStatus ${saved.published ? 'live' : ''}`}>
              {saved.published ? `발행됨${publishedAt ? ' · ' + fmtDate(publishedAt) : ''}` : '초안'}
            </span>
            {dirty && <span className="admStatus dirty">저장 안 함</span>}
          </h1>
        </div>
        <div className="admTopActions">
          {id && saved.slug && (
            <a className="admBtn ghost" href={`/columns/${saved.slug}`} target="_blank" rel="noreferrer"
               title={dirty ? '마지막으로 저장한 상태를 보여줍니다 — 지금 고친 건 저장해야 반영됩니다' : (saved.published ? '사이트에서 보기' : '발행 전 미리보기 — 로그인한 관리자에게만 보입니다')}>
              <ExternalLink size={15} /> {saved.published ? '사이트에서 보기' : '미리보기'}{dirty && ' (저장 전)'}
            </a>
          )}
        </div>
      </header>

      {restore && (
        <div className="admRestore" role="status">
          <span>저장하지 않은 임시 글이 있습니다 — {fmtDate(restore.at)} {fmtTime(restore.at)}에 쓰던 것.</span>
          <span className="admRestoreBtns">
            <button type="button" className="admBtn" onClick={() => { setF(restore.f); setRestore(null); }}>불러오기</button>
            <button type="button" className="admBtn ghost" onClick={() => { clearDraft(id); setRestore(null); }}>버리기</button>
          </span>
        </div>
      )}

      <div className="admEditorGrid">
      <form ref={formRef} action={action} className="admEditor"
            onSubmit={() => { submitted.current = f; }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!pending) formRef.current?.requestSubmit(); } }}>
        {id && <input type="hidden" name="id" value={id} />}

        <div className="admField">
          <label htmlFor="f-title">제목</label>
          <input id="f-title" name="title" value={f.title} onChange={e => set('title')(e.target.value)} required maxLength={200}
                 placeholder="예: 성장이 멈췄다고 느껴질 때" />
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-cat">카테고리 <span className="hint">목록에 없는 이름을 쓰면 칼럼 페이지에 탭이 새로 생깁니다</span></label>
            <input id="f-cat" name="cat" value={f.cat} onChange={e => set('cat')(e.target.value)} required list="cats" maxLength={40} />
            <datalist id="cats">{SUGGESTED_CATS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="admField">
            <label htmlFor="f-slug">주소 <span className="hint">비우면 제목에서 만듭니다 · 영문·숫자·하이픈 권장</span></label>
            <input id="f-slug" name="slug" value={f.slug} onChange={e => set('slug')(e.target.value)} maxLength={80}
                   placeholder="direction-over-speed" spellCheck={false} />
            <p className="admUrl">{SITE.replace('https://', '')}/columns/<b>{effSlug || '…'}</b></p>
            {slugChanged && <p className="admWarn">발행된 글의 주소를 바꾸면 이전 주소(<b>/columns/{saved.slug}</b>)는 404가 됩니다. 이미 공유되거나 검색에 잡힌 글이면 그대로 두세요.</p>}
          </div>
        </div>

        <div className="admGrid2">
          <div className="admField">
            <label htmlFor="f-author">글쓴이</label>
            <input id="f-author" name="author" value={f.author} onChange={e => set('author')(e.target.value)} required maxLength={60} />
          </div>
          <div className="admField">
            <label htmlFor="f-role">글쓴이 소개</label>
            <input id="f-role" name="role" value={f.role} onChange={e => set('role')(e.target.value)} maxLength={80} placeholder="예: 편집부" />
          </div>
        </div>

        <div className="admField">
          <label htmlFor="f-excerpt">요약 <span className="hint">목록에 보이는 2줄. 검색 설명을 따로 쓰지 않으면 이 글이 검색 결과에도 나갑니다.</span></label>
          <textarea id="f-excerpt" name="excerpt" value={f.excerpt} onChange={e => set('excerpt')(e.target.value)} rows={2} maxLength={500} />
        </div>

        <div className="admField">
          <label htmlFor="f-quote">핵심 문장 <span className="hint">상세 페이지의 인용 카드</span></label>
          <input id="f-quote" name="quote" value={f.quote} onChange={e => set('quote')(e.target.value)} maxLength={300} />
        </div>

        <div className="admField">
          <label htmlFor="f-body">
            본문
            <span className="hint">
              빈 줄로 문단을 나눕니다. 글자를 선택하고 단추를 누르면 서식이 씌워지고, 선택 없이 누르면 자리를 만들어 줍니다.
              사진은 단추로 넣거나, 칸에 끌어다 놓거나, 복사해서 붙여 넣으세요. 마지막 문단은 마무리로 들어갑니다.
            </span>
          </label>
          <div className="admBodyBar">
            <span className="admTools">
              <FormatButtons textarea={bodyRef} setBody={setBody} />
              <i className="admToolSep" />
              <ImageButton busy={img.busy} onFiles={img.onFiles} />
            </span>
            <small>{img.error ? <span style={{ color: '#ff9d84' }}>{img.error}</span> : '⌘S / Ctrl+S 로 저장'}</small>
          </div>
          <textarea
            ref={bodyRef}
            id="f-body" name="body" required rows={20} value={f.body}
            className={`admBody${dropping ? ' dropping' : ''}`}
            onChange={e => set('body')(e.target.value)}
            onDragOver={e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDropping(true); } }}
            onDragLeave={() => setDropping(false)}
            onDrop={e => { if (e.dataTransfer.files.length) { e.preventDefault(); setDropping(false); img.onFiles(e.dataTransfer.files); } }}
            onPaste={e => { const fs = [...e.clipboardData.files]; if (fs.length) { e.preventDefault(); img.onFiles(fs); } }}
            placeholder={'도입 문단을 씁니다.\n\n두 번째 도입 문단.\n\n## 첫 번째 소제목\n\n본문 문단. 관련 글은 [이렇게](/columns/다른-글) 걸고, **강조**도 됩니다.\n\n## 두 번째 소제목\n\n본문 문단.\n\n마지막 문단은 마무리가 됩니다.'}
          />
          <p className="admCount">공백 제외 {chars.toLocaleString()}자 · 예상 읽기 {readMin}분</p>
        </div>

        <fieldset className="admFieldset">
          <legend>검색 최적화</legend>
          <p className="admFieldsetNote">검색 결과와 공유 카드에 나가는 문구입니다. 비우면 제목과 요약을 그대로 씁니다.</p>

          <div className="admField">
            <label htmlFor="f-seo-title">
              검색 제목
              <span className="hint">끝에 “{TITLE_SUFFIX.trim()}”가 자동으로 붙습니다 — 직접 적지 마세요 · 지금 {han(textWidth(effTitle + TITLE_SUFFIX))}</span>
            </label>
            <input id="f-seo-title" name="seo_title" value={f.seoTitle} onChange={e => set('seoTitle')(e.target.value)}
                   maxLength={120} placeholder={f.title || '비우면 제목을 씁니다'} />
            {typedSiteName && <p className="admWarn">끝의 “성공인사이드”는 저장할 때 뗍니다 — 자동으로 붙어서 두 번 나오게 됩니다.</p>}
          </div>

          <div className="admField">
            <label htmlFor="f-seo-desc">
              검색 설명
              <span className="hint">검색 결과의 두 줄 · 지금 {han(textWidth(effDesc))}</span>
            </label>
            <textarea id="f-seo-desc" name="seo_desc" value={f.seoDesc} onChange={e => set('seoDesc')(e.target.value)}
                      rows={2} maxLength={320} placeholder={f.excerpt || '비우면 요약을 씁니다'} />
          </div>

          <div className="admField">
            <label htmlFor="f-keywords">키워드 <span className="hint">쉼표로 구분 · 첫 번째가 핵심 키워드 · 최대 10개</span></label>
            <input id="f-keywords" name="keywords" value={f.keywords} onChange={e => set('keywords')(e.target.value)}
                   maxLength={600} placeholder="예: 매출 정체, 사업 방향, 창업 성장" />
          </div>
        </fieldset>

        <div className="admChecks">
          <label><input type="checkbox" name="published" checked={f.published} onChange={e => set('published')(e.target.checked)} /> 공개 발행</label>
          <label><input type="checkbox" name="featured" checked={f.featured} onChange={e => set('featured')(e.target.checked)} /> 이번 주 대표 칼럼으로 지정</label>
        </div>

        {state.error && <p className="admError" role="alert">{state.error}</p>}

        <div className="admActions">
          <button type="submit" className="admBtn" disabled={pending}>
            <Save size={15} /> {pending ? '저장 중…' : '저장'}
          </button>
          <Link className="admBtn ghost" href="/admin" onClick={leaveGuard}>목록으로</Link>
          <span className="admSaved" aria-live="polite">
            {savedAt && !dirty && <><Check size={13} strokeWidth={3} /> 저장됨 · {fmtTime(savedAt)}</>}
            {savedAt && dirty && <>마지막 저장 {fmtTime(savedAt)} · 그 뒤로 고친 게 있습니다</>}
            {!savedAt && dirty && id && '고친 게 있습니다 — 저장하세요'}
          </span>
        </div>
      </form>

      <aside className="admSeo" aria-label="검색 미리보기와 점검">
        <h2>검색 결과에서</h2>
        <div className="admSerp">
          <div className="admSerpSite">
            <i>성</i>
            <div><b>성공인사이드</b><small>{SITE.replace('https://', '')} › columns › {effSlug || '…'}</small></div>
          </div>
          {/* 검색엔진이 자르는 지점에서 같이 자른다 — 잘린 채로 보여야 고친다 */}
          <h3>{effTitle ? clipWidth(effTitle + TITLE_SUFFIX, TITLE_MAX + textWidth(TITLE_SUFFIX)) : '제목을 쓰면 여기에 보입니다'}</h3>
          <p className={effDesc ? '' : 'empty'}>{effDesc ? clipWidth(effDesc, DESC_MAX) : '요약이나 검색 설명을 쓰면 여기에 보입니다.'}</p>
        </div>

        <h2>공유 카드</h2>
        <div className="admOg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="admOgWm" src="/mark-orange.svg" alt="" />
          <div className="admOgIn">
            <div className="admOgTop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <b><img src="/mark-orange.svg" alt="" />성공인사이드</b>
              <em>칼럼</em>
            </div>
            <div className="admOgMid">
              <span className="admOgCat">{f.cat || '카테고리'}</span>
              <strong data-len={effTitle.length > 30 ? 'long' : effTitle.length > 18 ? 'mid' : 'short'}>
                {effTitle || '제목'}
              </strong>
              <i className="admOgRule" />
            </div>
            <div className="admOgFoot">
              <span>{[f.author === '성공인사이드' ? '' : f.author, `${readMin}분 분량`].filter(Boolean).join('  ·  ')}</span>
              <span>successinside.kr</span>
            </div>
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
