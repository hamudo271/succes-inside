import JsonLd from '../components/JsonLd';
import { pageMeta, SITE } from '../../lib/seo';
import { breadcrumb, ORG_ID, SITE_ID } from '../../lib/schema';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ApplyForm from './ApplyForm';
import './apply.css';

const DESC = '사업가의 성장 스토리를 기록하는 인터뷰 미디어, 성공인사이드 출연 신청. 사업 이야기를 남겨주시면 내부 검토 후 회신드립니다.';
export const metadata = pageMeta({
  path: '/apply',
  title: '출연 신청',
  description: DESC,
  keywords: ['인터뷰 출연 신청', '사장님 인터뷰 섭외', '기업 인터뷰 제작 문의', '성공인사이드 출연'],
});

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${SITE}/apply#page`,
      url: `${SITE}/apply`,
      name: '출연 신청 | 성공인사이드',
      description: DESC,
      inLanguage: 'ko-KR',
      isPartOf: { '@id': SITE_ID },
      about: { '@id': ORG_ID },
    },
    breadcrumb([{ name: '출연 신청', path: '/apply' }]),
  ],
};

const TYPES = ['출연 신청', '교육 과정 문의', '기타 문의'];

export default async function ApplyPage({
  searchParams,
}: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const initialType = TYPES.includes(sp.type ?? '') ? sp.type! : TYPES[0]!;

  return <>
    <JsonLd data={schema} />
    <SiteHeader active="apply" />
    <main>
      <section className="apWrap wrap">
        <div className="apIntro">
          <h1>잘 오셨습니다.{' '}<br />어떤 하루를 기록할까요?</h1>
          <p>
            성공인사이드는 결과가 아니라 결정의 이유를 기록합니다.
            모든 인터뷰는 내부 검토 후 진행하며, 검토에는 보통 일주일이 걸립니다.
          </p>
          {/* 사장님이 막히는 건 절차가 아니라 '뭘 써야 하나'다 — 그걸 먼저 푼다 */}
          <dl className="apHints">
            <div><dt>어떤 사업인지</dt><dd>업종, 규모, 몇 년째인지. 숫자가 있으면 숫자로.</dd></div>
            <div><dt>가장 큰 결정 하나</dt><dd>왜 그렇게 정했는지. 잘된 것보다 그때 판단이 궁금합니다.</dd></div>
            <div><dt>요즘 고민</dt><dd>지금 막힌 것, 다음에 하려는 것. 짧아도 됩니다.</dd></div>
          </dl>
          <p className="apFlow">
            <small>보내시면</small>
            <span>검토 <em>보통 일주일</em></span><span>상담·리서치</span><span>촬영 <em>하루 동행</em></span><span>영상·숏폼·기사 발행</span>
          </p>
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
