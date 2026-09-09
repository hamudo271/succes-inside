import type { NextConfig } from 'next';

// 모든 응답에 적용되는 보안 헤더
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },                       // 클릭재킹 방지
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js 런타임은 인라인/eval 스크립트를 사용한다.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "font-src 'self' https://cdn.jsdelivr.net data:",
      "img-src 'self' data: https://i.ytimg.com",           // 유튜브 썸네일
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  agentRules: false,
  poweredByHeader: false,   // 서버 정보 노출 최소화
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // 히어로 배경 루프 — 브라우저·Cloudflare 엣지에 하루 두고, 그 뒤 일주일은 낡은 걸 먼저 주며 갱신한다.
      { source: '/:file(hero\\.mp4|hero\\.webm)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
      // 폰트는 파일이 바뀌면 이름도 바뀌지 않으므로, 내용이 바뀔 때만 배포로 갱신된다 — 1년 캐시.
      { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
