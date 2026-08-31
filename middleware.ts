import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'si_session';

/**
 * 1차 방어선. 쿠키 유무만 보고 관리자 화면 접근을 막는다.
 * (미들웨어는 DB에 접근할 수 없으므로, 세션이 실제로 유효한지는
 *  각 페이지의 서버 컴포넌트와 서버 액션에서 다시 검증한다.)
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!req.cookies.get(SESSION_COOKIE)?.value) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  // 관리자 화면은 캐시·색인 금지
  if (pathname.startsWith('/admin')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
