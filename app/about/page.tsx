'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowUpRight, ChevronRight, Plus, Minus, Eye } from 'lucide-react';
import { interviews, watchUrl, CHANNEL } from '../interviews/data';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { faq } from './faq';
import './style.css';

// 왜 — 세 가지 논지. 라벨은 문장의 핵심 동사
/** 조회수 1위 인터뷰 — '축적'의 실물. 찍은 지 몇 해가 지났는지도 데이터에서 센다. */
const top = interviews.reduce((a, b) => (b.views > a.views ? b : a));
const topAge = new Date().getFullYear() - Number(top.date.slice(0, 4));

// 왜 — 세 가지 논지. 남의 통계 대신 우리 숫자를 쓴다. 출처 없는 숫자는 한 줄도 넣지 않는다.
const why = [
  { k: '발견', title: '고객은 결국 이름을 검색합니다', body: '소개를 받아도, 광고를 봐도, 마지막엔 검색창에 이름을 칩니다. 그때 나오는 게 없으면 비교 대상에도 오르지 못합니다. 우리가 만드는 건 그 순간에 나올 것입니다.' },
  { k: '소모', title: '광고는 끄면 그날로 끝납니다', body: '예산이 멈추면 노출도 멈춥니다. 매달 태워도 남는 건 지출 내역이지 브랜드가 아닙니다. 경쟁이 붙으면 단가만 오릅니다.' },
  { k: '축적', title: '찍어둔 하루는 계속 일합니다', body: `${topAge}년 전에 찍은 카센터 사장님 편은 지금도 재생됩니다. ${top.viewsText} 번째까지 왔습니다. 광고였다면 예산이 끝난 날 멈췄을 겁니다.` },
];

const steps = [
  { n: '01', title: '상담과 리서치', body: '목표 메시지를 먼저 정의합니다. 사업의 맥락과 전환점을 미리 정리하고, 무엇을 물어야 할지 정하고 들어갑니다.' },
  { n: '02', title: '인터뷰 촬영', body: '성공한 결과가 아니라 결정의 이유를 묻습니다. 시행착오까지 현장에서 함께 기록합니다.' },
  { n: '03', title: '기사와 숏폼 제작', body: '촬영본을 글로 옮겨 검색이 읽는 기사로 만들고, 숏폼으로 잘라 냅니다. 영상·기사·숏폼이 한 번의 촬영에서 나옵니다.' },
  { n: '04', title: '발행과 리포트', body: '홈페이지 아카이브에 싣고 유튜브·인스타그램·틱톡에 동시에 올린 뒤, 어디서 얼마나 봤는지 보고합니다.' },
];

const gets = ['릴스·쇼츠·틱톡으로 나가는 숏폼 여러 편', '유튜브 채널에 실리는 정식 인터뷰 본편', '검색이 읽을 수 있는 홈페이지 인터뷰 기사', '네이버·구글·AI 검색에 남는 근거', '유튜브·인스타그램·틱톡 동시 발행', '해가 지나도 재생 수가 쌓이는 기록'];


export default function About() {
  const [open, setOpen] = useState<number | null>(0);
  return <>
    <SiteHeader active="about" />
    <main>
      {/* 히어로 — 선언 | 현장 스틸(조회수 1위 인터뷰) */}
      <section className="abHero"><div className="wrap abHeroInner">
        <div>
          <span className="eyebrow">인터뷰 미디어</span>
          <h1>광고는 끄면 사라지고,{' '}<br /><em>기록은 켜둔 적이 없어도 남습니다.</em></h1>
          <p>{CHANNEL.since}년 {CHANNEL.origin}에서 시작해 {CHANNEL.interviews}명의 하루를 기록했습니다. 숏폼까지 합쳐 {CHANNEL.channelViewsText} 번 재생됐습니다.</p>
          <div className="abHeroBtns">
            <Link className="pulseBtn" href="/interviews">인터뷰 보기 <ArrowUpRight size={17} /></Link>
            <Link href="/apply">출연·파트너십 문의 <ChevronRight size={17} /></Link>
          </div>
        </div>
        <a className="abStill" href={watchUrl(top.id)} target="_blank" rel="noreferrer">
          <img src="/about-still.jpg" alt={`${top.title} — 성공인사이드 인터뷰 장면`} />
          <span className="abPlayBtn pulse"><Play size={22} fill="currentColor" /></span>
          <span className="abStillCap"><small>가장 많이 본 인터뷰 · <Eye size={11} /> {top.viewsText}회</small><b>{top.title}</b></span>
        </a>
      </div></section>

      {/* 왜 — 세 논지를 행으로 */}
      <section className="wrap abSection" id="why">
        <div className="abHead"><small>왜 필요한가</small><h2>왜 성공인사이드인가</h2></div>
        <div className="abWhy">{why.map(w => <div key={w.k}>
          <span>{w.k}</span>
          <b>{w.title}</b>
          <p>{w.body}</p>
        </div>)}</div>
      </section>

      {/* 진행 — 순서가 정보이므로 번호 */}
      <section className="wrap abSection" id="os">
        <div className="abHead"><small>진행 과정</small><h2>한 번의 인터뷰가 기록으로 남기까지</h2><p>즉흥적으로 찍지 않습니다. 촬영부터 기사·배포·리포트까지 한 흐름으로 갑니다.</p></div>
        <ol className="abSteps">{steps.map(s => <li key={s.n}><strong>{s.n}</strong><b>{s.title}</b><p>{s.body}</p></li>)}</ol>
      </section>

      {/* 제공 가치 — 목록 | 선언 */}
      <section className="wrap abSection" id="get">
        <div className="abGet">
          <div>
            <div className="abHead"><small>제공 가치</small><h2>고객이 얻는 6가지 가치</h2></div>
            <ol>{gets.map((g, i) => <li key={g}><span>{String(i + 1).padStart(2, '0')}</span>{g}</li>)}</ol>
          </div>
          <blockquote className="abClaim">
            <i aria-hidden="true">“</i>
            <p>한 번의 인터뷰가{' '}<br />계속 일하는 자산이 됩니다.</p>
            <small>광고와 달리 멈추지 않습니다. 발행한 뒤에도 검색으로 계속 찾아옵니다.</small>
            <Link href="/programs">교육 과정도 함께 보기 <ChevronRight size={15} /></Link>
          </blockquote>
        </div>
      </section>

      {/* FAQ — hairline 행 아코디언 */}
      <section className="wrap abSection" id="faq">
        <div className="abHead"><small>궁금한 점</small><h2>자주 묻는 질문</h2></div>
        <div className="abFaq">{faq.map((f, i) => <div key={f.q} className={open === i ? 'open' : ''}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{f.q}</span>{open === i ? <Minus size={17} /> : <Plus size={17} />}
          </button>
          <p>{f.a}</p>
        </div>)}</div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
