'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Play, Eye, Clock, ArrowUpRight, ChevronRight, ChevronLeft, Youtube, Video, FileText, Search as SearchIcon } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import SubscribeForm from './components/SubscribeForm';
import { interviews, cats, thumb, watchUrl, CHANNEL } from './interviews/data';

const ymd = (d: string) => `${d.slice(0, 4)}.${d.slice(5, 7)}`;

/**
 * 히어로 배경 — 조회수 1위 인터뷰(H모터스) 본편에서 뽑은 1080p 스틸.
 * 자막 띠는 잘라냈다. 촬영 현장 스틸(가로 2000px 이상)을 받으면 파일만 교체하면 된다.
 */
const HERO_BG = '/hero.jpg';

// 인터뷰가 남기는 것 — 제안서의 6가지 가치를 세 갈래로 묶었다.
const DELIVERS = [
  {
    icon: <Video size={18} />, t: '영상',
    d: '한 번의 촬영을 정식 인터뷰 한 편과 숏폼 여러 편으로 나눠 만듭니다.',
    items: ['유튜브 정식 인터뷰', '릴스·쇼츠·틱톡 숏폼'],
  },
  {
    icon: <FileText size={18} />, t: '기사',
    d: '영상을 전사해 검색이 읽을 수 있는 글로 옮깁니다.',
    items: ['인터뷰 아카이브 기사', '검색 최적화 편집'],
  },
  {
    icon: <SearchIcon size={18} />, t: '노출',
    d: '만든 자산을 사람이 찾는 자리마다 올려둡니다.',
    items: ['네이버·구글·AI 검색', 'SNS 멀티채널 확산'],
  },
];

const STEPS = [
  { n: '01', t: '상담과 리서치', d: '목표 메시지를 먼저 정합니다.' },
  { n: '02', t: '인터뷰 촬영', d: '하루를 따라붙어 결정의 이유를 묻습니다.' },
  { n: '03', t: '콘텐츠 제작', d: '영상·숏폼·기사를 한 번에 만듭니다.' },
  { n: '04', t: '발행과 리포트', d: '배포 후 노출 성과를 보고합니다.' },
];

