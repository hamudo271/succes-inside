/**
 * 칼럼 본문의 줄 안 표기 — 링크 [글자](주소), 이미지 ![설명](주소), 강조 **글자**.
 * 그 밖의 마크다운은 일부러 지원하지 않는다. 편집기와 공개 페이지, 검색 점검이 같은 규칙을 쓴다.
 *
 * HTML은 절대 그대로 렌더하지 않는다 — 여기서 토큰으로 나눈 뒤 React 요소로만 만든다.
 */
export type Inline =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'link'; v: string; href: string; external: boolean };

/** 허용하는 주소 — 사이트 안 경로, http(s). javascript: 같은 것은 통째로 글자 취급. */
export function safeHref(raw: string): string | null {
  const u = raw.trim();
  if (/^\/(?!\/)/.test(u)) return u;                       // /interviews, /columns/…
  if (/^https?:\/\/[^\s]+$/i.test(u)) return u;
  return null;
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?successinside\.kr(\/|$)/i.test(href);
}

const TOKEN = /\*\*([^*]+?)\*\*|\[([^\]]+?)\]\(([^)\s]+?)\)/g;

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last) out.push({ t: 'text', v: s.slice(last, m.index) });
    if (m[1] !== undefined) {
      out.push({ t: 'bold', v: m[1] });
    } else {
      const href = safeHref(m[3]!);
      if (href) out.push({ t: 'link', v: m[2]!, href, external: isExternal(href) });
      else out.push({ t: 'text', v: m[0] });               // 못 믿을 주소는 쓴 그대로 글자로
    }
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

/** 문단 전체가 이미지 하나인가 — 그러면 <p>가 아니라 <figure>로 그린다. */
export function imagePara(s: string): { alt: string; src: string } | null {
  const m = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(s.trim());
  if (!m) return null;
  const src = safeHref(m[2]!);
  return src ? { alt: m[1]!.trim(), src } : null;
}

/** 표기를 걷어낸 글자만 — 글자 수, 검색 점검, 구조화 데이터에 쓴다. */
export function plainText(s: string): string {
  if (imagePara(s)) return '';
  return s.replace(/!\[([^\]]*)\]\([^)\s]+\)/g, '')
          .replace(/\[([^\]]+?)\]\([^)\s]+?\)/g, '$1')
          .replace(/\*\*([^*]+?)\*\*/g, '$1');
}

/** 본문 안의 링크 목록 — 검색 점검의 '내부 링크' 계산용. */
export function links(s: string): { href: string; external: boolean }[] {
  return parseInline(s).flatMap(n => (n.t === 'link' ? [{ href: n.href, external: n.external }] : []));
}
