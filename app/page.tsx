'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Play, Eye, Clock, ArrowUpRight, ChevronRight, ChevronLeft, Youtube } from 'lucide-react';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import CtaBand from './components/CtaBand';
import CourseCards, { COURSE_CARDS } from './components/CourseCards';
import HeroVideo from './components/HeroVideo';
import CountUp from './components/CountUp';
import { interviews, cats, thumb, watchUrl, CHANNEL } from './interviews/data';

const ymd = (d: string) => `${d.slice(0, 4)}.${d.slice(5, 7)}`;

/**
 * 히어로 배경 — 영상이 뜨기 전(그리고 모바일·동작 줄이기에서는 계속) 보이는 스틸.
 * 조회수 1위 인터뷰(H모터스) 본편에서 뽑은 1080p 프레임. 영상 루프는 components/HeroVideo.tsx,
 * 클립 목록과 인코딩 절차는 scripts/hero-video.sh 에 있다.
 */
const HERO_BG = '/hero.jpg';

/** 조회수 1위 인터뷰 — 쇼케이스에서 '한 번의 촬영'의 실물 예시로 쓴다 */
const TOP = [...interviews].sort((a, b) => b.views - a.views)[0]!;

// 인터뷰가 남기는 것 — 만나는 사람이 다른 세 그릇. 도달의 대부분이 숏폼에서 나오므로 숏폼이 먼저다.
const DELIVERS = [
  { t: '숏폼', d: '릴스·쇼츠·틱톡. 처음 보는 사람이 여기서 만납니다.' },
  { t: '본편', d: '유튜브 정식 인터뷰. 깊이 볼 사람이 끝까지 봅니다.' },
  { t: '기사', d: '홈페이지 아카이브. 검색한 사람이 찾아옵니다.' },
];
/** 같은 인터뷰의 두 숫자 — 본편과 숏폼이 만나는 사람이 다르다는 걸 숫자가 대신 말한다 */
const SPLIT = interviews.find(v => v.id === 'wtHwI3pCcu8')!;
/** 히어로가 여는 사례 — 광주 카센터(H모터스). 조회수 1위라서가 아니라 '동네 가게 한 곳'이라는 그림 때문에 고른다. */
const HERO_CASE = interviews.find(v => v.id === 'i66hU39qSV4')!;

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

      {/* ── 히어로: 현장 클립 루프(폴백은 스틸) 위에 선언 ── */}
      <section className="hero">
        <HeroVideo poster={HERO_BG} />
        <div className="wrap heroInner">
          <h1>광주 카센터 사장님의 하루를{' '}<br /><em>{HERO_CASE.viewsText} 명이 봤습니다.</em></h1>
          <p>성공인사이드는 사장님을 찾아가 하루를 찍고, 왜 그렇게 결정했는지 묻습니다.{' '}<br />{CHANNEL.since}년부터 {CHANNEL.interviews}명의 사장님이 출연했습니다.</p>
          <div className="heroBtns">
            <Link className="btnPrimary pulseBtn" href="/apply">출연 신청하기 <ArrowUpRight size={18} /></Link>
            <Link className="btnGhost" href="/interviews">인터뷰 둘러보기 <ChevronRight size={17} /></Link>
          </div>
        </div>

        {/* 실적 스트립 — 히어로 발치에 붙여 선언과 근거를 한 화면에 둔다 */}
        <div className="wrap statBand">
          <div><b><CountUp text={`${CHANNEL.interviews}`} /></b><span>인터뷰</span></div>
          <div><b><CountUp text={CHANNEL.channelViewsText} delay={90} /></b><span>총 조회수 · 숏폼 포함</span></div>
          <div><b><CountUp text={CHANNEL.subscribers} delay={180} /></b><span>구독자</span></div>
          <div><b><CountUp text={`${CHANNEL.totalVideos}`} delay={270} /></b><span>발행 콘텐츠</span></div>
          <small className="statAsOf">{CHANNEL.asOf} 기준 · 채널 정보란 공개 수치</small>
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
              <span className="faceShot"><img src={thumb(v.id)} alt={`${v.title} — 성공인사이드 인터뷰`} loading="lazy" /></span>
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
            <input placeholder="업종이나 사장님으로 찾아보세요" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="cats">{cats.map(c => (
          <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}</div>

        <div className="ivGridHome">{filtered.map(p => (
          <a className="ivCard" key={p.id} href={watchUrl(p.id)} target="_blank" rel="noreferrer">
            <div className="ivThumb">
              <img src={thumb(p.id)} alt={`${p.title} — ${p.cat} 인터뷰`} loading="lazy" />
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

      {/* ── 실험: 인물 카드 (eopla 식) ── */}
      <CourseCards
        items={COURSE_CARDS.slice(0, 4)}
        eyebrow="교육 과정"
        title={<>사장님들이 실제로 내린{' '}<br />결정으로 배웁니다</>}
        more={{ href: '/programs', label: '과정 전체 보기' }}
      />

      {/* ── 서비스: 한 번의 촬영이 무엇으로 남는가 — 실물로 보여준다 ── */}
      <section className="band">
        <div className="wrap sec showcase">
          <div className="showText">
            {/* 긴장은 헤드라인에 — 하루 들여서 40만. 설명은 그 다음. */}
            <h2>촬영은 하루,{' '}<br />조회수는 {CHANNEL.topShortViewsText}.</h2>
            <p>성형외과 원장님 편입니다. 본편은 {SPLIT.viewsText}회, 거기서 자른 숏폼 한 편이 {CHANNEL.topShortViewsText} 회.{' '}<br />같은 하루를 본편·숏폼·기사로 나눠 내보내면 보는 사람이 달라집니다.</p>
            <ul className="showList">{DELIVERS.map(d => (
              <li key={d.t}><b>{d.t}</b><span>{d.d}</span></li>
            ))}</ul>
            <Link className="btnGhost" href="/apply">출연 신청하기 <ArrowUpRight size={17} /></Link>
          </div>

          {/* 산출물 실물 — 조회수 1위 인터뷰 한 편이 실제로 남긴 것들 */}
          {/* 같은 하루의 세 모습 — 가짜 UI 틀 없이 실제 스틸과 실제 제목만 */}
          <div className="showStack" ref={stackRef} aria-hidden="true">
            <figure className="skVideo">
              <img src={`https://i.ytimg.com/vi/${TOP.id}/hq720.jpg`} alt="" loading="lazy" />
              <figcaption><small>본편 · 유튜브</small><b>{TOP.dur} · 조회수 {TOP.viewsText}회</b></figcaption>
            </figure>
            <figure className="skShort">
              <img src="/short.jpg" alt="" loading="lazy" />
              <figcaption><small>숏폼</small><b>릴스·쇼츠·틱톡</b></figcaption>
            </figure>
            <figure className="skArticle">
              <small>기사 · 검색</small>
              <b>{TOP.title}</b>
              <span>successinside.kr › interviews</span>
              <em>{TOP.tags.slice(0, 3).map(t => `#${t}`).join('  ')}</em>
            </figure>
          </div>
        </div>
      </section>

      <CtaBand
        title={<>{CHANNEL.interviews}명이 출연했습니다.{' '}<br />다음은 사장님입니다.</>}
        sub="출연을 신청하면 일주일 안에 회신드립니다. 매출보다 스스로 설명할 수 있는 결정이 있는지를 봅니다."
        href="/apply" label="출연 신청하기"
        secondary={<a className="btnGhost" href={CHANNEL.url} target="_blank" rel="noreferrer"><Youtube size={17} /> 채널 구독하기</a>}
        facts={[{ k: '검토 회신', v: '보통 일주일' }, { k: '촬영', v: '하루 동행' }, { k: '비용', v: '상담 후 안내' }]}
      />
    </main>
    <SiteFooter />
  </>;
}
