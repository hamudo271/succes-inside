import type { Metadata } from 'next';
import JsonLd from './components/JsonLd';
import { siteGraph } from '../lib/schema';
import './globals.css';

const SITE = 'https://successinside.kr';
const TITLE = '성공인사이드 | 사업가의 하루를 기록하는 인터뷰 미디어';
const DESC = '성공한 결과가 아니라 결정의 이유를 남깁니다. 2023년 광주에서 시작해 46명의 사장님의 하루를 따라갔고, 그 기록이 1,366만 번 재생됐습니다.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s | 성공인사이드' },
  description: DESC,
  applicationName: '성공인사이드',
  alternates: { canonical: '/' },
  keywords: ['성공인사이드', '사업가 인터뷰', '자영업', '창업', '브랜드 자산', '인터뷰 미디어'],
  // 검색 결과에 큰 썸네일과 긴 발췌를 허용한다 — 리치 결과 자격 조건이다.
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  // 서치 어드바이저·서치 콘솔 소유 확인 코드. 환경변수로 넣으면 코드를 고치지 않아도 된다.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.NAVER_SITE_VERIFICATION
      ? { other: { 'naver-site-verification': process.env.NAVER_SITE_VERIFICATION } }
      : {}),
  },
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
  return (
    <html lang="ko">
      <head>
        {/* 모든 페이지가 쓰는 서브셋 — 먼저 받아두면 글자가 늦게 바뀌는 일이 줄어든다 */}
        <link rel="preload" href="/fonts/pretendard-subset.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* 썸네일이 전부 여기서 온다. 연결을 미리 열어 두면 첫 이미지가 그만큼 빨리 뜬다 */}
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        {/* 서브셋에 없는 글자용 폰트 폴백 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body>
        <JsonLd data={siteGraph()} />
        {children}
      </body>
    </html>
  );
}
