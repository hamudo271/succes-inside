import type { Metadata } from 'next';
import JsonLd from '../components/JsonLd';
import { pageMeta, SITE } from '../../lib/seo';
import { breadcrumb, faqPage, ORG_ID, SITE_ID } from '../../lib/schema';
import { faq } from './faq';

const DESC = '성공인사이드는 성공한 결과가 아니라 결정의 이유를 남기는 인터뷰 미디어입니다. 한 번의 촬영이 검색되고 AI에 인용되는 브랜드 자산이 됩니다.';

export const metadata: Metadata = pageMeta({
  path: '/about',
  title: '소개',
  description: DESC,
  keywords: ['성공인사이드 소개', '인터뷰 미디어', '브랜드 자산', '기업 인터뷰 제작', 'AI 검색 노출'],
});

/** 화면의 '자주 묻는 질문'을 그대로 옮긴다 — 페이지에 없는 문답은 넣지 않는다. */
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${SITE}/about#page`,
      url: `${SITE}/about`,
      name: '소개 | 성공인사이드',
      description: DESC,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
    },
    faqPage(faq),
    breadcrumb([{ name: '소개', path: '/about' }]),
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={schema} />{children}</>;
}
