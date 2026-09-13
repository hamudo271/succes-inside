'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Play, ArrowUpRight, Eye } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CtaBand from '../components/CtaBand';
import { interviews, cats, thumb, watchUrl, CHANNEL } from './data';
import CaseWall from '../programs/CaseWall';
import '../programs/programs.css';   // 사례 벽
import './interviews.css';

const ymd = (d: string) => `${d.slice(2, 4)}.${d.slice(5, 7)}`;

/** 조회수 1위 — 상단 대표 사례. 사례 벽에서는 뺀다(같은 스틸이 두 번 보이지 않게). */
const FEATURED = interviews.reduce((a, b) => (b.views > a.views ? b : a));
const FEATURED_AGE = new Date().getFullYear() - Number(FEATURED.date.slice(0, 4));
/** 업종별 편수와 최다 조회 편 — 편수 많은 순. 누르면 아래 목록이 그 업종으로 걸러진다. */
const BY_CAT = cats.filter(c => c !== '전체').map(c => {
  const list = interviews.filter(i => i.cat === c);
  return { cat: c, n: list.length, top: [...list].sort((a, b) => b.views - a.views)[0]! };
}).sort((a, b) => b.n - a.n);
const WALL = (() => {
  const heads = BY_CAT.map(b => b.top).filter(i => i !== FEATURED);
  const rest = [...interviews].sort((a, b) => b.views - a.views).filter(i => i !== FEATURED && !heads.includes(i));
  return [...heads, ...rest].slice(0, 9).sort((a, b) => b.views - a.views);
})();

export default function Interviews() {
  const [cat, setCat] = useState('전체');
  const list = useMemo(
    () => interviews.filter(i => cat === '전체' || i.cat === cat),
    [cat],
  );
  const pick = (c: string) => {
    setCat(c);
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <>
    <SiteHeader active="interviews" />
    <main>
      <section className="ivHero"><div className="wrap">
        <span className="eyebrow">인터뷰 아카이브</span>
        <h1>기록된 사장님들의{' '}<br /><em>{CHANNEL.interviews}가지 성장 서사.</em></h1>
        <p>{CHANNEL.since}년 {CHANNEL.origin}에서 시작해 전국의 사장님을 찾아가 하루를 따라갔습니다.{' '}<br />결과가 아니라 결정의 이유를 남기는 것이 성공인사이드의 일입니다.</p>
        <ul className="ivStats">
          <li><b>{CHANNEL.interviews}</b><span>인터뷰</span></li>
          <li><b>{CHANNEL.channelViewsText}</b><span>총 조회수 · 숏폼 포함</span></li>
          <li><b>{CHANNEL.subscribers}</b><span>구독자</span></li>
          <li><b>{CHANNEL.totalVideos}</b><span>발행 콘텐츠</span></li>
        </ul>
        <small className="ivAsOf">{CHANNEL.asOf} 기준</small>
      </div></section>

      {/* 대표 사례 한 편 + 업종 진입 — 46장을 같은 크기로 늘어놓기 전에 눈이 멈출 곳 */}
      <section className="wrap ivTop">
        <a className="ivFeat" href={watchUrl(FEATURED.id)} target="_blank" rel="noreferrer">
          <div className="ivFeatImg"><img src={`https://i.ytimg.com/vi/${FEATURED.id}/hq720.jpg`} alt={`${FEATURED.title} — 가장 많이 본 성공인사이드 인터뷰`} loading="lazy" /></div>
          <div className="ivFeatText">
            <small>가장 많이 본 인터뷰 · {FEATURED.cat}</small>
            <h2>{FEATURED.title}</h2>
            <span><Eye size={14} /> {FEATURED.viewsText}회 · {FEATURED_AGE}년 전 촬영, 지금도 재생 중</span>
            <em><Play size={13} fill="currentColor" /> 본편 보기</em>
          </div>
        </a>
        <ul className="ivInd" aria-label="업종별 보기">
          {BY_CAT.slice(0, 6).map(b => (
            <li key={b.cat}><button type="button" onClick={() => pick(b.cat)}>
              <img src={thumb(b.top.id)} alt="" loading="lazy" />
              <span><b>{b.cat}</b><small>{b.n}편 · 최다 {b.top.viewsText}회</small></span>
              <ArrowUpRight size={15} />
            </button></li>
          ))}
        </ul>
      </section>
      <section className="wrap ivWall"><CaseWall items={WALL} /></section>

      <section className="wrap ivSection" id="archive">
        <div className="ivHead"><small>전체 기록</small><h2>인터뷰 아카이브</h2></div>
        <div className="ivCats">{cats.map(c => (
          <button key={c} className={c === cat ? 'active' : ''} onClick={() => setCat(c)}>{c}</button>
        ))}</div>

        <div className="ivGrid">{list.map(v => (
          <a className="ivCard" key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer">
            <div className="ivThumb">
              <img src={thumb(v.id)} alt={`${v.title} — ${v.cat} 인터뷰`} loading="lazy" />
              <span className="ivDur">{v.dur}</span>
              <span className="ivPlay sm"><Play size={15} fill="currentColor" /></span>
            </div>
            <div className="ivCardBody">
              <span className="ivTag">{v.cat}</span>
              <h3>{v.title}</h3>
              {v.notes.length
                ? <p>{v.notes[0]}</p>
                : !!v.tags.length && <p className="ivTags">{v.tags.map(t => `#${t}`).join('  ')}</p>}
              <div className="ivCardFoot">
                <span><Eye size={12} /> {v.viewsText}회</span>
                <span>{ymd(v.date)}</span>
              </div>
            </div>
          </a>
        ))}</div>
      </section>

      <CtaBand
        title={<>여기에 한 편 더{' '}<br />올라갈 자리가 있습니다.</>}
        sub="매출 규모보다 스스로 설명할 수 있는 결정이 있는지를 봅니다. 출연을 신청하시면 검토 후 일주일 안에 회신드립니다."
        href="/apply" label="출연 신청하기"
        secondary={<a className="btnGhost" href={CHANNEL.url} target="_blank" rel="noreferrer">채널 둘러보기</a>}
        facts={[{ k: '검토 회신', v: '보통 일주일' }, { k: '촬영', v: '하루 동행' }, { k: '비용', v: '상담 후 안내' }]}
      />
    </main>
    <SiteFooter />
  </>;
}
