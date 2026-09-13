import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Play, Eye, Check, X } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CtaBand from '../components/CtaBand';
import CaseWall from '../programs/CaseWall';
import { interviews, cats, thumb, watchUrl, CHANNEL } from '../interviews/data';
import { faq } from '../about/faq';
import '../interviews/interviews.css';
import '../programs/programs.css';   // 사례 벽(CaseWall) 스타일
import './test.css';

/**
 * 개편 시안 — 기존 페이지는 손대지 않고, 피드백에서 '맞다'고 본 8가지를
 * 우선순위 번호 순으로 한 페이지에 늘어놓는다. 각 절이 실제 부품이라
 * 마음에 드는 것만 골라 제자리로 옮기면 된다.
 *
 * 검색엔진에는 숨긴다 — 시안이지 사이트가 아니다.
 */
export const metadata: Metadata = {
  title: '개편 시안 (테스트)',
  robots: { index: false, follow: false, nocache: true },
};

const ymd = (d: string) => `${d.slice(0, 4)}.${d.slice(5, 7)}`;
const TOP = interviews.reduce((a, b) => (b.views > a.views ? b : a));
const TOP_AGE = new Date().getFullYear() - Number(TOP.date.slice(0, 4));

/** 업종별 최다 조회 한 편씩 — 아카이브 상단 '업종 진입'과 사례 벽이 같은 목록을 쓴다 */
const BY_CAT = cats.filter(c => c !== '전체').map(c => {
  const list = interviews.filter(i => i.cat === c);
  return { cat: c, n: list.length, top: list.sort((a, b) => b.views - a.views)[0]! };
}).sort((a, b) => b.n - a.n);
const CASES = (() => {
  const heads = BY_CAT.map(b => b.top);
  const rest = [...interviews].sort((a, b) => b.views - a.views).filter(i => !heads.includes(i));
  return [...heads, ...rest].slice(0, 9).sort((a, b) => b.views - a.views);
})();

/* ── 1. 비용 — 사장님이 정할 값. 아래 숫자는 자리 표시용 예시다. ── */
const PRICE = {
  fee: '출연료 없음',
  from: '예시: 제작비 ○○○만원부터',
  note: '※ 실제 금액은 대표님이 정해주셔야 합니다. 이 절은 "범위 하나라도 있을 때 화면이 어떻게 보이는가"를 보여주는 자리입니다.',
};

/* ── 2. 소개 페이지 진행 표 ── */
const SPEC: { k: string; v: string; sub?: string }[] = [
  { k: '대상', v: '자기 결정을 설명할 수 있는 사장님', sub: '매출 규모는 보지 않습니다. 업종 제한 없음 — 지금까지 8개 업종 46명.' },
  { k: '선정', v: '내부 검토 후 일주일 안에 회신', sub: '신청서의 "가장 큰 결정 하나"를 기준으로 봅니다.' },
  { k: '촬영', v: '하루 동행 · 인터뷰 약 90분', sub: '사전 리서치 확인 30분이 따로 있습니다. 편집은 전부 저희 몫.' },
  { k: '산출물', v: '본편 1편 · 숏폼 여러 편 · 기사 1건', sub: '본편은 유튜브, 숏폼은 릴스·쇼츠·틱톡, 기사는 successinside.kr에 실립니다.' },
  { k: '배포', v: '유튜브 · 인스타그램 · 틱톡 · 홈페이지 동시 발행' },
  { k: '공개 범위', v: '발행 전 원고 전체 확인, 뺄 숫자 지정 가능', sub: '매출·직원 수 같은 민감한 숫자는 빼고 낼 수 있습니다.' },
  { k: '비용', v: `${PRICE.fee} · ${PRICE.from}`, sub: PRICE.note },
  { k: '리포트', v: '발행 후 채널별 조회수 보고', sub: '어디서 얼마나 봤는지 한 장으로 드립니다.' },
];

