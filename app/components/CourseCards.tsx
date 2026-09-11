import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * 실험 중 — eopla.net/eoschool 식 인물 카드.
 * 누끼 인물은 그 과정의 '사례 인터뷰' 주인공이지 강사가 아니다. 카드마다 업종을 적어 그 관계를 밝힌다.
 * 누끼 원본은 저장소 밖(프로필 이미지 생성/), 배포본만 public/faces/*.webp (알파 유지, 560px, WebP).
 */
export type CourseCard = {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  face: string;      // public/faces/<face>.webp
  caseCat: string;   // 사례 인터뷰의 업종
  accent?: boolean;  // 한 장만 주황 — 나머지는 흑연색
};

const ask = (title: string) => `/apply?type=교육 과정 문의&course=${encodeURIComponent(title)}`;

/** 앞의 4장은 정기 과정, 뒤의 5장은 VOD 과정 — 아래 목록에 실제로 있는 과정들이다. */
export const COURSE_CARDS: CourseCard[] = [
  { id: 'first-100', title: '첫 고객 100명 만들기', badge: '모집중', accent: true,
    desc: '고객 문제를 정의하고 가설을 세워, 노코드로 MVP를 만들어 4주 안에 검증까지 마치는 과정',
    face: 'sushi', caseCat: '요식업' },
  { id: 'deck', title: '사업계획서 완성 워크숍', badge: '모집중',
    desc: '아이디어를 투자자와 팀이 같은 그림으로 읽는 문서로. 매주 본인 사업으로 한 장씩 완성',
    face: 'cpa', caseCat: '전문직' },
  { id: 'cx', title: '재구매를 만드는 CX 설계', badge: '다음 기수 대기',
    desc: '첫 구매를 늘리는 대신 두 번째 구매를 설계합니다. 이탈 지점을 찾아 고객 경험을 다시 짜는 과정',
    face: 'barber', caseCat: '뷰티·의료' },
  { id: 'solo', title: '1인 기업 생존 부트캠프', badge: '모집중',
    desc: '막연한 자신감 대신 현금흐름과 고객 파이프라인을 숫자로 관리하는 습관을 만드는 과정',
    face: 'interior', caseCat: '시공·인테리어' },
  { id: 'ai', title: 'AI 업무 자동화 설계', badge: 'VOD',
    desc: '도구를 고르기 전에 업무 흐름을 먼저 정리합니다. 실패한 자동화 사례까지 함께 다루는 과정',
    face: 'detail', caseCat: '온라인·N잡' },
  { id: 'growth', title: '광고비 0원 그로스 마케팅', badge: 'VOD',
    desc: '채널을 늘리기 전에, 고객이 이미 모여 있는 한 곳을 깊게 파는 방법을 다루는 과정',
    face: 'cafe', caseCat: '요식업' },
  { id: 'brand', title: '가격 경쟁에서 벗어나는 브랜딩', badge: 'VOD',
    desc: '예쁜 로고보다 먼저, 고객이 우리를 기억할 한 문장을 만드는 순서를 다루는 과정',
    face: 'motors', caseCat: '자동차' },
  { id: 'finance', title: '창업가의 재무 기준 세우기', badge: 'VOD',
    desc: '투자자가 사업을 볼 때 쓰는 기준을 그대로 가져와, 스스로 의사결정 기준을 세우는 과정',
    face: 'repair', caseCat: '시공·인테리어' },
  { id: 'writing', title: '읽히는 글을 쓰는 법', badge: 'VOD',
    desc: '경험을 남에게 전달되는 글로 바꿉니다. 인사이트를 쓰려는 분들을 위한 과정',
    face: 'youtuber', caseCat: '온라인·N잡' },
];

export default function CourseCards({ items, eyebrow, title, more, cols = 4 }: {
  items: CourseCard[];
  eyebrow: string;
  title: React.ReactNode;
  more?: { href: string; label: string };
  cols?: 3 | 4;
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

      <div className={cols === 3 ? 'ccGrid cols3' : 'ccGrid'}>
        {items.map(c => (
          <Link key={c.id} href={ask(c.title)} className={c.accent ? 'ccCard accent' : 'ccCard'}>
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
