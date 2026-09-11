'use client';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Play, Eye } from 'lucide-react';
import { watchUrl, type Interview } from '../interviews/data';

/**
 * 사례 벽 — 큰 칸 하나와 작은 칸 여덟.
 * 큰 칸은 몇 초마다 작은 칸 하나와 자리를 바꾼다. 다른 칸은 움직이지 않으므로 화면이 튀지 않고,
 * 바뀌는 두 칸만 녹아든다. 작은 칸에 손을 올리면 그것이 큰 칸으로 온다.
 * 화면에 들어올 때 한 번 계단식으로 나타나고, '동작 줄이기'면 자동 넘김을 하지 않는다.
 */
const hq = (id: string) => `https://i.ytimg.com/vi/${id}/hq720.jpg`;
const mq = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
export const PERIOD = 4800;
const HOVER_DELAY = 180;   // 스쳐 지나가는 마우스에는 반응하지 않는다

/** 두 겹을 겹쳐 두고 앞뒤를 바꾼다 — 새 그림이 다 받아진 뒤에 바꾸므로 깜빡이지 않는다 */
function Cross({ src, alt }: { src: string; alt: string }) {
  const [st, setSt] = useState<{ a: string; b: string; front: 0 | 1 }>({ a: src, b: '', front: 0 });
  const cur = useRef(src);
  useEffect(() => {
    if (src === cur.current) return;
    cur.current = src;
    let done = false;
    const flip = () => {
      if (done) return; done = true;
      setSt(s => (s.front === 0 ? { a: s.a, b: src, front: 1 } : { a: src, b: s.b, front: 0 }));
    };
    const img = new Image();
    img.onload = flip; img.src = src;
    if (img.complete) flip();          // 캐시에 있으면 onload가 오지 않을 수 있다
    return () => { done = true; };
  }, [src]);
  return <>
    <img src={st.a || undefined} alt={st.front === 0 ? alt : ''} className={st.front === 0 ? 'on' : ''} decoding="async" />
    <img src={st.b || undefined} alt={st.front === 1 ? alt : ''} className={st.front === 1 ? 'on' : ''} decoding="async" />
  </>;
}

export default function CaseWall({ items }: { items: Interview[] }) {
  // slots[0]이 큰 칸. 자리를 바꾸는 식이라 나머지 칸은 제자리를 지킨다.
  const [slots, setSlots] = useState(() => items.map(v => v.id));
  const [paused, setPaused] = useState(false);
  const byId = useMemo(() => Object.fromEntries(items.map(v => [v.id, v])), [items]);
  const wrap = useRef<HTMLDivElement>(null);
  const hover = useRef(false);
  const visible = useRef(false);
  const cursor = useRef(0);
  const hoverTimer = useRef(0);

  const swap = (k: number) => setSlots(s => { if (k <= 0 || k >= s.length) return s; const n = [...s]; [n[0], n[k]] = [n[k]!, n[0]!]; return n; });

  // 화면에 들어올 때 한 번 — JS가 살아 있을 때만 숨겼다가 나타낸다
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    el.classList.add('pre');
    const io = new IntersectionObserver(([e]) => {
      visible.current = !!e?.isIntersecting;
      if (e?.isIntersecting) { el.classList.remove('pre'); el.classList.add('in'); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 자동 넘김 — 보이는 동안만, 손을 올리면 멈춘다
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      if (!visible.current || hover.current) return;
      cursor.current = (cursor.current % (items.length - 1)) + 1;
      swap(cursor.current);
    }, PERIOD);
    return () => clearInterval(t);
  }, [items.length]);

  const enterTile = (k: number) => { clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => swap(k), HOVER_DELAY); };
  const leaveTile = () => clearTimeout(hoverTimer.current);

  const big = byId[slots[0]!]!;
  return (
    <div ref={wrap} className="pgWall"
         onMouseEnter={() => { hover.current = true; setPaused(true); }}
         onMouseLeave={() => { hover.current = false; setPaused(false); leaveTile(); }}>
      <a className="pgStage" href={watchUrl(big.id)} target="_blank" rel="noreferrer">
        <span className="pgStageImg">
          <Cross src={hq(big.id)} alt={`${big.title} — ${big.cat} 사례 인터뷰`} />
          <i className="pgStagePlay"><Play size={17} fill="currentColor" /></i>
          <i className={'pgStageBar' + (paused ? ' paused' : '')} key={`bar-${big.id}`} aria-hidden="true" />
        </span>
        <span className="pgStageCap" key={big.id}>
          <small>{big.cat}</small>
          <b>{big.title}</b>
          <em><Eye size={12} /> {big.viewsText}회</em>
        </span>
      </a>
      {slots.slice(1).map((id, i) => {
        const v = byId[id]!;
        return (
          <button type="button" key={i} className="pgTile" style={{ '--i': i } as CSSProperties}
                  onMouseEnter={() => enterTile(i + 1)} onMouseLeave={leaveTile}
                  onClick={() => swap(i + 1)} onFocus={() => swap(i + 1)}
                  aria-label={`${v.title} 크게 보기`}>
            <Cross src={mq(v.id)} alt="" />
          </button>
        );
      })}
    </div>
  );
}
