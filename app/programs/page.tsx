'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Users, PlayCircle, CalendarDays, Play } from 'lucide-react';
import { interviews, cats, watchUrl, CHANNEL } from '../interviews/data';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CtaBand from '../components/CtaBand';
import './programs.css';

const live = [
  {
    id: 'first-100', title: '첫 고객 100명 만들기', badge: '모집중', term: '4주 과정 · 주 1회 라이브', seats: '정원 20명',
    summary: '고객 문제를 정의하고 가설을 세워, 노코드로 MVP를 만들어 4주 안에 검증까지 마치는 과정입니다.',
    curriculum: ['풀 만한 문제를 고르는 기준 세우기', '인터뷰 설계와 가설 문장으로 정리하기', '노코드로 2주 안에 MVP 만들기', '검증 지표를 읽고 다음 실험 설계하기'],
    cases: ['온라인·N잡', '요식업', '뷰티·의료'],
  },
  {
    id: 'deck', title: '사업계획서 완성 워크숍', badge: '모집중', term: '5주 과정 · 매주 과제 피드백', seats: '정원 16명',
    summary: '아이디어를 투자자와 팀이 같은 그림으로 읽는 문서로 만듭니다. 매주 실제 본인 사업으로 한 장씩 완성합니다.',
    curriculum: ['시장과 문제를 한 장으로 정의하기', '숫자로 설명하는 사업 구조 만들기', '투자자가 먼저 보는 페이지 다듬기', '발표와 Q&A 리허설'],
    cases: ['전문직', '자동차', '시공·인테리어'],
  },
  {
    id: 'cx', title: '재구매를 만드는 CX 설계', badge: '6기 대기', term: '4주 과정 · 주 1회 라이브', seats: '정원 20명',
    summary: '첫 구매를 늘리는 대신 두 번째 구매를 설계합니다. 이탈이 일어나는 지점을 찾아 고객 경험을 다시 짭니다.',
    curriculum: ['재구매율을 핵심 지표로 옮기기', '고객 여정에서 이탈 구간 찾기', '재구매를 만드는 접점 설계하기', '운영 가능한 CX 루틴 만들기'],
    cases: ['뷰티·의료', '요식업', '피트니스'],
  },
  {
    id: 'solo', title: '1인 기업 생존 부트캠프', badge: '모집중', term: '6주 과정 · 격주 1:1 코칭', seats: '정원 12명',
    summary: '막연한 자신감 대신 현금흐름과 고객 파이프라인을 숫자로 관리하는 습관을 만드는 과정입니다.',
    curriculum: ['최소 생존 매출과 런웨이 계산하기', '혼자서도 돌아가는 파이프라인 만들기', '가격과 업무 범위 정하기', '반복 업무를 도구로 넘기기'],
    cases: ['온라인·N잡', '시공·인테리어', '기타'],
  },
];

const vod = [
  {
    id: 'ai', title: 'AI 업무 자동화 설계', hours: '3시간 12분 · 14강', tag: 'AI·테크',
    summary: '도구를 고르기 전에 업무 흐름을 먼저 정리합니다. 실패한 자동화 사례까지 함께 다룹니다.',
    cases: ['온라인·N잡', '전문직'],
    learn: ['자동화할 업무와 남길 업무 구분하기', '흐름을 먼저 그리고 도구를 붙이기', '실패하는 자동화의 공통 패턴'],
  },
  {
    id: 'growth', title: '광고비 0원 그로스 마케팅', hours: '2시간 45분 · 11강', tag: '마케팅',
    summary: '채널을 늘리기 전에, 고객이 이미 모여 있는 한 곳을 깊게 파는 방법을 다룹니다.',
    cases: ['요식업', '뷰티·의료'],
    learn: ['우리 고객이 모여 있는 곳 찾기', '한 채널을 끝까지 파는 실험 설계', '초기 단계에 볼 지표만 남기기'],
  },
  {
    id: 'brand', title: '가격 경쟁에서 벗어나는 브랜딩', hours: '2시간 20분 · 9강', tag: '브랜딩',
    summary: '예쁜 로고보다 먼저, 고객이 우리를 기억할 한 문장을 만드는 순서를 다룹니다.',
    cases: ['뷰티·의료', '자동차'],
    learn: ['기억되는 한 문장 만들기', '가격이 아닌 기준으로 경쟁하기', '작은 브랜드의 접점 우선순위'],
  },
  {
    id: 'finance', title: '창업가의 재무 기준 세우기', hours: '3시간 05분 · 12강', tag: '재테크',
    summary: '투자자가 사업을 볼 때 쓰는 기준을 그대로 가져와, 스스로 의사결정 기준을 세웁니다.',
    cases: ['전문직', '시공·인테리어'],
    learn: ['공헌이익을 제대로 정의하기', '런웨이와 투자 시점 판단하기', '투자자가 먼저 확인하는 숫자'],
  },
  {
    id: 'writing', title: '읽히는 글을 쓰는 법', hours: '1시간 58분 · 8강', tag: '생산성',
    summary: '경험을 남에게 전달되는 글로 바꿉니다. 성공인사이드에 인사이트를 쓰는 분들을 위한 과정입니다.',
    cases: ['기타', '온라인·N잡'],
    learn: ['읽는 사람의 질문에서 시작하기', '경험을 구조로 정리하기', '고쳐 쓰기 체크리스트'],
  },
];

