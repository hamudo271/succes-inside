'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Check, Users, PlayCircle, CalendarDays } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './programs.css';

const mentors = [
  { name: '김서준', role: '커머스 브랜드 대표', course: '첫 고객 100명 만들기', init: '김', color: '#4a4540' },
  { name: '이하은', role: '그로스 마케터', course: '그로스 마케팅', init: '이', color: '#ff6b2c' },
  { name: '박도윤', role: 'AI 프로덕트 빌더', course: 'AI 업무 자동화 설계', init: '박', color: '#57524b' },
  { name: '최유진', role: '브랜드 디렉터', course: '가격 경쟁에서 벗어나는 브랜딩', init: '최', color: '#e0824a' },
  { name: '오민재', role: '1인 기업 운영자', course: '1인 기업 생존 부트캠프', init: '오', color: '#4a4540' },
  { name: '정지우', role: 'SaaS 창업가', course: '사업계획서 완성 워크숍', init: '정', color: '#d4550f' },
  { name: '한소연', role: '콘텐츠 전략가', course: '읽히는 글을 쓰는 법', init: '한', color: '#8a5a3b' },
  { name: '윤태호', role: 'VC 심사역', course: '창업가의 재무 기준 세우기', init: '윤', color: '#c2865a' },
];

const live = [
  {
    id: 'first-100', title: '첫 고객 100명 만들기', badge: '모집중', term: '4주 과정 · 주 1회 라이브', seats: '정원 20명',
    summary: '고객 문제를 정의하고 가설을 세워, 노코드로 MVP를 만들어 4주 안에 검증까지 마치는 과정입니다.',
    curriculum: ['풀 만한 문제를 고르는 기준 세우기', '인터뷰 설계와 가설 문장으로 정리하기', '노코드로 2주 안에 MVP 만들기', '검증 지표를 읽고 다음 실험 설계하기'],
    by: ['김서준', '이하은'],
  },
  {
    id: 'deck', title: '사업계획서 완성 워크숍', badge: '모집중', term: '5주 과정 · 매주 과제 피드백', seats: '정원 16명',
    summary: '아이디어를 투자자와 팀이 같은 그림으로 읽는 문서로 만듭니다. 매주 실제 본인 사업으로 한 장씩 완성합니다.',
    curriculum: ['시장과 문제를 한 장으로 정의하기', '숫자로 설명하는 사업 구조 만들기', '투자자가 먼저 보는 페이지 다듬기', '발표와 Q&A 리허설'],
    by: ['정지우', '윤태호'],
  },
  {
    id: 'cx', title: '재구매를 만드는 CX 설계', badge: '6기 대기', term: '4주 과정 · 주 1회 라이브', seats: '정원 20명',
    summary: '첫 구매를 늘리는 대신 두 번째 구매를 설계합니다. 이탈이 일어나는 지점을 찾아 고객 경험을 다시 짭니다.',
    curriculum: ['재구매율을 핵심 지표로 옮기기', '고객 여정에서 이탈 구간 찾기', '재구매를 만드는 접점 설계하기', '운영 가능한 CX 루틴 만들기'],
    by: ['김서준', '최유진'],
  },
  {
    id: 'solo', title: '1인 기업 생존 부트캠프', badge: '모집중', term: '6주 과정 · 격주 1:1 코칭', seats: '정원 12명',
    summary: '막연한 자신감 대신 현금흐름과 고객 파이프라인을 숫자로 관리하는 습관을 만드는 과정입니다.',
    curriculum: ['최소 생존 매출과 런웨이 계산하기', '혼자서도 돌아가는 파이프라인 만들기', '가격과 업무 범위 정하기', '반복 업무를 도구로 넘기기'],
    by: ['오민재'],
  },
];

const vod = [
  {
    id: 'ai', title: 'AI 업무 자동화 설계', hours: '3시간 12분 · 14강', tag: 'AI·테크', by: '박도윤', byRole: 'AI 프로덕트 빌더',
    summary: '도구를 고르기 전에 업무 흐름을 먼저 정리합니다. 실패한 자동화 사례까지 함께 다룹니다.',
    credits: ['팀 반복 업무 40% 감축 경험', '노코드·LLM 자동화 파이프라인 설계', '사내 자동화 도입 워크숍 다수 진행'],
    learn: ['자동화할 업무와 남길 업무 구분하기', '흐름을 먼저 그리고 도구를 붙이기', '실패하는 자동화의 공통 패턴'],
  },
  {
    id: 'growth', title: '광고비 0원 그로스 마케팅', hours: '2시간 45분 · 11강', tag: '마케팅', by: '이하은', byRole: '그로스 마케터',
    summary: '채널을 늘리기 전에, 고객이 이미 모여 있는 한 곳을 깊게 파는 방법을 다룹니다.',
    credits: ['광고비 없이 초기 고객 100명 확보', '커뮤니티 기반 획득 채널 설계', '초기 단계 그로스 실험 운영'],
    learn: ['우리 고객이 모여 있는 곳 찾기', '한 채널을 끝까지 파는 실험 설계', '초기 단계에 볼 지표만 남기기'],
  },
  {
    id: 'brand', title: '가격 경쟁에서 벗어나는 브랜딩', hours: '2시간 20분 · 9강', tag: '브랜딩', by: '최유진', byRole: '브랜드 디렉터',
    summary: '예쁜 로고보다 먼저, 고객이 우리를 기억할 한 문장을 만드는 순서를 다룹니다.',
    credits: ['소규모 브랜드 리브랜딩 다수 담당', '카테고리 정의 중심의 포지셔닝 설계', '브랜드 메시지 워크숍 운영'],
    learn: ['기억되는 한 문장 만들기', '가격이 아닌 기준으로 경쟁하기', '작은 브랜드의 접점 우선순위'],
  },
  {
    id: 'finance', title: '창업가의 재무 기준 세우기', hours: '3시간 05분 · 12강', tag: '재테크', by: '윤태호', byRole: 'VC 심사역',
    summary: '투자자가 사업을 볼 때 쓰는 기준을 그대로 가져와, 스스로 의사결정 기준을 세웁니다.',
    credits: ['초기 단계 투자 심사 경험', '스타트업 재무 구조 리뷰 다수', '창업가 대상 재무 멘토링 진행'],
    learn: ['공헌이익을 제대로 정의하기', '런웨이와 투자 시점 판단하기', '투자자가 먼저 확인하는 숫자'],
  },
  {
    id: 'writing', title: '읽히는 글을 쓰는 법', hours: '1시간 58분 · 8강', tag: '생산성', by: '한소연', byRole: '콘텐츠 전략가',
    summary: '경험을 남에게 전달되는 글로 바꿉니다. 성공인사이드에 인사이트를 쓰는 분들을 위한 과정입니다.',
    credits: ['비즈니스 콘텐츠 전략 수립', '창업가 인터뷰·아티클 편집 다수', '뉴스레터 구독 성장 운영'],
    learn: ['읽는 사람의 질문에서 시작하기', '경험을 구조로 정리하기', '고쳐 쓰기 체크리스트'],
  },
];

