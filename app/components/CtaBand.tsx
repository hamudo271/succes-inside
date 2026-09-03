import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { interviews, CHANNEL } from '../interviews/data';

/** 출연·문의 전환 밴드 — 먼저 기록을 남긴 사장님들의 실제 스틸이 근거가 된다 */
const STILLS = [...interviews].sort((a, b) => b.views - a.views).slice(0, 5);

export default function CtaBand({ title, sub, href, label, secondary, facts }: {
  title: ReactNode; sub: string; href: string; label: string;
  secondary?: ReactNode; facts: { v: string; k: string }[];
}) {
  return (
    <section className="ctaBand"><div className="wrap ctaInner">
      <div className="ctaText">
        <h2>{title}</h2>
        <p>{sub}</p>
        <div className="ctaBtns">
          <Link className="btnPrimary ctaMain" href={href}>{label} <ArrowUpRight size={18} /></Link>
          {secondary}
        </div>
        <dl className="ctaFacts">{facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      </div>
      <div className="ctaProof" aria-hidden="true">
        <div className="ctaStack">
          {STILLS.map(v => <img key={v.id} src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" />)}
          <span>+{CHANNEL.interviews - STILLS.length}</span>
        </div>
        <small>{CHANNEL.interviews}명의 사장님이 먼저 기록을 남겼습니다</small>
      </div>
    </div></section>
  );
}
