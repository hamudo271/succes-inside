import type { Metadata } from 'next';
import { CHANNEL } from './data';
const DESC = `2023년부터 ${CHANNEL.interviews}명의 사장님을 찾아가 하루를 따라붙고 기록했습니다. 요식업·뷰티·온라인 등 업종별 인터뷰를 조회수 순으로 봅니다.`;
export const metadata: Metadata = {
  title: '인터뷰',
  description: DESC,
  alternates: { canonical: '/interviews' },
  openGraph: { url: '/interviews', title: '인터뷰 | 성공인사이드', description: DESC },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
