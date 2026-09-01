import type { MetadataRoute } from 'next';
import { getColumns } from '../lib/columns';

const SITE = 'https://successinside.kr';

/** 관리자가 칼럼을 발행하면 한 시간 안에 사이트맵에 반영된다. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 공개 페이지만 넣는다 — /admin 이하는 검색에 노출될 이유가 없다.
  const pages: [string, number][] = [
    ['', 1],
    ['/interviews', 0.9],
    ['/columns', 0.8],
    ['/programs', 0.7],
    ['/about', 0.6],
    ['/apply', 0.6],
  ];

  const columns = await getColumns().catch(() => []);

  return [
    ...pages.map(([path, priority]) => ({ url: `${SITE}${path}`, priority, changeFrequency: 'weekly' as const })),
    ...columns.map(c => ({ url: `${SITE}/columns/${c.id}`, priority: 0.5, changeFrequency: 'monthly' as const })),
  ];
}
