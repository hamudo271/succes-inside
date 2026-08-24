'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { featured, list } from './data';
import './columns.css';

const cats = ['전체', '창업', '마케팅', '브랜딩', '커리어', 'AI·테크', '생산성'];

const writers = [
  { name: '정지우', role: 'SaaS 창업가', topic: '창업과 성장 전략', init: '정', color: '#d4550f' },
  { name: '이하은', role: '그로스 마케터', topic: '검색과 콘텐츠 마케팅', init: '이', color: '#ff6b2c' },
  { name: '오민재', role: '1인 기업 운영자', topic: '독립과 생존의 기술', init: '오', color: '#2b2b2b' },
  { name: '윤태호', role: 'VC 심사역', topic: '투자자의 시선', init: '윤', color: '#c2865a' },
];

export default function Columns() {
  const [cat, setCat] = useState('전체');
  const filtered = useMemo(() => list.filter(c => cat === '전체' || c.cat === cat), [cat]);

  return <>
    <SiteHeader active="columns" />
    <main>
      <section className="clHero"><div className="wrap">
        <span className="eyebrow">SUCCESS INSIDE COLUMN</span>
        <h1>일하는 사람의 생각을,<br /><em>매주 한 편의 칼럼으로.</em></h1>
        <p>경험 기록이 인사이트라면, 칼럼은 관점입니다.<br />먼저 가본 사람들이 지금 시장을 어떻게 읽는지 매주 전합니다.</p>
      </div></section>

      <section className="wrap"><div className="clFeature">
        <div className="clFeatureBody">
          <span className="clBadge">이번 주 칼럼</span>
          <span className="clTag light">{featured.cat}</span>
          <h2>{featured.title}</h2>
          <p>{featured.excerpt}</p>
          <div className="clAuthor">
            <span className="clAvatar" style={{ background: featured.color }}>{featured.init}</span>
            <div><b>{featured.author}</b><small>{featured.role} · {featured.date} · <Clock size={11} /> {featured.read}</small></div>
          </div>
          <Link className="clRead" href={`/columns/${featured.id}`}>지금 읽어보기 <ArrowUpRight size={16} /></Link>
        </div>
        <div className="clFeatureQuote">
          <i>“</i>
          <p>{featured.quote}</p>
          <small>COLUMN OF THE WEEK</small>
        </div>
      </div></section>

      <section className="wrap clSection">
        <div className="clHead"><small>ALL COLUMNS</small><h2>전체 칼럼</h2></div>
        <div className="clCats">{cats.map(c => <button key={c} className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="clGrid">{filtered.map(c => <Link className="clCard" key={c.id} href={`/columns/${c.id}`}>
          <span className="clTag">{c.cat}</span>
          <h3>{c.title}</h3>
          <p>{c.excerpt}</p>
          <div className="clCardFoot">
            <div className="clAuthor">
              <span className="clAvatar" style={{ background: c.color }}>{c.init}</span>
              <div><b>{c.author}</b><small>{c.role}</small></div>
            </div>
            <small className="clMeta">{c.date} · {c.read}</small>
          </div>
        </Link>)}</div>
        {!filtered.length && <div className="clEmpty">이 카테고리의 칼럼이 아직 없습니다.</div>}
        <button className="clMore">지난 칼럼 더 보기 <ChevronRight size={16} /></button>
      </section>

      <section className="wrap clSection">
        <div className="clHead"><small>COLUMNISTS</small><h2>고정 필진</h2><p>각자의 현장에서 일하며, 매주 돌아가며 씁니다.</p></div>
        <div className="clWriters">{writers.map(w => <div key={w.name}>
          <span className="clAvatar big" style={{ background: w.color }}>{w.init}</span>
          <b>{w.name}</b><small>{w.role}</small><i>{w.topic}</i>
        </div>)}</div>
      </section>

      <section className="wrap"><div className="clCta">
        <span>WEEKLY COLUMN</span>
        <h2>새 칼럼이 나오면<br />가장 먼저 받아보세요.</h2>
        <p>매주 월요일 아침, 한 편씩 메일로 보내드립니다.</p>
        <div className="clCtaForm"><input placeholder="이메일 주소" /><button>구독하기</button></div>
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
