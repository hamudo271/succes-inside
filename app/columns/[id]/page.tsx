'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { columns } from '../data';
import '../columns.css';

export default function ColumnDetail() {
  const { id } = useParams<{ id: string }>();
  const post = columns.find(c => c.id === id);

  if (!post) return <>
    <SiteHeader active="columns" />
    <main><div className="wrap clNotFound">
      <h1>칼럼을 찾을 수 없습니다.</h1>
      <p>주소가 바뀌었거나 삭제된 칼럼일 수 있습니다.</p>
      <Link href="/columns">칼럼 목록으로 <ChevronRight size={15} /></Link>
    </div></main>
    <SiteFooter />
  </>;

  const related = [
    ...columns.filter(c => c.id !== post.id && c.cat === post.cat),
    ...columns.filter(c => c.id !== post.id && c.cat !== post.cat),
  ].slice(0, 2);

  return <>
    <SiteHeader active="columns" />
    <main>
      <article>
        <div className="wrap clArtHero">
          <Link className="clBack" href="/columns"><ArrowLeft size={15} /> 칼럼 목록</Link>
          <span className="clTag">{post.cat}</span>
          <h1>{post.title}</h1>
          <p className="clLead">{post.excerpt}</p>
          <div className="clArtMeta">
            <div className="clAuthor">
              <span className="clAvatar" style={{ background: post.color }}>{post.init}</span>
              <div><b>{post.author}</b><small>{post.role}</small></div>
            </div>
            <small className="clMeta">{post.date} · <Clock size={11} /> {post.read}</small>
          </div>
        </div>

        <div className="wrap"><div className="clArt">
          {post.intro.map(p => <p key={p}>{p}</p>)}
          <div className="clPull"><i>“</i><p>{post.quote}</p></div>
          {post.sections.map(s => <section key={s.h}>
            <h2>{s.h}</h2>
            {s.ps.map(p => <p key={p}>{p}</p>)}
          </section>)}
          <p className="clOutro">{post.outro}</p>

          <div className="clWriterCard">
            <span className="clAvatar big" style={{ background: post.color }}>{post.init}</span>
            <div>
              <b>{post.author}</b><small>{post.role} · 성공인사이드 필진</small>
              <p>매주 자신의 현장에서 검증한 관점을 씁니다.</p>
            </div>
            <Link href="/columns">다른 칼럼 보기 <ArrowUpRight size={14} /></Link>
          </div>
        </div></div>
      </article>

      <section className="wrap clSection">
        <div className="clHead"><small>다음 글</small><h2>이어서 읽기</h2></div>
        <div className="clGrid">{related.map(c => <Link className="clCard" key={c.id} href={`/columns/${c.id}`}>
          <span className="clTag">{c.cat}</span>
          <h3>{c.title}</h3>
          <p>{c.excerpt}</p>
          <div className="clCardFoot">
            <div className="clAuthor">
              <span className="clAvatar" style={{ background: c.color }}>{c.init}</span>
              <div><b>{c.author}</b><small>{c.role}</small></div>
            </div>
            <small className="clMeta">{c.date} · {c.read}</small>
          </div>
        </Link>)}</div>
      </section>

      <section className="wrap"><div className="clCta">
        <span>주간 칼럼 구독</span>
        <h2>새 칼럼이 나오면<br />가장 먼저 받아보세요.</h2>
        <p>매주 월요일 아침, 한 편씩 메일로 보내드립니다.</p>
        <div className="clCtaForm"><input placeholder="이메일 주소" /><button>구독하기</button></div>
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