export default function Home() {
  const [category, setCategory] = useState('전체');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => interviews.filter(
      p => (category === '전체' || p.cat === category) && (p.title + p.cat).includes(query),
    ).slice(0, 6),
    [category, query],
  );
  const faces = useMemo(() => [...interviews].sort((a, b) => b.views - a.views).slice(0, 10), []);

  // 순위 열의 스크롤 위치 — 양 끝에서는 페이드와 넘김 버튼을 거둔다
  const rowRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const syncEdge = () => {
    const el = rowRef.current; if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  };
  useEffect(() => { syncEdge(); window.addEventListener('resize', syncEdge); return () => window.removeEventListener('resize', syncEdge); }, []);
  const slide = (dir: 1 | -1) => {
    const el = rowRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return <>
    <SiteHeader active="home" />
    <main>

      {/* ── 히어로: 현장 스틸 한 장 위에 선언 ── */}
      <section className="hero">
        <div className="heroBg" style={{ backgroundImage: `url(${HERO_BG})` }} aria-hidden="true" />
        <div className="wrap heroInner">
          <h1>전국의 사장님을 찾아가{' '}<br />하루를 <em>따라붙고 기록합니다.</em></h1>
          <p>성공한 결과가 아니라 결정의 이유를 남깁니다.{' '}<br />{CHANNEL.since}년부터 {CHANNEL.interviews}명의 하루가 여기 있습니다.</p>
          <div className="heroBtns">
            <Link className="btnPrimary" href="/apply">출연 신청하기 <ArrowUpRight size={18} /></Link>
            <Link className="btnGhost" href="/interviews">인터뷰 둘러보기 <ChevronRight size={17} /></Link>
          </div>
        </div>

        {/* 실적 스트립 — 히어로 발치에 붙여 선언과 근거를 한 화면에 둔다 */}
        <div className="wrap statBand">
          <div><b>{CHANNEL.interviews}</b><span>기록된 인터뷰</span></div>
          <div><b>{CHANNEL.totalViewsText}</b><span>누적 조회수</span></div>
          <div><b>{CHANNEL.subscribers}</b><span>채널 구독자</span></div>
          <div><b>{CHANNEL.totalVideos}</b><span>발행 콘텐츠</span></div>
        </div>
      </section>

      {/* ── 만나온 사장님들: 조회수 순위 열 ── */}
      <section className="band">
        <div className="wrap secHead">
          <div>
            <h2>지금까지 만난 사장님들</h2>
            <p className="secSub">가장 많이 본 기록 열 편입니다.</p>
          </div>
          <div className="rowNav">
            <div>
              <button type="button" onClick={() => slide(-1)} disabled={edge.start} aria-label="이전"><ChevronLeft size={17} /></button>
              <button type="button" onClick={() => slide(1)} disabled={edge.end} aria-label="다음"><ChevronRight size={17} /></button>
            </div>
            <Link className="secMore" href="/interviews">전체 보기 <ChevronRight size={15} /></Link>
          </div>
        </div>
        <div className={'faceRow' + (edge.start ? '' : ' fadeL') + (edge.end ? '' : ' fadeR')} ref={rowRef} onScroll={syncEdge}>
          {faces.map((v, i) => (
            <a className="face" key={v.id} href={watchUrl(v.id)} target="_blank" rel="noreferrer">
              <span className="faceShot"><img src={thumb(v.id)} alt="" loading="lazy" /></span>
              <div className="faceMeta">
                <span className="faceRank">{String(i + 1).padStart(2, '0')}</span>
                <h3>{v.title}</h3>
              </div>
              <small>{v.cat} · 조회 {v.viewsText}회</small>
            </a>
          ))}
        </div>
      </section>

      {/* ── 최근 인터뷰 ── */}
      <section className="wrap sec" id="feed">
        <div className="secHead">
          <div>
            <h2>최근 인터뷰</h2>
            <p className="secSub">{CHANNEL.since}년부터 {CHANNEL.interviews}편을 기록했습니다.</p>
          </div>
          <div className="search">
            <Search size={17} />
            <input placeholder="업종이나 키워드를 검색하세요" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="cats">{cats.map(c => (
          <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}</div>

        <div className="ivGridHome">{filtered.map(p => (
          <a className="ivCard" key={p.id} href={watchUrl(p.id)} target="_blank" rel="noreferrer">
            <div className="ivThumb">
              <img src={thumb(p.id)} alt="" loading="lazy" />
              <span className="ivDur">{p.dur}</span>
              <span className="ivPlay"><Play size={15} fill="currentColor" /></span>
            </div>
            <div className="ivBody">
              <span className="ivTag">{p.cat}</span>
              <h3>{p.title}</h3>
              <div className="ivFoot">
                <span><Eye size={12} /> {p.viewsText}회</span>
                <span><Clock size={12} /> {p.dur}</span>
                <span>{ymd(p.date)}</span>
              </div>
            </div>
          </a>
        ))}{!filtered.length && <div className="empty">검색 결과가 없습니다.</div>}</div>

        <Link className="btnMore" href="/interviews">인터뷰 아카이브 전체 보기 <ChevronRight size={16} /></Link>
      </section>

      {/* ── 서비스: 한 번의 촬영이 무엇으로 남는가 ── */}
      <section className="band">
        <div className="wrap sec">
          <div className="secHead">
            <div>
              <h2>한 번의 촬영이 남기는 것</h2>
              <p className="secSub">촬영으로 끝나지 않습니다. 검색과 AI에 인용되는 자산으로 전환합니다.</p>
            </div>
          </div>
          <div className="valueGrid">
            <div className="ledger">
              <h3>세 갈래로 남깁니다</h3>
              <div>{DELIVERS.map(d => (
              <article key={d.t}>
                <b>{d.icon}{d.t}</b>
                <div>
                  <p>{d.d}</p>
                  <ul>{d.items.map(x => <li key={x}>{x}</li>)}</ul>
                </div>
              </article>
            ))}</div>
            </div>

            <div className="flow">
              <h3>진행은 이렇게 됩니다</h3>
              <ol>{STEPS.map(s => (
                <li key={s.n}><span>{s.n}</span><div><b>{s.t}</b><p>{s.d}</p></div></li>
              ))}</ol>
              <p className="flowNote">검토 회신은 보통 일주일, 촬영은 하루 동행입니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 전환 ── */}
      <section className="wrap sec">
        <div className="closer">
          <div className="closerMain">
            <h2>다음 기록의 주인공이{' '}<br />되어 보시겠어요?</h2>
            <p>모든 인터뷰는 내부 검토 후 진행합니다. 사업 이야기를 남겨주시면 검토 후 회신드립니다.</p>
            <div className="heroBtns">
              <Link className="btnPrimary" href="/apply">출연 신청하기 <ArrowUpRight size={17} /></Link>
              <a className="btnGhost" href={CHANNEL.url} target="_blank" rel="noreferrer"><Youtube size={17} /> 채널 구독하기</a>
            </div>
          </div>
          <div className="closerSub">
            <b>새 기록이 발행되면 알려드립니다</b>
            <p>인터뷰와 칼럼을 메일로 받아보세요.</p>
            <SubscribeForm source="home" label="구독" />
            <dl className="closerFacts">
              <div><dt>검토 회신</dt><dd>보통 일주일</dd></div>
              <div><dt>촬영</dt><dd>하루 동행</dd></div>
            </dl>
          </div>
        </div>
      </section>

    </main>
    <SiteFooter />
  </>;
}