/* ── 3. 홈 세 갈래 ── */
const BRANCHES = [
  { n: '출연', title: '사장님의 하루를 기록합니다', body: `${CHANNEL.interviews}명이 먼저 남겼습니다. 다음은 사장님 차례.`, href: '/apply', label: '출연 신청하기', primary: true },
  { n: '교육', title: '인터뷰한 사장님들이 가르칩니다', body: '기수제 4~6주 정기 과정과 언제든 시작하는 VOD.', href: '/programs', label: '과정 보기' },
  { n: '구독', title: '새 기록을 메일로 받습니다', body: '인터뷰와 칼럼이 나올 때마다 한 통.', href: '#subscribe', label: '구독하기' },
];

/* ── 7. 신청 폼 예시·기준 ── */
const CRITERIA = [
  { t: '스스로 설명할 수 있는 결정이 있는가', d: '"왜 그렇게 했는지"를 본인이 말할 수 있으면 됩니다.' },
  { t: '시행착오를 말할 수 있는가', d: '잘된 것만 있는 이야기는 따라 할 수 없습니다.' },
  { t: '하루를 내줄 수 있는가', d: '촬영은 현장 동행입니다. 사업장이 있어야 합니다.' },
];
const SAMPLE = `광주에서 카센터 7년째. 직원 3명, 월 매출은 3천 안팎입니다.
가장 큰 결정은 3년 전 보험 수리를 끊은 것. 매출은 30% 빠졌는데
현금 흐름이 좋아지고 직원이 안 그만둡니다.
요즘 고민은 둘째 지점을 낼지 말지입니다.`;

/* ── 10. 쌓이는 것 — 연도별 편수와, 그해 찍은 편들이 지금까지 모은 조회수 ── */
const YEARS = Array.from(new Set(interviews.map(i => i.date.slice(0, 4)))).sort();
const BY_YEAR = YEARS.map(y => {
  const list = interviews.filter(i => i.date.startsWith(y));
  return { y, n: list.length, views: list.reduce((a, b) => a + b.views, 0) };
});
let acc = 0;
const TIMELINE = BY_YEAR.map(r => ({ ...r, cum: (acc += r.views) }));
const man = (n: number) => `${Math.round(n / 10000)}만`;
const bestYear = BY_YEAR.reduce((a, b) => (b.views > a.views ? b : a));

/* ── 11. 신청하면 이렇게 됩니다 ── */
const FLOW = [
  { k: '신청', v: '양식 5분', d: '어떤 사업인지, 가장 큰 결정 하나, 요즘 고민. 네 줄이면 됩니다.' },
  { k: '검토', v: '보통 일주일', d: '매출보다 스스로 설명할 수 있는 결정이 있는지를 봅니다.' },
  { k: '촬영', v: '하루 동행', d: '사업장에서 인터뷰 90분. 편집은 전부 저희 몫.' },
  { k: '발행', v: '본편·숏폼·기사', d: '유튜브·인스타그램·틱톡·홈페이지에 동시에. 어디서 얼마나 봤는지 보고.' },
];

/* ── 12. 최신 기록 ── */
const LATEST = [...interviews].sort((a, b) => b.date.localeCompare(a.date))[0]!;
const RANK = [...interviews].sort((a, b) => b.views - a.views).slice(0, 5);

/* ── 8. 카드 위계 — 비교용 표본 ── */
const SAMPLE_CARDS = [...interviews].sort((a, b) => b.views - a.views).slice(1, 4);

function Num({ n, title, why, done }: { n: number; title: string; why: string; done?: string }) {
  return (
    <div className="tsHead">
      <span className="tsNum">{String(n).padStart(2, '0')}</span>
      <div>{done && <span className="tsDone"><Check size={12} /> 적용됨 · {done}</span>}<h2>{title}</h2><p>{why}</p></div>
    </div>
  );
}

