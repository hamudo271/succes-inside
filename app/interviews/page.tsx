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
        <p>{CHANNEL.since}년부터 전국의 사업가를 찾아가 하루를 따라붙고 물었습니다.{' '}<br />결과가 아니라 결정의 이유를 남기는 것이 성공인사이드의 일입니다.</p>
        <ul className="ivStats">
          <li><b>{CHANNEL.interviews}</b><span>기록된 인터뷰</span></li>
          <li><b>{CHANNEL.totalViewsText}</b><span>누적 조회수</span></li>
          <li><b>{CHANNEL.subscribers}</b><span>채널 구독자</span></li>
          <li><b>{CHANNEL.totalVideos}</b><span>발행 콘텐츠</span></li>
        </ul>
      </div></section>

      <section className="wrap"><a className="ivFeature" href={watchUrl(featured.id)} target="_blank" rel="noreferrer">
        <div className="ivFeatureThumb">
          <img src={thumb(featured.id)} alt="" loading="lazy" />
          <span className="ivPlay pulse"><Play size={20} fill="currentColor" /></span>
        </div>
        <div className="ivFeatureBody">
          <span className="ivBadge">가장 많이 본 인터뷰</span>
          <h2>{featured.title}</h2>
          <p>한 편의 인터뷰가 {featured.viewsText}회 재생되며 이 사업장을 알렸습니다. 광고를 멈춘 뒤에도 검색과 추천으로 계속 도달하는, 축적되는 자산의 사례입니다.</p>
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
              <img src={thumb(v.id)} alt="" loading="lazy" />
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
        title={<>다음 기록의 주인공이{' '}<br />되어 보시겠어요?</>}
        sub="모든 인터뷰는 내부 검토 후 진행합니다. 사업 이야기를 남겨주시면 검토 후 회신드립니다."
        href="/apply" label="출연 신청하기"
        secondary={<a className="btnGhost" href={CHANNEL.url} target="_blank" rel="noreferrer">채널 둘러보기</a>}
        facts={[{ k: '검토 회신', v: '보통 일주일' }, { k: '촬영', v: '하루 동행' }, { k: '비용', v: '상담 후 안내' }]}
      />
    </main>
    <SiteFooter />
  </>;
}
