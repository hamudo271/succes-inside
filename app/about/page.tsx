'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowUpRight, ChevronRight, Plus, Minus } from 'lucide-react';
import { interviews, watchUrl, thumb } from '../interviews/data';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './style.css';

const why = [
  {
    fig: '31.3%', figNote: '2026년 미국 인구의 AI 검색 이용 전망',
    title: '좋은 회사보다 잘 발견되는 회사가 성장합니다',
    body: '검색과 AI가 구매 결정을 대신하는 시대입니다. 검색 결과에 근거가 없는 브랜드는 비교 대상에도 오르지 못합니다.',
  },
  {
    fig: '0', figNote: '광고가 끝난 뒤 남는 자산',
    title: '광고는 멈추지만, 자산은 남아야 합니다',
    body: '광고는 예산이 끝나는 순간 노출도 멈추는 소모성 비용입니다. 매달 비용을 태워도 남는 것이 없고, 경쟁이 붙을수록 단가만 오릅니다. 결국 남는 것은 지출 내역뿐, 브랜드가 아닙니다.',
  },
  {
    fig: '3배', figNote: '백링크 대비 브랜드 언급의 AI 인용 상관',
    title: '한 번의 촬영이 축적되는 자산이 되어야 합니다',
    body: '제작으로 끝나는 영상은 파일 하나로 남을 뿐입니다. 성공인사이드는 대표님의 이야기를 검색되고 AI에 인용되는 브랜드 자산으로 전환합니다.',
  },
];

const steps = [
  { n: '01', title: '상담과 리서치', body: '목표 메시지를 먼저 정의합니다. 사업의 맥락과 전환점을 미리 정리하고, 무엇을 물어야 할지 정하고 들어갑니다.' },
  { n: '02', title: '인터뷰 촬영', body: '성공한 결과가 아니라 결정의 이유를 묻습니다. 시행착오까지 현장에서 함께 기록합니다.' },
  { n: '03', title: 'AI 콘텐츠 생성', body: '촬영본을 AI로 전사해 기사화하고 검색에 최적화합니다. 영상·기사·숏폼이 하나의 파이프라인에서 만들어집니다.' },
  { n: '04', title: '발행·확산과 리포트', body: '홈페이지 인터뷰 아카이브에 발행하고 SNS 멀티채널로 동시 확산한 뒤, 노출 성과를 측정해 보고합니다.' },
];

const gets = ['유튜브 채널에 게재되는 정식 인터뷰 영상', '릴스·쇼츠·틱톡용 숏폼 콘텐츠', '검색에 최적화된 홈페이지 인터뷰 기사', '네이버·구글·AI 검색 기반 노출', 'SNS 멀티채널 동시 확산', '시간이 지날수록 쌓이는 영구적 디지털 자산'];

const faq = [
  { q: '어느 정도 규모여야 참여할 수 있나요?', a: '아무나 출연하는 채널이 아닙니다. 모든 인터뷰는 내부 검토 후 진행하며, 매출 규모보다 스스로 설명할 수 있는 의사결정과 검증된 성장 서사가 있는지를 봅니다.' },
  { q: '실패한 이야기도 다루나요?', a: '오히려 가장 많이 찾는 기록입니다. 성공만 남은 이야기는 따라 할 수 없습니다. 무엇을 잘못 판단했고 어떻게 고쳤는지가 핵심입니다.' },
  { q: '기록을 남기는 데 시간이 얼마나 필요한가요?', a: '사전 리서치 자료 확인 30분, 인터뷰 90분 정도입니다. 편집과 구조화는 성공인사이드가 맡습니다.' },
  { q: '공개 범위를 조절할 수 있나요?', a: '가능합니다. 발행 전에 전체 원고를 확인하고, 공개하지 않을 숫자나 내용을 지정할 수 있습니다.' },
];

export default function About() {
  const [open, setOpen] = useState<number | null>(0);
  const top = interviews.reduce((a, b) => (b.views > a.views ? b : a));
  return <>
    <SiteHeader active="about" />
    <main>
      <section className="abHero"><div className="wrap abHeroInner">
        <div>
          <h1>당신의 성공은{' '}<br /><em>기록되고 있습니까?</em></h1>
          <p>사업가의 성장 스토리를 검색되는 디지털 자산으로 남기는 인터뷰 미디어.</p>
          <div className="abHeroBtns">
            <Link href="/interviews">성공 스토리 보기 <ArrowUpRight size={17} /></Link>
            <Link href="/apply">출연·파트너십 문의 <ChevronRight size={17} /></Link>
          </div>
        </div>
        <a className="abPlay" href={watchUrl(top.id)} target="_blank" rel="noreferrer">
          <span className="abPlayShot">
            <img src={thumb(top.id)} alt="" loading="lazy" />
            <span className="abPlayBtn"><Play size={20} fill="currentColor" /></span>
          </span>
          <small>가장 많이 본 인터뷰 · {top.viewsText}회 재생</small>
          <p>{top.title.length > 30 ? top.title.slice(0, 30) + '…' : top.title}</p>
        </a>
      </div></section>

      <section className="wrap abSection" id="why">
        <div className="abHead"><h2>왜 성공인사이드인가</h2></div>
        <div className="abWhy">{why.map(w => <article key={w.title}>
          <div className="abFig"><b className="dsp">{w.fig}</b><span>{w.figNote}</span></div>
          <div className="abArg"><h3>{w.title}</h3><p>{w.body}</p></div>
        </article>)}</div>
      </section>

      <section className="abOs" id="os"><div className="wrap">
        <div className="abHead dark"><h2>한 번의 인터뷰가 브랜드 자산이 되기까지</h2><p>즉흥적인 인터뷰가 아니라, 촬영부터 기사·SEO·배포·리포트까지 하나의 자동화 파이프라인으로 운영합니다.</p></div>
        <div className="abSteps">{steps.map(s => <div key={s.n}><strong>{s.n}</strong><b>{s.title}</b><p>{s.body}</p></div>)}</div>
      </div></section>

      <section className="wrap abSection" id="get">
        <div className="abGet">
          <div>
            <div className="abHead"><h2>고객이 얻는 6가지 가치</h2></div>
            <ul>{gets.map(g => <li key={g}>{g}</li>)}</ul>
          </div>
          <div className="abGetCard">
            <span>인터뷰 자산</span>
            <b>한 번의 인터뷰가{' '}<br />계속 일하는 자산이 됩니다.</b>
            <p>광고와 달리 멈추지 않습니다. 발행 이후에도 검색과 AI 인용을 통해 24시간 새로운 고객에게 도달합니다.</p>
            <Link href="/programs">교육 과정도 함께 보기 <ChevronRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="wrap abSection" id="faq">
        <div className="abHead"><h2>자주 묻는 질문</h2></div>
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
