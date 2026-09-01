import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ApplyForm from './ApplyForm';
import './apply.css';

export const metadata = {
  title: '출연 신청 | 성공인사이드',
  description: '사업가의 성장 스토리를 기록하는 인터뷰 미디어, 성공인사이드 출연 신청.',
};

const TYPES = ['출연 신청', '교육 과정 문의', '기타 문의'];

export default async function ApplyPage({
  searchParams,
}: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const initialType = TYPES.includes(sp.type ?? '') ? sp.type! : TYPES[0]!;

  return <>
    <SiteHeader active="apply" />
    <main>
      <section className="apWrap wrap">
        <div className="apIntro">
          <h1>다음 기록의 주인공이{' '}<br />되어 보시겠어요?</h1>
          <p>
            성공인사이드는 결과가 아니라 결정의 이유를 기록합니다.
            모든 인터뷰는 내부 검토 후 진행하며, 검토에는 보통 일주일이 걸립니다.
          </p>
          <ul className="apSteps">
            <li><b>1. 신청</b><span>아래 양식으로 사업과 이야기를 보내주세요.</span></li>
            <li><b>2. 내부 검토</b><span>성장 서사를 기준으로 검토 후 회신드립니다.</span></li>
            <li><b>3. 상담과 리서치</b><span>목표 메시지를 함께 정한 뒤 촬영 일정을 잡습니다.</span></li>
          </ul>
          <p className="apAlt">
            양식이 어려우시면 메일로 보내셔도 됩니다.{' '}<br />
            <a href="mailto:success.inside.kr@gmail.com">success.inside.kr@gmail.com</a>
          </p>
        </div>
        <ApplyForm initialType={initialType} />
      </section>
    </main>
    <SiteFooter />
  </>;
}
