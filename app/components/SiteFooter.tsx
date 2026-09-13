import Link from 'next/link';
import Logo from './Logo';
import SubscribeForm from './SubscribeForm';

export default function SiteFooter() {
  return <footer><div className="wrap">
    <div className="footTop">
      <div>
        <Logo className="wmFooter" />
        <p>결과가 아니라, 결정을 기록합니다.<br />success.inside.kr@gmail.com · youtube.com/@성공인사이드 · instagram.com/success.inside.youtube</p>
      </div>
      {/* 구독 폼은 여기 한 곳 — 페이지마다 다른 마무리 상자를 두지 않는다 */}
      <div className="footSub" id="subscribe">
        <b>새 기록이 발행되면 알려드립니다</b>
        <span>인터뷰와 칼럼을 메일로 받아보세요.</span>
        <SubscribeForm source="footer" label="구독" />
      </div>
    </div>
    <div className="footLinks"><Link href="/interviews">인터뷰 아카이브</Link><Link href="/about">서비스 소개</Link><Link href="/programs">교육과정</Link><Link href="/columns">칼럼</Link><a>이용약관</a><a>개인정보처리방침</a><Link href="/apply">출연 신청</Link></div>
    <small>© 2026 SUCCESS INSIDE. All rights reserved.</small>
  </div></footer>;
}
