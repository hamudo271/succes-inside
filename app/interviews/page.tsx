'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Play, ArrowUpRight, Clock, Eye } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CtaBand from '../components/CtaBand';
import { interviews, cats, thumb, watchUrl, CHANNEL } from './data';
import './interviews.css';

const ymd = (d: string) => `${d.slice(2, 4)}.${d.slice(5, 7)}`;

export default function Interviews() {
  const [cat, setCat] = useState('전체');
  const list = useMemo(
    () => interviews.filter(i => cat === '전체' || i.cat === cat),
    [cat],
  );
  const featured = interviews.reduce((a, b) => (b.views > a.views ? b : a));

  return <>
    <SiteHeader active="interviews" />
    <main>
      <section className="ivHero"><div className="wrap">
        <span className="eyebrow">인터뷰 아카이브</span>
        <h1>기록된 사장님들의{' '}<br /><em>{CHANNEL.interviews}가지 성장 서사.</em></h1>
        <p>{CHANNEL.since}년 {CHANNEL.origin}에서 시작해 전국의 사장님을 찾아가 하루를 따라갔습니다.{' '}<br />결과가 아니라 결정의 이유를 남기는 것이 성공인사이드의 일입니다.</p>
        <ul className="ivStats">
          <li><b>{CHANNEL.interviews}</b><span>따라간 하루</span></li>
          <li><b>{CHANNEL.channelViewsText}</b><span>그 하루가 재생된 횟수</span></li>
          <li><b>{CHANNEL.subscribers}</b><span>구독자</span></li>
          <li><b>{CHANNEL.totalVideos}</b><span>만들어진 콘텐츠</span></li>
        </ul>
      </div></section>

      <section className="wrap"><a className="ivFeature" href={watchUrl(featured.id)} target="_blank" rel="noreferrer">
        <div className="ivFeatureThumb">
          <img src={thumb(featured.id)} alt={`${featured.title} — 가장 많이 본 성공인사이드 인터뷰`} loading="lazy" />
          <span className="ivPlay pulse"><Play size={20} fill="currentColor" /></span>
        </div>
        <div className="ivFeatureBody">
          <span className="ivBadge">가장 많이 본 인터뷰</span>
          <h2>{featured.title}</h2>
          <p>{new Date().getFullYear() - Number(featured.date.slice(0, 4))}년 전에 찍은 하루입니다. 지금도 재생되고 있고, {featured.viewsText} 번째까지 왔습니다.</p>
          <div className="ivMeta">
            <span>{featured.cat}</span>
            <span><Eye size={13} /> {featured.viewsText}회</span>
            <span><Clock size={13} /> {featured.dur}</span>
            <span>{featured.date.replace(/-/g, '.')}</span>
          </div>
          <span className="ivWatch">유튜브에서 보기 <ArrowUpRight size={15} /></span>
        </div>
      </a></section>

      <section className="wrap ivSection">
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
        sub="매출 규모보다 스스로 설명할 수 있는 결정이 있는지를 봅니다. 사업 이야기를 남겨주시면 내부 검토 후 회신드립니다."
        href="/apply" label="출연 신청하기"
        secondary={<a className="btnGhost" href={CHANNEL.url} target="_blank" rel="noreferrer">채널 둘러보기</a>}
        facts={[{ k: '검토 회신', v: '보통 일주일' }, { k: '촬영', v: '하루 동행' }, { k: '비용', v: '상담 후 안내' }]}
      />
    </main>
    <SiteFooter />
  </>;
}
