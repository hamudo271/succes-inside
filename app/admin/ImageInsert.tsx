'use client';
import { useRef, useState, type RefObject } from 'react';
import { ImagePlus } from 'lucide-react';

/**
 * 본문 칸에 사진을 넣는다. 단추로 고르거나, 칸에 끌어다 놓거나, 붙여 넣으면
 * 서버에 올린 뒤 커서 자리에 ![사진 설명](/img/…)을 써 넣고 '사진 설명' 부분을 선택해 둔다 —
 * 바로 타이핑하면 설명이 채워진다.
 */
export function useImageInsert(
  textarea: RefObject<HTMLTextAreaElement | null>,
  setBody: (updater: (prev: string) => string) => void,
) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      insert(`![사진 설명](${data.url})`);
    } catch {
      setError('올리는 중 연결이 끊겼습니다.');
    } finally {
      setBusy(false);
    }
  }

  function insert(token: string) {
    const el = textarea.current;
    const ALT = '사진 설명';
    setBody(prev => {
      const start = el ? el.selectionStart : prev.length;
      const end = el ? el.selectionEnd : prev.length;
      const before = prev.slice(0, start), after = prev.slice(end);
      // 앞뒤에 빈 줄을 둬서 사진이 문단 하나로 선다.
      const pre = before && !/\n\n$/.test(before) ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
      const post = after && !/^\n\n/.test(after) ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
      const next = before + pre + token + post + after;
      const altAt = before.length + pre.length + token.indexOf(ALT);
      requestAnimationFrame(() => {
        if (!el) return;
        el.focus();
        el.setSelectionRange(altAt, altAt + ALT.length);
      });
      return next;
    });
  }

  function onFiles(files: FileList | File[] | null | undefined) {
    const f = files && [...files].find(x => x.type.startsWith('image/') || /\.(heic|heif)$/i.test(x.name));
    if (f) void upload(f);
  }

  return { busy, error, onFiles };
}

export function ImageButton({ busy, onFiles }: { busy: boolean; onFiles: (f: FileList | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className="admUpload" disabled={busy} onClick={() => input.current?.click()}>
        <ImagePlus size={15} /> {busy ? '올리는 중…' : '사진 넣기'}
      </button>
      <input ref={input} type="file" accept="image/*,.heic,.heif" hidden
             onChange={e => { onFiles(e.target.files); e.target.value = ''; }} />
    </>
  );
}
