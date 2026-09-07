// 검색 최적화 공용 규칙 — 편집기(브라우저)와 저장 액션(서버)이 같은 계산을 쓴다.
// 'server-only'를 붙이지 않는다: 클라이언트 편집기에서도 미리보기에 쓴다.

export const SITE = 'https://successinside.kr';
/** app/layout.tsx의 title.template과 같아야 한다 — 검색 결과에 실제로 붙는 꼬리. */
export const TITLE_SUFFIX = ' | 성공인사이드';

/** 구글은 약 600px, 네이버는 한글 30자 안팎에서 제목을 자른다. 한글 30자 ≈ 폭 60. */
export const TITLE_MAX = 60;
/** 설명은 폭 80~160 (한글 40~80자). 너무 짧으면 검색엔진이 본문을 임의로 뽑는다. */
export const DESC_MIN = 80;
export const DESC_MAX = 160;

export function slugify(input: string, fallback = ''): string {
  const s = input.trim().toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return s || fallback;
}

/** "a, b ,c" → ['a','b','c'] — 중복 제거, 최대 10개, 각 40자. 첫 번째가 핵심 키워드. */
export function parseKeywords(raw: string): string[] {
  const out: string[] = [];
  for (const k of raw.split(/[,\n]/)) {
    const t = k.trim().slice(0, 40);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= 10) break;
  }
  return out;
}

/** 검색 결과에서 차지하는 폭. 한글·한자 등 전각 글자는 2, 나머지는 1로 센다. */
export function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += /[ᄀ-ᇿ　-鿿가-힯＀-￯]/.test(ch) ? 2 : 1;
  return w;
}
