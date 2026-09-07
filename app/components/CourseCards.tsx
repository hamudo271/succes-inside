import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * 실험 중 — eopla.net/eoschool 식 인물 카드.
 * 누끼 인물은 그 과정의 '사례 인터뷰' 주인공이다(강사가 아니다). 캡션에 업종을 적어 그 관계를 밝힌다.
 * 원본 누끼: 프로필 이미지 생성/ → public/faces/*.webp (알파 유지, 560px 높이, WebP)
 */
export type CourseCard = {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  face: string;      // public/faces/<face>.webp
  caseCat: string;   // 사례 인터뷰의 업종
  href: string;
  accent?: boolean;  // 한 장만 주황으로 — 나머지는 흑연색
};

export default function CourseCards({ items, eyebrow, title, more }: {
  items: CourseCard[];
  eyebrow: string;
  title: React.ReactNode;
  more?: { href: string; label: string };
}) {
  return (
    <section className="wrap sec ccSec">
      <div className="secHead">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        {more && <Link className="secMore" href={more.href}>{more.label} <ChevronRight size={15} /></Link>}
      </div>

      <div className="ccGrid">
        {items.map(c => (
          <Link key={c.id} href={c.href} className={c.accent ? 'ccCard accent' : 'ccCard'}>
            <div className="ccTop">
              <h3>{c.title}</h3>
              {c.badge && <span className="ccBadge">{c.badge}</span>}
            </div>
            <p className="ccDesc">{c.desc}</p>
            <small className="ccCase">{c.caseCat} 사례 인터뷰</small>

            <img className="ccFace" src={`/faces/${c.face}.webp`} alt="" loading="lazy" decoding="async" />

            <span className="ccMore">자세히 보기 <ChevronRight size={15} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