const tabs = [{ k: 'all', l: '전체' }, { k: 'live', l: '정기 과정' }, { k: 'vod', l: 'VOD 과정' }];

/** 사례 벽 — 업종마다 가장 많이 본 인터뷰 한 편씩, 조회수 순으로 9편 */
const CASES = (() => {
  const byCat = cats.filter(c => c !== '전체').map(c =>
    interviews.filter(i => i.cat === c).sort((a, b) => b.views - a.views)[0]!);
  const rest = [...interviews].sort((a, b) => b.views - a.views).filter(i => !byCat.includes(i));
  return [...byCat, ...rest].slice(0, 9).sort((a, b) => b.views - a.views);
})();
const INDUSTRIES = cats.length - 1;
/** 업종 이름 → 그 업종에서 가장 많이 본 인터뷰 */
const caseFor = (cat: string) => interviews.filter(i => i.cat === cat).sort((a, b) => b.views - a.views)[0]!;
const mq = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

export default function Programs() {
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState<string | null>(null);
  const showLive = tab === 'all' || tab === 'live';
  const showVod = tab === 'all' || tab === 'vod';

  return <>
    <SiteHeader active="programs" />
    <main>
      <section className="pgHero"><div className="wrap pgHeroInner">
        <div>
          <span className="eyebrow">성공인사이드 교육 과정</span>
          <h1>다음 단계로 가는 길을,{' '}<br /><em>먼저 가본 사람과 함께.</em></h1>
          <p>성공인사이드 교육 과정은 이론이 아니라 실제로 해본 사람의 순서를 배웁니다.{' '}<br />내 사업과 커리어에 바로 적용할 결과물을 들고 나가는 것을 목표로 합니다.</p>
          <div className="pgHeroBtns">
            <a href="#live">과정 둘러보기 <ArrowUpRight size={18} /></a>
            <Link href="/about">성공인사이드가 만드는 것 <ChevronRight size={18} /></Link>
          </div>
        </div>
      </div></section>

      {/* ── 교재: 이론이 아니라 인터뷰에서 나온 실제 결정 ── */}
      <section className="wrap pgSection pgCases">
        <div className="pgCasesText">
          <small>교재</small>
          <h2>교재는 이론이 아니라{' '}<br />{CHANNEL.interviews}명의 하루입니다</h2>
          <p>성공인사이드 과정은 인터뷰에서 실제로 나온 결정을 사례로 씁니다. 왜 그 가격을 정했는지, 왜 그 자리에 가게를 냈는지 — 결과가 아니라 결정을 따라갑니다.</p>
          <ol className="pgBeats">
            <li><b>사례</b><span>한 사장님의 결정 장면을 영상으로 봅니다.</span></li>
            <li><b>질문</b><span>같은 상황이면 나는 어떻게 했을지 답합니다.</span></li>
            <li><b>적용</b><span>내 사업의 다음 결정 하나를 정해서 나갑니다.</span></li>
          </ol>
          <dl className="pgCaseStats">
            <div><dd>{CHANNEL.interviews}편</dd><dt>사례 영상</dt></div>
            <div><dd>{INDUSTRIES}개</dd><dt>업종</dt></div>
            <div><dd>{CHANNEL.totalViewsText}</dd><dt>누적 시청</dt></div>
          </dl>
        </div>
        <div className="pgWall">{CASES.map((v, i) => (
          <a key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer" className={i === 0 ? 'big' : ''}>
            <img src={`https://i.ytimg.com/vi/${v.id}/${i === 0 ? 'hq720' : 'mqdefault'}.jpg`} alt="" loading="lazy" />
            <span className="pgWallCat">{v.cat}</span>
            <span className="pgWallTitle"><Play size={12} fill="currentColor" />{v.title}</span>
          </a>
        ))}</div>
      </section>

      <div className="wrap pgTabs">{tabs.map(t => <button key={t.k} className={tab === t.k ? 'active' : ''} onClick={() => setTab(t.k)}>{t.l}</button>)}</div>

      {showLive && <section className="wrap pgSection" id="live">
        <div className="pgHead"><small>기수제 운영</small><h2>정기 과정</h2><p>기수제로 함께 진행합니다. 매주 과제와 피드백으로 결과물을 완성합니다.</p></div>
        <div className="pgLive">{live.map(c => <article key={c.id}>
          <div className="pgRowMain">
            <span className={'pgBadge' + (c.badge === '모집중' ? ' on' : '')}>{c.badge}</span>
            <h3>{c.title}</h3>
            <p>{c.summary}</p>
            <div className="pgMeta"><span><CalendarDays size={14} /> {c.term}</span><span><Users size={14} /> {c.seats}</span></div>
          </div>
          <ol className="pgSteps">{c.curriculum.map((x, i) => <li key={x}><span>{String(i + 1).padStart(2, '0')}</span>{x}</li>)}</ol>
          <div className="pgRowCases">
            <small>사례 인터뷰</small>
            <div className="pgCaseThumbs">{c.cases.map(cat => { const v = caseFor(cat); return (
              <a key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer" title={v.title}>
                <img src={mq(v.id)} alt="" loading="lazy" /><span>{cat}</span>
              </a>); })}</div>
            <Link className="pgRowLink" href={`/apply?type=교육 과정 문의&course=${encodeURIComponent(c.title)}`}>과정 문의 <ArrowUpRight size={14} /></Link>
          </div>
        </article>)}</div>
      </section>}

      {showVod && <section className="wrap pgSection" id="vod">
        <div className="pgHead"><small>언제든 시작</small><h2>VOD 과정</h2><p>원하는 시점에 바로 시작합니다. 사례 인터뷰와 학습 내용을 확인하고 선택하세요.</p></div>
        <div className="pgVod">{vod.map(c => <article key={c.id} className={open === c.id ? 'open' : ''}>
          <button className="pgVodHead" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
            <span className="pgTag">{c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.summary}</p>
            <div className="pgMeta"><span><PlayCircle size={14} /> {c.hours}</span></div>
            <i className="pgChev"><ChevronRight size={18} /></i>
          </button>
          <div className="pgVodBody">
            <div>
              <h4>사례 인터뷰</h4>
              <div className="pgCaseThumbs">{c.cases.map(cat => { const v = caseFor(cat); return (
                <a key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer" title={v.title}>
                  <img src={mq(v.id)} alt="" loading="lazy" /><span>{cat}</span>
                </a>); })}</div>
            </div>
            <div><h4>주요 학습 내용</h4><ul>{c.learn.map(x => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </article>)}</div>
      </section>}

      <CtaBand
        title={<>어떤 과정이 맞는지 모르겠다면,{' '}<br />고민을 먼저 알려주세요.</>}
        sub="사업 단계와 목표를 남기면, 맞는 과정을 정리해 안내드립니다. 인터뷰 출연과 함께 상담할 수도 있습니다."
        href="/apply?type=교육 과정 문의" label="과정 문의하기"
        facts={[{ k: '회신', v: '보통 일주일' }, { k: '정기 과정', v: '기수제 4~6주' }, { k: 'VOD', v: '언제든 시작' }]}
      />
    </main>
    <SiteFooter />
  </>;
}
