'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import SubscribeForm from '../components/SubscribeForm';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import './columns.css';

const cats = ['전체', '창업', '마케팅', '브랜딩', '커리어', 'AI·테크', '생산성'];

import type { ColumnPost } from './data';

export default function ColumnsView({ featured, list }: { featured: ColumnPost; list: ColumnPost[] }) {
  const [cat, setCat] = useState('전체');
  const filtered = useMemo(() => list.filter(c => cat === '전체' || c.cat === cat), [cat]);

  // 히어로에 세울 문장 셋 — 이번 주 칼럼은 바로 아래에서 다시 나오므로 뺀다
  const voices = list.filter(c => c.quote).slice(0, 3);
  const all = [featured, ...list];
  const catCount = new Set(all.map(c => c.cat)).size;
  const avgRead = Math.round(all.reduce((n, c) => n + (parseInt(c.read, 10) || 0), 0) / all.length);

  return <>
    <SiteHeader active="columns" />
    <main>
      <section className="clHero">
        <div className="clHeroGlow" aria-hidden="true" />
        <div className="wrap clHeroInner">
          <div className="clHeroText">
            <span className="eyebrow">성공인사이드 칼럼</span>
            <h1>일하는 사람의 생각을,{' '}<br /><em>매주 한 편의 칼럼으로.</em></h1>
            <p>경험 기록이 인사이트라면, 칼럼은 관점입니다. 먼저 가본 사람들이 지금 시장을 어떻게 읽는지 매주 전합니다.</p>
            <div className="clHeroBtns">
              <Link className="btnPrimary" href={`/columns/${featured.id}`}>이번 주 칼럼 읽기 <ArrowUpRight size={17} /></Link>
              <a className="btnGhost" href="#subscribe">메일로 받아보기</a>
            </div>
          </div>

          {/* 지난 칼럼에서 남은 문장들 — 목록에는 요약만 보이니 여기서만 읽을 수 있다 */}
          <div className="clVoices">
            <small className="clVoicesLabel">지난 칼럼의 문장</small>
            {voices.map(c => (
              <Link key={c.id} className="clVoice" href={`/columns/${c.id}`}>
                <i aria-hidden="true">“</i>
                <span>
                  <b>{c.quote}</b>
                  <em>{c.cat}</em>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="wrap"><dl className="clHeroFacts">
          <div><dt>발행 칼럼</dt><dd>{all.length}편</dd></div>
          <div><dt>다루는 주제</dt><dd>{catCount}개</dd></div>
          <div><dt>발행 주기</dt><dd>주 1편</dd></div>
          <div><dt>평균 읽는 시간</dt><dd>{avgRead}분</dd></div>
        </dl></div>
      </section>

      {/* 이번 주 칼럼 — 상자 없이 hairline 사이의 에디토리얼 스프레드 */}
      <section className="wrap"><div className="clFeature">
        <div className="clFeatureBody">
          <div className="clMetaLine"><b>이번 주 칼럼</b><span>{featured.cat}</span><span>{featured.date}</span><span><Clock size={11} /> {featured.read}</span></div>
          <h2><Link href={`/columns/${featured.id}`}>{featured.title}</Link></h2>
          <p>{featured.excerpt}</p>
          <Link className="clRead" href={`/columns/${featured.id}`}>읽어보기 <ArrowUpRight size={16} /></Link>
        </div>
        <blockquote className="clFeatureQuote">
          <i aria-hidden="true">“</i>
          <p>{featured.quote}</p>
          <small>이번 주의 문장</small>
        </blockquote>
      </div></section>

      <section className="wrap clSection">
        <div className="clHead"><small>매주 발행</small><h2>전체 칼럼</h2></div>
        <div className="clCats">{cats.map(c => <button key={c} className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="clGrid">{filtered.map(c => <Link className="clCard" key={c.id} href={`/columns/${c.id}`}>
          <div className="clMetaLine"><span>{c.cat}</span><span>{c.date}</span><span><Clock size={11} /> {c.read}</span></div>
          <h3>{c.title}</h3>
          <p>{c.excerpt}</p>
          <span className="clMore">읽어보기 <ArrowUpRight size={13} /></span>
        </Link>)}</div>
        {!filtered.length && <div className="clEmpty">이 카테고리의 칼럼이 아직 없습니다.</div>}
      </section>

      <section className="wrap" id="subscribe"><div className="clCta">
        <span>주간 칼럼 구독</span>
        <h2>새 칼럼이 나오면{' '}<br />가장 먼저 받아보세요.</h2>
        <p>새 칼럼이 발행되면 메일로 보내드립니다.</p>
        <div className="clCtaForm"><SubscribeForm source="columns" label="구독하기" /></div>
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
