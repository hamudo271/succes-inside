import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  return <footer><div className="wrap">
    <Logo className="wmFooter" />
    <p>경험이 연결되고, 성장이 시작되는 곳.<br />hello@successinside.kr · youtube.com/@successinside</p>
    <div className="footLinks"><Link href="/about">서비스 소개</Link><Link href="/programs">교육과정</Link><Link href="/columns">칼럼</Link><a>이용약관</a><a>개인정보처리방침</a><a href="mailto:hello@successinside.kr">문의하기</a></div>
    <small>© 2026 SUCCESS INSIDE. All rights reserved.</small>
  </div></footer>;
}
