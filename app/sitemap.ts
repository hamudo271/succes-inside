import type { MetadataRoute } from 'next';
import { getColumns } from '../lib/columns';
import { SITE } from '../lib/seo';

/** 관리자가 칼럼을 발행하면 한 시간 안에 사이트맵에 반영된다. */
export const revalidate = 3600;

/**
 * 공개 페이지만 넣는다 — /admin 이하는 색인될 이유가 없다.
 *
 * lastModified는 진짜 아는 것만 적는다. 배포할 때마다 정적 페이지에 오늘 날짜를 찍으면
 * 바뀌지 않은 문서를 바뀌었다고 알리는 셈이라, 구글은 그런 사이트맵의 lastmod를 무시한다.
 * 그래서 칼럼(수정 시각을 실제로 아는 것)에만 붙인다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: { path: string; priority: number; freq: 'daily' | 'weekly' | 'monthly'; images?: string[] }[] = [
    { path: '', priority: 1, freq: 'weekly', images: [`${SITE}/og.jpg`, `${SITE}/hero.jpg`] },
    { path: '/interviews', priority: 0.9, freq: 'weekly' },
    { path: '/columns', priority: 0.8, freq: 'weekly' },
    { path: '/programs', priority: 0.7, freq: 'monthly' },
    { path: '/about', priority: 0.6, freq: 'monthly', images: [`${SITE}/about-still.jpg`] },
    { path: '/apply', priority: 0.6, freq: 'monthly' },
  ];

  const columns = await getColumns().catch(() => []);

  return [
    ...pages.map(p => ({
      url: `${SITE}${p.path}`,
      priority: p.priority,
      changeFrequency: p.freq,
      ...(p.images ? { images: p.images } : {}),
    })),
    ...columns.map(c => ({
      url: `${SITE}/columns/${c.id}`,
      priority: 0.5,
      changeFrequency: 'monthly' as const,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      images: [`${SITE}/columns/${c.id}/opengraph-image`],
    })),
  ];
}
