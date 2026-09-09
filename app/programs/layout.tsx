import type { Metadata } from 'next';
import JsonLd from '../components/JsonLd';
import { pageMeta, SITE } from '../../lib/seo';
import { collectionPage, ORG_ID } from '../../lib/schema';
import { COURSE_CARDS } from '../components/CourseCards';

const DESC = '인터뷰 현장에서 본 사장님들의 결정을 과정으로 정리했습니다. 라이브 기수제 과정과 언제든 시작하는 VOD.';

export const metadata: Metadata = pageMeta({
  path: '/programs',
  title: '교육과정',
  description: DESC,
  keywords: ['창업 교육', '사업가 교육 과정', '마케팅 강의', '1인 기업 교육', '성공인사이드 교육과정'],
});

/**
 * 과정 목록. 가격·일정·정원은 페이지가 확정해 말하지 않으므로 구조화 데이터에도 넣지 않는다 —
 * 검색 결과에 확인되지 않은 조건이 노출되는 것을 막는다.
 */
const schema = collectionPage({
  path: '/programs',
  name: '교육 과정',
  description: DESC,
  crumbs: [{ name: '교육과정', path: '/programs' }],
  items: {
    '@type': 'ItemList',
    numberOfItems: COURSE_CARDS.length,
    itemListElement: COURSE_CARDS.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.title,
        description: c.desc,
        url: `${SITE}/programs#${c.id}`,
        inLanguage: 'ko-KR',
        provider: { '@id': ORG_ID },
      },
    })),
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={schema} />{children}</>;
}
