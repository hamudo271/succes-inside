'use client';
import { useMemo, useState } from 'react';
import { Search, Play, Eye, Clock, ArrowUpRight, ChevronRight, TrendingUp, Youtube } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Link from 'next/link';
import SubscribeForm from './components/SubscribeForm';
import { interviews, cats, thumb, watchUrl, CHANNEL } from './interviews/data';

const ymd = (d: string) => `${d.slice(0, 4)}.${d.slice(5, 7)}`;

export default function Home() {
  const [category, setCategory] = useState('전체');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => interviews.filter(
      p => (category === '전체' || p.cat === category) && (p.title + p.cat).includes(query),
    ).slice(0, 8),
    [category, query],
  );
  const popular = useMemo(() => [...interviews].sort((a, b) => b.views - a.views).slice(0, 4), []);
  const latest = interviews[0];

  return <>
    <SiteHeader active="home" />
    <main>
      <section className="hero"><div className="wrap heroInner">
        <div>
          <span className="eyebrow">먼저 가본 사람들의 진짜 이야기</span>
          <h1>성공은 혼자보다{' '}<br /><em>함께일 때 빨라집니다.</em></h1>
          <p>전국의 사업가를 찾아가 하루를 따라붙고 기록합니다.{' '}<br />결과가 아니라 결정의 이유를 남기는 인터뷰 미디어.</p>
          <div className="heroBtns">
            <Link href="/apply">출연 신청하기 <ArrowUpRight size={18} /></Link>
            <a href="#feed">인터뷰 둘러보기 <ChevronRight size={18} /></a>
          </div>
        </div>
        <div className="heroCard">
          <p>“{latest.title.length > 34 ? latest.title.slice(0, 34) + '…' : latest.title}”</p>
          <div className="miniStats">
            <span><b>{CHANNEL.interviews}</b> 기록된 인터뷰</span>
            <span><b>{CHANNEL.totalViewsText}</b> 누적 조회수</span>
          </div>
        </div>
      </div></section>

      <section className="trend wrap">
        <span><TrendingUp size={17} /> 많이 찾는 주제</span>
        <div>{cats.slice(1, 4).map(c => <a key={c} onClick={() => setCategory(c)}># {c}</a>)}</div>
        <span className="today">구독자 {CHANNEL.subscribers}명</span>
      </section>

      <div className="content wrap" id="feed">
        <section className="feed">
          <div className="sectionHead">
            <div><small>{CHANNEL.since}년부터 기록</small><h2>최근 인터뷰</h2></div>
            <div className="search">
              <Search size={18} />
              <input placeholder="업종이나 키워드를 검색하세요" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="cats">{cats.map(c => (
            <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
          ))}</div>

          <div className="postList">{filtered.map(p => (
            <a className="ivRow" key={p.id} href={watchUrl(p.id)} target="_blank" rel="noreferrer">
              <div className="postBody">
                <span className="tag">{p.cat}</span>
                <h3>{p.title}</h3>
                {p.notes.length
                  ? <p>{p.notes[0]}</p>
                  : !!p.tags.length && <p className="feedTags">{p.tags.map(t => `#${t}`).join('  ')}</p>}
                <div className="metrics">
                  <span><Eye size={15} /> {p.viewsText}회</span>
                  <span><Clock size={15} /> {p.dur}</span>
                  <span>{ymd(p.date)}</span>
                  <span className="watch">유튜브에서 보기 <ArrowUpRight size={14} /></span>
                </div>
              </div>
              <div className="thumb">
                <img src={thumb(p.id)} alt="" loading="lazy" />
                <span className="playDot"><Play size={14} fill="currentColor" /></span>
              </div>
            </a>
          ))}{!filtered.length && <div className="empty">검색 결과가 없습니다.</div>}</div>

          <a className="more" href="/interviews">인터뷰 아카이브 전체 보기 <ChevronRight size={17} /></a>
        </section>

        <aside>
          <div className="sideCard ranking">
            <div className="sideTitle"><h3>가장 많이 본 인터뷰</h3><span>누적</span></div>
            {popular.map((p, i) => (
              <a key={p.id} href={watchUrl(p.id)} target="_blank" rel="noreferrer">
                <strong>0{i + 1}</strong>
                <div><b>{p.title}</b><small>{p.cat} · 조회 {p.viewsText}회</small></div>
              </a>
            ))}
          </div>

          <div className="sideCard channelCard">
            <div className="sideTitle"><h3>성공인사이드 채널</h3></div>
            <p>사업가 인터뷰와 숏폼을 매주 발행합니다. 지금까지 {CHANNEL.totalVideos}개의 콘텐츠를 쌓았습니다.</p>
            <a href={CHANNEL.url} target="_blank" rel="noreferrer"><Youtube size={16} /> 채널 구독하기</a>
          </div>

          <div className="newsletter">
            <span>뉴스레터</span>
            <h3>새 인터뷰와 칼럼을{' '}<br />메일로 받아보세요.</h3>
            <p>새 기록이 발행될 때마다 보내드립니다.</p>
            <SubscribeForm source="home" label="구독" />
          </div>
          <div className="sideCard applyCard">
            <div className="sideTitle"><h3>출연 신청</h3></div>
            <p>다음 기록의 주인공이 되어 보시겠어요? 모든 인터뷰는 내부 검토 후 진행합니다.</p>
            <Link className="applyBtn" href="/apply">신청서 작성하기 <ArrowUpRight size={15} /></Link>
          </div>
        </aside>
      </div>
    </main>
    <SiteFooter />
  </>;
}
