import type { Metadata } from 'next';

const DESC = '인터뷰 현장에서 본 사장님들의 결정을 과정으로 정리했습니다. 라이브 기수제 과정과 언제든 시작하는 VOD.';
export const metadata: Metadata = {
  title: '교육과정',
  description: DESC,
  alternates: { canonical: '/programs' },
  openGraph: { url: '/programs', title: '교육과정 | 성공인사이드', description: DESC },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
