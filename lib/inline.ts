/**
 * 칼럼 본문의 줄 안 표기 — 링크 [글자](주소), 이미지 ![설명](주소), 강조 **글자**.
 * 그 밖의 마크다운은 일부러 지원하지 않는다. 편집기와 공개 페이지, 검색 점검이 같은 규칙을 쓴다.
 *
 * HTML은 절대 그대로 렌더하지 않는다 — 여기서 토큰으로 나눈 뒤 React 요소로만 만든다.
 */
export type Inline =
  | { t: 'text'; v: string }
  | { t: 'bold'; v: string }
  | { t: 'link'; v: string; href: string; external: boolean }
  | { t: 'img'; alt: string; src: string };

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

/**
 * 사람이 붙여 넣은 <img> 태그도 알아듣는다 — 속성 순서는 상관없고, src·alt만 뽑아 ![alt](src)로 바꾼다.
 * 태그 자체는 렌더하지 않는다. 다른 HTML 태그는 그대로 글자다.
 */
export function normalizeImgTags(s: string): string {
  return s.replace(/<img\b([^>]*)\/?>/gi, (_, attrs: string) => {
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1] ?? '';
    const alt = /\balt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? '';
    return src ? `![${alt}](${src})` : '';
  });
}

const TOKEN = /!\[([^\]]*)\]\(([^)\s]+?)\)|\*\*([^*]+?)\*\*|\[([^\]]+?)\]\(([^)\s]+?)\)/g;

export function parseInline(raw: string): Inline[] {
  const s = normalizeImgTags(raw);
  const out: Inline[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last) out.push({ t: 'text', v: s.slice(last, m.index) });
    if (m[2] !== undefined) {
      const src = safeHref(m[2]);
      if (src) out.push({ t: 'img', alt: m[1]!.trim(), src });
      else out.push({ t: 'text', v: m[0] });
    } else if (m[3] !== undefined) {
      out.push({ t: 'bold', v: m[3] });
    } else {
      const m2 = m[4]!, m3 = m[5]!;
      const href = safeHref(m3);
      if (href) out.push({ t: 'link', v: m2, href, external: isExternal(href) });
      else out.push({ t: 'text', v: m[0] });               // 못 믿을 주소는 쓴 그대로 글자로
    }
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

/** 문단 전체가 이미지 하나인가. (문단 안에 글과 섞여 있어도 그림은 그려진다 — Para가 나눈다.) */
export function imagePara(s: string): { alt: string; src: string } | null {
  const nodes = parseInline(s).filter(n => !(n.t === 'text' && !n.v.trim()));
  return nodes.length === 1 && nodes[0]!.t === 'img' ? { alt: nodes[0]!.alt, src: nodes[0]!.src } : null;
}

/** 문단 안의 이미지 전부. */
export function images(s: string): { alt: string; src: string }[] {
  return parseInline(s).flatMap(n => (n.t === 'img' ? [{ alt: n.alt, src: n.src }] : []));
}

/** 표기를 걷어낸 글자만 — 글자 수, 검색 점검, 구조화 데이터에 쓴다. */
export function plainText(s: string): string {
  return parseInline(s).map(n => (n.t === 'img' ? '' : n.v)).join('').trim();
}

/** 본문 안의 링크 목록 — 검색 점검의 '내부 링크' 계산용. */
export function links(s: string): { href: string; external: boolean }[] {
  return parseInline(s).flatMap(n => (n.t === 'link' ? [{ href: n.href, external: n.external }] : []));
}