export default function TestPage() {
  return <>
    <SiteHeader active="test" />
    <main className="tsMain">

      <section className="wrap tsIntro">
        <small>개편 시안 · 검색엔진 비공개</small>
        <h1>바꾸면 좋을 열두 가지,{' '}<br />하면 좋을 순서대로.</h1>
        <p>기존 페이지는 그대로 두고 여기에만 만들었습니다. 각 절이 실제로 동작하는 부품이라, 마음에 드는 것만 골라 제자리에 옮기면 됩니다. 번호는 우선순위입니다.</p>
        <ol className="tsToc">
          {['비용 범위', '소개 → 진행 표', '홈 세 갈래 진입', '띠 보조 버튼', '아카이브 상단', '카운트업 제거', '신청 폼 예시·기준', '카드 위계', '홈 · 세 갈래 자리', '홈 · 타임라인', '홈 · 절차', '홈 · 최신 기록'].map((t, i) => (
            <li key={t}><a href={`#s${i + 1}`}><span>{String(i + 1).padStart(2, '0')}</span>{t}</a></li>
          ))}
        </ol>
      </section>

      {/* ══ 1. 비용 ══ */}
      <section className="wrap tsSec" id="s1">
        <Num n={1} title="비용 — 범위 하나만 있으면 됩니다" why="지금은 모든 페이지가 '상담 후 안내'입니다. 정확한 금액이 아니어도 범위 하나가 있으면 나머지 절(2·7)이 완성됩니다. 대표님이 정해주셔야 하는 유일한 항목입니다." />
        <div className="tsPrice">
          <div>
            <small>출연료</small>
            <b>{PRICE.fee}</b>
            <p>사장님께 드리는 돈도, 받는 돈도 없습니다.</p>
          </div>
          <div className="tsPriceHole">
            <small>제작비</small>
            <b>{PRICE.from}</b>
            <p>{PRICE.note}</p>
          </div>
          <div>
            <small>포함</small>
            <b>본편 · 숏폼 · 기사 · 배포 · 리포트</b>
            <p>한 번의 촬영에서 전부 나옵니다. 추가 비용 없음.</p>
          </div>
        </div>
      </section>

      {/* ══ 2. 진행 표 ══ */}
      <section className="wrap tsSec" id="s2">
        <Num n={2} title="소개 페이지 — 철학 아래에 '진행 표' 한 장" why="사장님이 문의 전에 알고 싶은 건 다섯 가지입니다. 나도 되나 · 뭘 받나 · 얼마 걸리나 · 얼마인가 · 어디까지 공개되나. 지금은 FAQ에 접혀 있습니다. 표 하나로 펴면 FAQ는 예외 질문만 남습니다." />
        <dl className="tsSpec">
          {SPEC.map(r => (
            <div key={r.k}><dt>{r.k}</dt><dd><b>{r.v}</b>{r.sub && <p>{r.sub}</p>}</dd></div>
          ))}
        </dl>
        <div className="tsSpecFaq">
          <small>표에서 못 다룬 것만 FAQ로</small>
          <ul>{faq.filter(f => !/시간|공개 범위/.test(f.q)).map(f => <li key={f.q}><b>{f.q}</b><span>{f.a}</span></li>)}</ul>
        </div>
      </section>

      {/* ══ 3. 홈 세 갈래 ══ */}
      <section className="wrap tsSec" id="s3">
        <Num n={3} title="홈 — 히어로 바로 아래에서 세 갈래로 가른다" why="출연하려는 사장님, 교육 들으려는 사람, 그냥 보러 온 구독자가 지금은 같은 스크롤을 내립니다. 히어로 다음 블록에서 갈라 주면 각자 두 번째 화면부터 자기 길로 갑니다." />
        <div className="tsBranch">
          {BRANCHES.map(b => (
            <Link key={b.n} href={b.href} className={b.primary ? 'tsBranchMain' : ''}>
              <small>{b.n}</small>
              <b>{b.title}</b>
              <p>{b.body}</p>
              <span>{b.label} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
        <div className="tsNote">
          <b>섹션 순서도 함께</b>
          <p>지금: 히어로 → 숫자 → 인터뷰 → 산출물 → 교육 → 칼럼 → 띠. &nbsp;바꾸면: 히어로 → <em>세 갈래</em> → 출연 근거(산출물·인터뷰) → 교육 → 칼럼 → 띠. 각 섹션이 그 갈래의 다음 행동으로 끝납니다.</p>
        </div>
      </section>

      {/* ══ 4. 띠 보조 버튼 ══ */}
      <section className="tsSec tsBleed" id="s4">
        <div className="wrap"><Num n={4} title="마무리 띠 — 보조 버튼을 '사례 먼저 보기'로" why="준비 안 된 사람에게도 '출연 신청하기'만 던지고 있습니다. 보조 자리를 '채널 구독하기'에서 '사례 먼저 보기'로 바꾸면, 아직 망설이는 사람은 아카이브 대표 사례로 가고 준비된 사람은 신청으로 갑니다. 유튜브 링크는 헤더·푸터에 이미 있습니다." /></div>
        <CtaBand
          title={<>{CHANNEL.interviews}명이 출연했습니다.{' '}<br />다음은 사장님입니다.</>}
          sub="출연을 신청하면 일주일 안에 회신드립니다. 매출보다 스스로 설명할 수 있는 결정이 있는지를 봅니다."
          href="/apply" label="출연 신청하기"
          secondary={<Link className="btnGhost" href="/interviews">사례 먼저 보기</Link>}
          facts={[{ k: '검토 회신', v: '보통 일주일' }, { k: '촬영', v: '하루 동행' }, { k: '비용', v: PRICE.fee }]}
        />
      </section>

      {/* ══ 5. 아카이브 상단 ══ */}
      <section className="wrap tsSec" id="s5">
        <Num n={5} done="/interviews" title="인터뷰 아카이브 — 대표 사례 위로, 목록은 아래로" why="46개 카드가 같은 크기라 많이 보여주고 덜 기억됩니다. 상단에 대표 사례 한 편과 업종별 진입을 두고, 그 아래에 지금의 필터·격자를 둡니다. 사례 벽은 교육과정에 이미 있는 부품입니다." />
        <div className="tsArchive">
          {/* 캡션은 스틸 아래에 — 썸네일에 박힌 글자와 싸우지 않게 */}
          <a className="tsFeat" href={watchUrl(TOP.id)} target="_blank" rel="noreferrer">
            <div className="tsFeatImg"><img src={`https://i.ytimg.com/vi/${TOP.id}/hq720.jpg`} alt="" loading="lazy" /></div>
            <div className="tsFeatText">
              <small>대표 사례 · {TOP.cat}</small>
              <b>{TOP.title}</b>
              <span><Eye size={14} /> {TOP.viewsText}회 · {TOP_AGE}년 전 촬영, 지금도 재생 중</span>
              <em><Play size={13} fill="currentColor" /> 본편 보기</em>
            </div>
          </a>
          <ul className="tsCats">
            {BY_CAT.slice(0, 6).map(b => (
              <li key={b.cat}><Link href={`/interviews`}>
                <img src={thumb(b.top.id)} alt="" loading="lazy" />
                <span><b>{b.cat}</b><small>{b.n}편 · 최다 {b.top.viewsText}회</small></span>
                <ArrowUpRight size={15} />
              </Link></li>
            ))}
          </ul>
        </div>
        <div className="tsWall"><CaseWall items={CASES} /></div>
        <p className="tsCaption">↑ 사례 벽(교육과정 페이지 부품). 이 아래에 지금의 필터 + 46개 격자가 그대로 옵니다.</p>
      </section>

      {/* ══ 6. 카운트업 제거 ══ */}
      <section className="wrap tsSec" id="s6">
        <Num n={6} done="기준일만 · 애니메이션은 유지" title="숫자 띠 — 사람에게는 굴리고, 봇에게는 굴리지 않는다" why="피드백이 '34 인터뷰 · 885만'이라고 읽은 건 굴러가는 도중 값을 크롤러가 잡은 겁니다. 카운트업은 그대로 두되 자동화 브라우저(크롤러·스크린샷 봇)에는 최종값만 보여주도록 바꿨고, 숫자 옆에 기준일을 붙였습니다." />
        <div className="statBand tsStat">
          <div><b>{CHANNEL.interviews}</b><span>인터뷰</span></div>
          <div><b>{CHANNEL.channelViewsText}</b><span>총 조회수 · 숏폼 포함</span></div>
          <div><b>{CHANNEL.subscribers}</b><span>구독자</span></div>
          <div><b>{CHANNEL.totalVideos}</b><span>발행 콘텐츠</span></div>
        </div>
        <p className="tsCaption">2026년 9월 10일 기준 · 채널 정보란 공개 수치</p>
      </section>

      {/* ══ 7. 신청 폼 ══ */}
      <section className="wrap tsSec" id="s7">
        <Num n={7} title="신청 폼 — 좋은 신청서 한 장과 검토 기준 세 줄" why="'뭘 적으면 되는지'는 지난번에 넣었습니다. 남은 건 어느 수준으로 써야 하는지입니다. 실제 출연자 톤의 예시 한 장과 기준 세 줄을 폼 위에 둡니다. 부적합 예시는 넣지 않습니다 — 신청 페이지에서 사람을 밀어내는 문장은 신청률을 떨어뜨립니다." />
        <div className="tsApply">
          <div className="tsCriteria">
            <small>이런 분을 찾습니다</small>
            <ol>{CRITERIA.map(c => <li key={c.t}><Check size={15} /><div><b>{c.t}</b><p>{c.d}</p></div></li>)}</ol>
          </div>
          <div className="tsSample">
            <small>이 정도면 충분합니다 — 실제 신청서 톤의 예시</small>
            <pre>{SAMPLE}</pre>
            <p>네 줄이면 됩니다. 업종·규모·결정 하나·요즘 고민. 문장이 서툴러도 숫자와 결정이 있으면 검토가 됩니다.</p>
          </div>
        </div>
      </section>

      {/* ══ 8. 카드 위계 ══ */}
      <section className="wrap tsSec" id="s8">
        <Num n={8} title="인터뷰 카드 — 제목만 남기고 나머지는 한 단계 죽인다" why="조회수·날짜·업종·제목이 비슷한 크기라 훑을 때 눈이 멈추는 곳이 없습니다. 제목을 키우고 메타를 한 줄로 내리면 같은 카드가 더 잘 읽힙니다. 왼쪽이 지금, 오른쪽이 바꾼 것." />
        <div className="tsCompare">
          <div>
            <small><X size={13} /> 지금</small>
            {SAMPLE_CARDS.slice(0, 1).map(v => (
              <a className="ivCard tsOld" key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer">
                <div className="ivThumb"><img src={thumb(v.id)} alt="" loading="lazy" /><span className="ivDur">{v.dur}</span></div>
                <div className="ivCardBody">
                  <span className="ivTag">{v.cat}</span>
                  <h3>{v.title}</h3>
                  {!!v.tags.length && <p className="ivTags">{v.tags.map(t => `#${t}`).join('  ')}</p>}
                  <div className="ivCardFoot"><span><Eye size={12} /> {v.viewsText}회</span><span>{ymd(v.date)}</span></div>
                </div>
              </a>
            ))}
          </div>
          <div>
            <small className="ok"><Check size={13} /> 바꾼 것</small>
            {SAMPLE_CARDS.slice(0, 1).map(v => (
              <a className="tsCard" key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer">
                <div className="tsCardThumb"><img src={thumb(v.id)} alt="" loading="lazy" /></div>
                <h3>{v.title}</h3>
                <p><span>{v.cat}</span><i>·</i><span>{v.viewsText}회</span><i>·</i><span>{ymd(v.date)}</span><i>·</i><span>{v.dur}</span></p>
              </a>
            ))}
          </div>
        </div>
        <div className="tsGrid">
          {SAMPLE_CARDS.map(v => (
            <a className="tsCard" key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer">
              <div className="tsCardThumb"><img src={thumb(v.id)} alt="" loading="lazy" /></div>
              <h3>{v.title}</h3>
              <p><span>{v.cat}</span><i>·</i><span>{v.viewsText}회</span><i>·</i><span>{ymd(v.date)}</span></p>
            </a>
          ))}
        </div>
        <p className="tsCaption">↑ 바꾼 카드로 세 장 나란히. 격자에서는 이렇게 보입니다.</p>
      </section>

      {/* ════ 홈에 넣을 섹션 네 개 ════ */}
      <section className="wrap tsGroup" id="home">
        <small>홈 추가 섹션</small>
        <h2>홈에 넣을 네 절 — 지금 데이터로 되는 것만</h2>
        <p>순서대로 넣으면 홈은 <em>히어로 → 세 갈래 → 숫자 → 순위+최신 → 산출물 → 타임라인 → 교육 → 칼럼 → 절차 → 띠</em>가 됩니다. 후기·검색 캡처·팀 소개는 재료가 오면 붙입니다.</p>
      </section>

      {/* ══ 9. 세 갈래 — 위치 ══ */}
      <section className="wrap tsSec" id="s9">
        <Num n={9} title="세 갈래 — 히어로 바로 아래" why="03에서 만든 그 부품입니다. 홈에서는 히어로의 숫자 띠보다 위, 즉 첫 화면을 넘기자마자 나옵니다. 여기서 갈라진 사람은 그 아래 섹션을 자기 순서로 읽습니다." />
        <div className="tsBranch">
          {BRANCHES.map(b => (
            <Link key={b.n} href={b.href} className={b.primary ? 'tsBranchMain' : ''}>
              <small>{b.n}</small>
              <b>{b.title}</b>
              <p>{b.body}</p>
              <span>{b.label} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ 10. 타임라인 ══ */}
      <section className="wrap tsSec" id="s10">
        <Num n={10} title="쌓이는 것 — 해마다 찍은 편수와, 그 편들이 지금까지 모은 조회수" why="'광고는 끄면 끝, 영상은 계속 일한다'를 소개 페이지는 문장으로 말합니다. 홈에서는 그래프 하나로 보여줍니다. 칸 하나가 인터뷰 한 편이라 46칸이 그대로 46명입니다. 이 사이트 데이터로만 그릴 수 있는 모양이라 어디서 본 섹션이 아닙니다." />
        <div className="tsTl">
          {TIMELINE.map(r => (
            <div key={r.y} className={r.y === bestYear.y ? 'best' : ''}>
              <div className="tsTlCells" aria-hidden="true">{Array.from({ length: r.n }).map((_, i) => <i key={i} />)}</div>
              <b>{r.y}</b>
              <span>{r.n}편</span>
              <em>{man(r.views)}</em>
              <small>누적 {man(r.cum)}</small>
            </div>
          ))}
        </div>
        <p className="tsTlCap">{bestYear.y}년에 찍은 {bestYear.n}편이 지금까지 {man(bestYear.views)} 회. 광고였다면 그해 예산이 끝난 날 멈췄을 겁니다. 조회수는 인터뷰 본편 {CHANNEL.interviews}편만 센 것입니다.</p>
      </section>

      {/* ══ 11. 절차 ══ */}
      <section className="wrap tsSec" id="s11">
        <Num n={11} title="신청하면 이렇게 됩니다 — 마무리 띠 바로 위" why="'귀찮은 일 아닌가'를 띠의 버튼을 보기 전에 풀어줍니다. 지금은 신청 페이지에 가야 나오는데, 홈에서 네 칸으로 먼저 보여주면 띠가 눌립니다. 시간이 정보라서 각 칸의 큰 글자는 시간입니다." />
        <ol className="tsFlow">
          {FLOW.map((f, i) => (
            <li key={f.k}>
              <small>{String(i + 1).padStart(2, '0')} · {f.k}</small>
              <b>{f.v}</b>
              <p>{f.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ══ 12. 최신 기록 ══ */}
      <section className="wrap tsSec" id="s12">
        <Num n={12} title="최신 기록 한 편 — 순위 열 옆에" why="지금 홈의 인터뷰 열은 조회수 순이라 2024년 것만 보입니다. 이번 달에 올라온 편이 안 보이면 채널이 멈춘 것처럼 보입니다. 순위 열 옆에 최신 한 편을 날짜와 함께 세웁니다. 아래는 그 자리를 흉내 낸 것입니다." />
        <div className="tsLatest">
          <a className="tsLatestCard" href={watchUrl(LATEST.id)} target="_blank" rel="noreferrer">
            <div className="tsCardThumb"><img src={thumb(LATEST.id)} alt="" loading="lazy" /></div>
            <small>최신 기록 · {ymd(LATEST.date)}</small>
            <h3>{LATEST.title}</h3>
            <p><span>{LATEST.cat}</span><i>·</i><span>{LATEST.viewsText}회</span><i>·</i><span>{LATEST.dur}</span></p>
          </a>
          <ol className="tsRank" aria-label="많이 본 순">
            <li className="tsRankHead"><small>많이 본 순</small></li>
            {RANK.map((v, i) => (
              <li key={v.id}><span>{i + 1}</span><b>{v.title}</b><em>{v.viewsText}</em></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap tsSec tsEnd">
        <p>여기까지가 열두 가지입니다. 번호를 말씀해 주시면 그 절을 제자리로 옮깁니다.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
