'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PenLine, Menu, X } from 'lucide-react';
import Logo from './Logo';

const menu = [
  { key: 'home', label: '홈', href: '/' },
  { key: 'interviews', label: '인터뷰', href: '/interviews' },
  { key: 'programs', label: '교육과정', href: '/programs' },
  { key: 'columns', label: '칼럼', href: '/columns' },
  { key: 'about', label: '소개', href: '/about' },
];

export default function SiteHeader({ active }: { active?: string }) {
  const [mobile, setMobile] = useState(false);
  return <header><div className="nav wrap">
    <Link className="brand" href="/" aria-label="성공인사이드 홈"><Logo /></Link>
    <nav className={mobile ? 'open' : ''}>{menu.map(m => <Link key={m.key} href={m.href} className={m.key === active ? 'active' : ''}>{m.label}</Link>)}</nav>
    <div className="actions">
      <Link className="write" href="/apply"><PenLine size={17} /> 출연 신청</Link>
      <button className="mobile" onClick={() => setMobile(!mobile)} aria-label="메뉴">{mobile ? <X /> : <Menu />}</button>
    </div>
  </div></header>;
}
