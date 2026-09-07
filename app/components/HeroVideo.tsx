'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * 히어로 배경 — 인터뷰 현장 클립 몇 개를 페이드로 이어 붙인 짧은 루프.
 * 파일(public/hero.mp4·hero.webm)에 전환과 색보정이 이미 구워져 있어서 JS는 재생만 한다.
 *
 * 영상을 내려받지 않는 경우: 좁은 화면(768px 미만), '동작 줄이기' 설정, 데이터 절약 모드.
 * 그때는 스틸(poster)만 보인다 — 스틸이 먼저 깔리고 영상은 준비되면 그 위로 스며든다.
 */
export default function HeroVideo({ poster }: { poster: string }) {
  const [wanted, setWanted] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;
    const mq = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const update = () => setWanted(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;                       // React가 muted 속성을 늦게 다는 경우를 대비
    v.play().catch(() => { /* 자동재생이 막히면 스틸만 남는다 */ });
  }, [wanted]);

  return <>
    <div className="heroBg" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
    {wanted && (
      <video
        ref={ref} className="heroVideo" aria-hidden="true"
        autoPlay muted loop playsInline preload="auto" poster={poster}
        onPlaying={e => e.currentTarget.classList.add('on')}
      >
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </video>
    )}
  </>;
}
