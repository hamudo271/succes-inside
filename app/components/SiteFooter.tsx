import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  return <footer><div className="wrap">
    <Logo className="wmFooter" />
    <p>결과가 아니라, 결정을 기록합니다.<br />success.inside.kr@gmail.com · youtube.com/@성공인사이드 · instagram.com/success.inside.youtube</p>
    <div className="footLinks"><Link href="/interviews">인터뷰 아카이브</Link><Link href="/about">서비스 소개</Link><Link href="/programs">교육과정</Link><Link href="/columns">칼럼</Link><a>이용약관</a><a>개인정보처리방침</a><Link href="/apply">출연 신청</Link></div>
    <small>© 2026 SUCCESS INSIDE. All rights reserved.</small>
  </div></footer>;
}
