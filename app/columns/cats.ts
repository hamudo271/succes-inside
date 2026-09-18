/**
 * 칼럼 카테고리 — 편집기의 제안 목록이자, 공개 페이지 필터 탭의 정렬 기준.
 * 탭은 실제로 발행된 글에서 만든다. 여기 없는 이름으로 발행해도 탭이 생기고,
 * 여기 있는 이름이라도 글이 없으면 탭이 나오지 않는다.
 */
export const SUGGESTED_CATS = ['창업', '마케팅', '브랜딩', '커리어', 'AI·테크', '생산성', '재테크'];

/** 발행된 글의 카테고리로 탭 목록을 만든다 — 제안 순서 먼저, 나머지는 가나다순. */
export function catTabs(cats: Iterable<string>): string[] {
  const seen = Array.from(new Set(Array.from(cats).map(c => c.trim()).filter(Boolean)));
  const rank = (c: string) => { const i = SUGGESTED_CATS.indexOf(c); return i < 0 ? SUGGESTED_CATS.length : i; };
  seen.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'ko'));
  return ['전체', ...seen];
}