const tabs = [{ k: 'all', l: '전체' }, { k: 'live', l: '정기 과정' }, { k: 'vod', l: 'VOD 과정' }];

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
          <h1>다음 단계로 가는 길을,{' '}<br /><em>먼저 가본 사람과 함께.</em></h1>
          <p>성공인사이드 교육 과정은 이론이 아니라 실제로 해본 사람의 순서를 배웁니다.{' '}<br />내 사업과 커리어에 바로 적용할 결과물을 들고 나가는 것을 목표로 합니다.</p>
          <div className="pgHeroBtns">
            <a href="#live">과정 둘러보기 <ArrowUpRight size={18} /></a>
            <Link href="/about">성공인사이드가 만드는 것 <ChevronRight size={18} /></Link>
          </div>
        </div>
      </div></section>

      <section className="wrap pgSection">
        <div className="pgHead"><h2>먼저 가본 실무자와 함께합니다</h2><p>성공인사이드에서 경험을 나누는 멤버가 직접 과정을 이끕니다.</p></div>
        <div className="pgMentors">{mentors.map(m => <div className="pgMentor" key={m.name}>
          <span className="pgAvatar" style={{ background: m.color }}>{m.init}</span>
          <b>{m.name}</b><small>{m.role}</small><i>{m.course}</i>
        </div>)}</div>
      </section>

      <div className="wrap pgTabs">{tabs.map(t => <button key={t.k} className={tab === t.k ? 'active' : ''} onClick={() => setTab(t.k)}>{t.l}</button>)}</div>

      {showLive && <section className="wrap pgSection" id="live">
        <div className="pgHead"><h2>정기 과정</h2><p>기수제로 함께 진행합니다. 매주 과제와 피드백으로 결과물을 완성합니다.</p></div>
        <div className="pgLive">{live.map(c => <article key={c.id}>
          <div className="pgLiveTop">
            <span className={'pgBadge' + (c.badge === '모집중' ? ' on' : '')}>{c.badge}</span>
            <h3>{c.title}</h3>
            <p>{c.summary}</p>
            <div className="pgMeta"><span><CalendarDays size={14} /> {c.term}</span><span><Users size={14} /> {c.seats}</span></div>
          </div>
          <ul className="pgCurriculum">{c.curriculum.map(x => <li key={x}><Check size={14} /> {x}</li>)}</ul>
          <div className="pgLiveFoot">
            <div className="pgBy">{c.by.map(n => { const m = mentors.find(x => x.name === n)!; return <span key={n} style={{ background: m.color }}>{m.init}</span>; })}<small>{c.by.join(' · ')}</small></div>
            <button>자세히 보기 <ChevronRight size={15} /></button>
          </div>
        </article>)}</div>
      </section>}

      {showVod && <section className="wrap pgSection" id="vod">
        <div className="pgHead"><h2>VOD 과정</h2><p>원하는 시점에 바로 시작합니다. 강사 이력과 학습 내용을 확인하고 선택하세요.</p></div>
        <div className="pgVod">{vod.map(c => <article key={c.id} className={open === c.id ? 'open' : ''}>
          <button className="pgVodHead" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
            <span className="pgTag">{c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.summary}</p>
            <div className="pgMeta"><span><PlayCircle size={14} /> {c.hours}</span><span>{c.by} · {c.byRole}</span></div>
            <i className="pgChev"><ChevronRight size={18} /></i>
          </button>
          <div className="pgVodBody">
            <div><h4>강사 이력</h4><ul>{c.credits.map(x => <li key={x}>{x}</li>)}</ul></div>
            <div><h4>주요 학습 내용</h4><ul>{c.learn.map(x => <li key={x}><Check size={13} /> {x}</li>)}</ul></div>
          </div>
        </article>)}</div>
      </section>}

      <section className="wrap"><div className="pgCta">
        <span>과정 신청</span>
        <h2>어떤 과정이 맞는지 모르겠다면,{' '}<br />지금 고민을 먼저 알려주세요.</h2>
        <p>사업 단계와 목표를 남기면, 맞는 과정을 정리해 안내드립니다.</p>
        <div className="pgCtaForm"><Link className="pgCtaLink" href="/apply?type=교육 과정 문의">과정 문의하기 <ArrowUpRight size={16} /></Link></div>
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
