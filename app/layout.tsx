import type { Metadata } from 'next';
import './globals.css';

const SITE = 'https://successinside.kr';
const TITLE = '성공인사이드 | 사업가의 하루를 기록하는 인터뷰 미디어';
const DESC = '성공한 결과가 아니라 결정의 이유를 남깁니다. 2023년부터 46명의 사장님을 찾아가 하루를 따라붙고 기록했습니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s | 성공인사이드' },
  description: DESC,
  applicationName: '성공인사이드',
  alternates: { canonical: '/' },
  keywords: ['성공인사이드', '사업가 인터뷰', '자영업', '창업', '브랜드 자산', '인터뷰 미디어'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: '성공인사이드',
    locale: 'ko_KR',
    url: SITE,
    title: TITLE,
    description: DESC,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: '성공인사이드 — 사업가의 하루를 기록하는 인터뷰 미디어' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
