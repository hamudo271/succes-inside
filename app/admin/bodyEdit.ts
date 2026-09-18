/**
 * 본문 칸(textarea) 편집 — 서식 단추와 사진 넣기가 같은 규칙을 쓴다.
 * 값을 바꾸는 순수 함수만 둔다. DOM은 부르는 쪽이 만진다.
 */
export type Edit = { next: string; selStart: number; selEnd: number };

/** 선택 구간을 before…after로 감싼다. 선택이 없으면 placeholder를 넣고 그 글자를 선택해 둔다. */
export function wrap(value: string, s: number, e: number, before: string, after: string, placeholder: string): Edit {
  const sel = value.slice(s, e) || placeholder;
  const next = value.slice(0, s) + before + sel + after + value.slice(e);
  return { next, selStart: s + before.length, selEnd: s + before.length + sel.length };
}

/**
 * 링크 — 선택한 글자가 있으면 [글자](주소)에서 주소를, 없으면 [글자](주소)에서 글자를 선택해 둔다.
 * 다음에 칠 것이 무엇인지에 따라 선택을 달리한다.
 */
export function link(value: string, s: number, e: number): Edit {
  const sel = value.slice(s, e);
  if (sel) {
    const next = value.slice(0, s) + `[${sel}](주소)` + value.slice(e);
    const at = s + sel.length + 3;
    return { next, selStart: at, selEnd: at + 2 };
  }
  const next = value.slice(0, s) + '[글자](주소)' + value.slice(e);
  return { next, selStart: s + 1, selEnd: s + 3 };
}

/** 커서가 있는 줄을 소제목으로 — 이미 소제목이면 되돌린다. 줄이 비어 있으면 자리만 만든다. */
export function toggleHeading(value: string, s: number): Edit {
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  const lineEndRaw = value.indexOf('\n', s);
  const lineEnd = lineEndRaw < 0 ? value.length : lineEndRaw;
  const line = value.slice(lineStart, lineEnd);
  if (/^\s*##\s/.test(line)) {
    const stripped = line.replace(/^\s*##\s+/, '');
    return { next: value.slice(0, lineStart) + stripped + value.slice(lineEnd), selStart: lineStart, selEnd: lineStart + stripped.length };
  }
  if (!line.trim()) {
    const token = '## 소제목';
    return { next: value.slice(0, lineStart) + token + value.slice(lineEnd), selStart: lineStart + 3, selEnd: lineStart + token.length };
  }
  return { next: value.slice(0, lineStart) + '## ' + line + value.slice(lineEnd), selStart: lineStart + 3, selEnd: lineStart + 3 + line.length };
}

/** 커서 자리에 token을 문단 하나로 넣는다(앞뒤 빈 줄). selectWord가 token 안에 있으면 그 글자를 선택해 둔다. */
export function insertBlock(value: string, s: number, e: number, token: string, selectWord?: string): Edit {
  const before = value.slice(0, s), after = value.slice(e);
  const pre = before && !/\n\n$/.test(before) ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const post = after && !/^\n\n/.test(after) ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
  const next = before + pre + token + post + after;
  const at = before.length + pre.length;
  const i = selectWord ? token.indexOf(selectWord) : -1;
  return i >= 0
    ? { next, selStart: at + i, selEnd: at + i + selectWord!.length }
    : { next, selStart: at + token.length, selEnd: at + token.length };
}

/** 값을 바꾼 뒤 커서를 제자리에 둔다. React가 값을 그린 다음 프레임에 실행해야 한다. */
export function applySelection(el: HTMLTextAreaElement | null, edit: Edit): void {
  requestAnimationFrame(() => {
    if (!el) return;
    el.focus();
    el.setSelectionRange(edit.selStart, edit.selEnd);
  });
}
