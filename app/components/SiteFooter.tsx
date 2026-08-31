import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  return <footer><div className="wrap">
    <Logo className="wmFooter" />
    <p>경험이 연결되고, 성장이 시작되는 곳.<br />success.inside.kr@gmail.com · youtube.com/@성공인사이드</p>
    <div className="footLinks"><Link href="/interviews">인터뷰 아카이브</Link><Link href="/about">서비스 소개</Link><Link href="/programs">교육과정</Link><Link href="/columns">칼럼</Link><a>이용약관</a><a>개인정보처리방침</a><a href="mailto:success.inside.kr@gmail.com">출연 신청</a></div>
    <small>© 2026 SUCCESS INSIDE. All rights reserved.</small>
  </div></footer>;
}
