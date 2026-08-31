'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, PenLine, Menu, X } from 'lucide-react';
import Logo from './Logo';

const menu = [
  { key: 'insight', label: '인사이트', href: '/' },
  { key: 'programs', label: '교육과정', href: '/programs' },
  { key: 'columns', label: '칼럼', href: '/columns' },
  { key: 'about', label: '소개', href: '/about' },
];

export default function SiteHeader({ active, onWrite }: { active?: string; onWrite?: () => void }) {
  const [mobile, setMobile] = useState(false);
  return <header><div className="nav wrap">
    <Link className="brand" href="/" aria-label="성공인사이드 홈"><Logo /></Link>
    <nav className={mobile ? 'open' : ''}>{menu.map(m => <Link key={m.key} href={m.href} className={m.key === active ? 'active' : ''}>{m.label}</Link>)}</nav>
    <div className="actions">
      <button className="icon" aria-label="검색"><Search size={20} /></button>
      <button className="icon bell" aria-label="알림"><Bell size={20} /><b /></button>
      <button className="login">로그인</button>
      {onWrite
        ? <button className="write" onClick={onWrite}><PenLine size={17} /> 글쓰기</button>
        : <Link className="write" href="/"><PenLine size={17} /> 글쓰기</Link>}
      <button className="mobile" onClick={() => setMobile(!mobile)} aria-label="메뉴">{mobile ? <X /> : <Menu />}</button>
    </div>
  </div></header>;
}
