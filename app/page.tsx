'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Play, Eye, Clock, ArrowUpRight, ChevronRight, ChevronLeft, Youtube } from 'lucide-react';
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

/** 조회수 1위 인터뷰 — 쇼케이스에서 '한 번의 촬영'의 실물 예시로 쓴다 */
const TOP = [...interviews].sort((a, b) => b.views - a.views)[0]!;

// 인터뷰가 남기는 것 — 제안서의 6가지 가치를 세 갈래로 묶었다.
const DELIVERS = [
  { t: '영상', d: '유튜브 정식 인터뷰 한 편과 릴스·쇼츠·틱톡 숏폼 여러 편' },
  { t: '기사', d: '영상을 전사해 검색이 읽을 수 있는 아카이브 기사로' },
  { t: '노출', d: '네이버·구글·AI 검색과 SNS 멀티채널로 확산' },
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
  // 산출물 스택 등장 — 뷰포트에 들어올 때 한 번
  const stackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stackRef.current; if (!el) return;
    // JS가 살아 있을 때만 숨겼다가 등장시킨다 — 없으면 처음부터 보인다
    el.classList.add('pre');
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { el.classList.remove('pre'); el.classList.add('in'); io.disconnect(); }
    }, { threshold: .25 });
    io.observe(el); return () => io.disconnect();
  }, []);
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

      {/* ── 서비스: 한 번의 촬영이 무엇으로 남는가 — 실물로 보여준다 ── */}
      <section className="band">
        <div className="wrap sec showcase">
          <div className="showText">
            <h2>한 번의 촬영이{' '}<br />남기는 것</h2>
            <p>촬영으로 끝나지 않습니다.{' '}<br />검색과 AI에 인용되는 자산으로 전환합니다.</p>
            <ul className="showList">{DELIVERS.map(d => (
              <li key={d.t}><b>{d.t}</b><span>{d.d}</span></li>
            ))}</ul>
            <Link className="btnGhost" href="/apply">출연 신청하기 <ArrowUpRight size={17} /></Link>
          </div>

          {/* 산출물 실물 — 조회수 1위 인터뷰 한 편이 실제로 남긴 것들 */}
          <div className="showStack" ref={stackRef} aria-hidden="true">
            <figure className="skVideo">
              <span className="skThumb">
                <img src={`https://i.ytimg.com/vi/${TOP.id}/hq720.jpg`} alt="" loading="lazy" />
                <span className="skDur">{TOP.dur}</span>
              </span>
              <figcaption>
                <b>{TOP.title}</b>
                <span><Youtube size={12} /> 성공인사이드 · 조회수 {TOP.viewsText}회 · {TOP.date.slice(0, 4)}</span>
              </figcaption>
            </figure>
            <figure className="skShort">
              <img src="/short.jpg" alt="" loading="lazy" />
              <figcaption>Shorts</figcaption>
            </figure>
            <div className="skArticle">
              <small>인터뷰 아카이브 기사</small>
              <b>{TOP.title}</b>
              <span>{TOP.tags.slice(0, 3).map(t => `#${t}`).join('  ')}</span>
            </div>
            <div className="skSearch">
              <Search size={14} />
              <div>
                <small>successinside.kr › interviews</small>
                <b>{TOP.title} — 성공인사이드</b>
              </div>
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
