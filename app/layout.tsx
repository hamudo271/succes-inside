import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '성공인사이드 | 먼저 가본 사람들의 인사이트', description: '사업가와 실무자가 경험을 나누고 함께 성장하는 비즈니스 커뮤니티' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
