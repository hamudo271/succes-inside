import type { Metadata } from 'next';

const DESC = '성공인사이드는 성공한 결과가 아니라 결정의 이유를 남기는 인터뷰 미디어입니다. 한 번의 촬영이 검색되고 AI에 인용되는 브랜드 자산이 됩니다.';
export const metadata: Metadata = {
  title: '소개',
  description: DESC,
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: '소개 | 성공인사이드', description: DESC },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
