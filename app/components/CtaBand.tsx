import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { interviews, CHANNEL } from '../interviews/data';

/**
 * 출연·문의 전환 밴드. 근거는 썸네일 셋에 '+43'을 붙인 아바타 더미가 아니라,
 * 46편의 기록 자체다 — 날짜·제목·조회수를 최신순으로 천천히 흘려 보낸다.
 * 목록을 두 번 이어 붙이고 절반만큼 올리면 끊김 없이 돈다.
 */
const ROLL = [...interviews].sort((a, b) => b.date.localeCompare(a.date));
const ym = (d: string) => `${d.slice(2, 4)}.${d.slice(5, 7)}`;

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
          <Link className="btnPrimary ctaMain pulseBtn" href={href}>{label} <ArrowUpRight size={18} /></Link>
          {secondary}
        </div>
        <dl className="ctaFacts">{facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>
      </div>
      <div className="ctaProof" aria-hidden="true">
        <div className="ctaRoll">
          <ul className="ctaRollTrack">
            {[...ROLL, ...ROLL].map((v, i) => (
              <li key={i}><span>{ym(v.date)}</span><b>{v.title}</b><em>{v.viewsText}</em></li>
            ))}
          </ul>
        </div>
        <small>{CHANNEL.since}년부터 {CHANNEL.interviews}명의 사장님이 먼저 기록을 남겼습니다</small>
      </div>
    </div></section>
  );
}
