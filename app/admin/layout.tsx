import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: '관리자 | 성공인사이드',
  // 관리자 화면은 검색엔진에 절대 노출하지 않는다.
  robots: { index: false, follow: false, nocache: true },
};

// 세션에 따라 화면이 달라지므로 캐시하지 않는다.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
