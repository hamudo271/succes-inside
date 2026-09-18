'use client';
import { useRef, useState, type RefObject } from 'react';
import { ImagePlus, Heading2, Bold, Link2 } from 'lucide-react';
import { insertBlock, wrap, link, toggleHeading, applySelection, type Edit } from './bodyEdit';

type SetBody = (updater: (prev: string) => string) => void;

/** 본문 칸에 Edit을 적용한다 — 값은 React 상태로, 커서는 다음 프레임에. */
function useApply(textarea: RefObject<HTMLTextAreaElement | null>, setBody: SetBody) {
  return (make: (value: string, s: number, e: number) => Edit) => {
    const el = textarea.current;
    setBody(prev => {
      const s = el ? el.selectionStart : prev.length;
      const e = el ? el.selectionEnd : prev.length;
      const edit = make(prev, s, e);
      applySelection(el, edit);
      return edit.next;
    });
  };
}

/**
 * 사진 넣기. 단추로 고르거나, 칸에 끌어다 놓거나, 붙여 넣으면 서버에 올린 뒤
 * 커서 자리에 ![사진 설명](/img/…)을 써 넣고 '사진 설명'을 선택해 둔다 — 바로 타이핑하면 설명이 채워진다.
 */
export function useImageInsert(textarea: RefObject<HTMLTextAreaElement | null>, setBody: SetBody) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const apply = useApply(textarea, setBody);

  async function upload(file: File) {
    setError('');
    if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
      setError('사진 파일만 넣을 수 있습니다.'); return;
    }
    setBusy(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/admin/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || '올리지 못했습니다.'); return; }
      apply((v, s, e) => insertBlock(v, s, e, `![사진 설명](${data.url})`, '사진 설명'));
    } catch {
      setError('올리는 중 연결이 끊겼습니다.');
    } finally {
      setBusy(false);
    }
  }

  function onFiles(files: FileList | File[] | null | undefined) {
    const f = files && [...files].find(x => x.type.startsWith('image/') || /\.(heic|heif)$/i.test(x.name));
    if (f) void upload(f);
  }

  return { busy, error, onFiles };
}

/** 서식 단추 — 소제목·굵게·링크. 선택한 글자에 씌우고, 없으면 자리를 만들어 선택해 둔다. */
export function FormatButtons({ textarea, setBody }: { textarea: RefObject<HTMLTextAreaElement | null>; setBody: SetBody }) {
  const apply = useApply(textarea, setBody);
  return (
    <>
      <button type="button" className="admTool" title="소제목 (현재 줄)"
              onClick={() => apply((v, s) => toggleHeading(v, s))}><Heading2 size={15} /> 소제목</button>
      <button type="button" className="admTool" title="굵게"
              onClick={() => apply((v, s, e) => wrap(v, s, e, '**', '**', '글자'))}><Bold size={15} /> 굵게</button>
      <button type="button" className="admTool" title="링크"
              onClick={() => apply((v, s, e) => link(v, s, e))}><Link2 size={15} /> 링크</button>
    </>
  );
}

export function ImageButton({ busy, onFiles }: { busy: boolean; onFiles: (f: FileList | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className="admTool" disabled={busy} onClick={() => input.current?.click()}>
        <ImagePlus size={15} /> {busy ? '올리는 중…' : '사진 넣기'}
      </button>
      <input ref={input} type="file" accept="image/*,.heic,.heif" hidden
             onChange={e => { onFiles(e.target.files); e.target.value = ''; }} />
    </>
  );
}
