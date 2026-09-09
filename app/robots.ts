import type { MetadataRoute } from 'next';
import { SITE } from '../lib/seo';

/**
 * robots.txt — 사이트맵 위치를 알리는 것이 주 목적이다.
 * 네이버 Yeti와 구글봇 모두 여기서 사이트맵을 찾는다.
 *
 * 주의: 이 도메인은 Cloudflare의 'Managed robots.txt'가 켜져 있어, 엣지에서 AI 크롤러 차단
 * 블록이 덧붙는다. 배포 후 실제 /robots.txt를 확인해 아래 내용이 함께 나오는지 봐야 한다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 관리자 화면은 로그인 뒤에 있고 색인될 이유가 없다.
      { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] },
      // 네이버 검색로봇 — 명시해 두면 서치어드바이저 진단에서 확실해진다.
      { userAgent: 'Yeti', allow: '/', disallow: ['/admin', '/admin/'] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
