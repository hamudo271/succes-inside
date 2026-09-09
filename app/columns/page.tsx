import type { Metadata } from 'next';
import { getColumns } from '../../lib/columns';
import ColumnsView from './ColumnsView';
import JsonLd from '../components/JsonLd';
import { pageMeta, SITE } from '../../lib/seo';
import { breadcrumb, ORG_ID, SITE_ID } from '../../lib/schema';

const DESC = '인터뷰 현장에서 본 것을 매주 한 편의 관점으로 씁니다. 창업·마케팅·브랜딩·커리어 — 사장님의 결정을 돕는 칼럼.';
export const metadata: Metadata = pageMeta({
  path: '/columns',
  title: '칼럼',
  description: DESC,
  keywords: ['창업 칼럼', '마케팅 칼럼', '브랜딩', '커리어', '사업가 인사이트', '성공인사이드 칼럼'],
});

// 관리자가 글을 발행하면 바로 반영되도록 요청 시마다 조회한다.
export const dynamic = 'force-dynamic';

export default async function ColumnsPage() {
  const all = await getColumns();
  const featured = all.find(c => c.featured) ?? all[0]!;
  const list = all.filter(c => c.id !== featured.id);
  // 발행된 글 목록을 그대로 옮긴다 — 본문은 각 글의 상세 페이지가 Article로 따로 알린다.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${SITE}/columns#blog`,
        url: `${SITE}/columns`,
        name: '성공인사이드 칼럼',
        description: DESC,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': SITE_ID },
        publisher: { '@id': ORG_ID },
        blogPost: all.map(c => ({
          '@type': 'BlogPosting',
          headline: c.title,
          description: c.excerpt,
          url: `${SITE}/columns/${c.id}`,
          ...(c.publishedAt ? { datePublished: c.publishedAt } : {}),
          author: { '@id': ORG_ID },
        })),
      },
      breadcrumb([{ name: '칼럼', path: '/columns' }]),
    ],
  };

  return <><JsonLd data={schema} /><ColumnsView featured={featured} list={list} /></>;
}
