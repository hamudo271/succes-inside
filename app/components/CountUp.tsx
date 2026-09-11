'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * 숫자가 0에서 제 값까지 굴러 올라간다. 화면에 들어올 때 한 번만.
 *
 * 표기 형태가 제각각이라(`9편`, `주 1편`, `4~6주`, `1.42만`) 화면에 쓰던 문자열을
 * 그대로 받아 앞말·숫자·범위·뒷말로 갈라 읽는다. 숫자만 굴리고 나머지는 그대로 둔다.
 *
 * 서버에서는 최종 숫자를 그린다 — JS가 없거나 늦어도 숫자는 보이고, 검색엔진도 읽는다.
 * '동작 줄이기'를 켠 사용자에게는 굴리지 않는다.
 */
type Parsed = { prefix: string; nums: number[]; sep: string; suffix: string; decimals: number };

function parse(text: string): Parsed | null {
  const m = /^(\D*?)(\d[\d.,]*)(?:\s*([~\-–])\s*(\d[\d.,]*))?(.*)$/.exec(text.trim());
  if (!m) return null;
  const [, prefix, a, sep, b, suffix] = m;
  const num = (s: string) => Number(s.replace(/,/g, ''));
  const dec = (s: string) => (s.split('.')[1] ?? '').length;
  return {
    prefix, sep: sep ?? '', suffix,
    nums: b ? [num(a), num(b)] : [num(a)],
    decimals: Math.max(dec(a), b ? dec(b) : 0),
  };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * 굴려도 되는 때인가. 서버가 그린 최종 숫자를 이미 한참 본 뒤라면(느린 회선에서 JS가 늦게 오면)
 * 0으로 되감는 게 더 어색하다 — 그때는 그냥 둔다. 빠른 회선에서는 최종값이 보이는 시간이
 * 50ms 남짓이라 되감김이 눈에 띄지 않는다.
 */
function shouldAnimate(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return performance.now() < 2500;
}

export default function CountUp({ text, duration = 1200, delay = 0 }: {
  text: string; duration?: number; delay?: number;
}) {
  const p = parse(text);
  const [nums, setNums] = useState<number[] | null>(null);   // null이면 서버가 그린 그대로
  const ref = useRef<HTMLSpanElement>(null);
  const target = useRef(p?.nums ?? []);
  target.current = p?.nums ?? [];

  // 그리기 전에 0으로 되돌린다 — 최종값이 한 번 번쩍이지 않게
  useLayoutEffect(() => {
    if (!p || !shouldAnimate()) return;
    setNums(target.current.map(() => 0));
     
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !p || !shouldAnimate()) return;

    let raf = 0, timer = 0, started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        // rAF가 주는 시각은 t0보다 이를 수 있다 — 클램프하지 않으면 -0이 한 프레임 스친다
        const k = easeOut(Math.min(1, Math.max(0, (now - t0) / duration)));
        setNums(target.current.map(v => v * k));
        if (k < 1) raf = requestAnimationFrame(tick);
        else setNums(target.current);        // 마지막은 정확한 값으로 맞춘다
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting || started) return;
      started = true; io.disconnect();
      timer = window.setTimeout(run, delay);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); };
     
  }, []);

  if (!p) return <>{text}</>;

  const shown = nums ?? p.nums;
  const fmt = (n: number) => n.toLocaleString('ko-KR', {
    minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals,
  });
  return (
    <span ref={ref}>
      {p.prefix}{shown.map(fmt).join(p.sep)}
      {p.suffix && <span className="cuUnit">{p.suffix}</span>}
    </span>
  );
}
