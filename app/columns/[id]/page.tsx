import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { getColumns, getColumn } from '../../../lib/columns';
import SubscribeForm from '../../components/SubscribeForm';
import '../columns.css';

export const dynamic = 'force-dynamic';

export default async function ColumnDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getColumn(id);
  if (!post) notFound();

  const columns = await getColumns();
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
            <div className="clByline"><b>{post.author}</b><small>{post.role}</small></div>
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
            <div>
              <b>{post.author}</b><small>{post.role}</small>
              <p>인터뷰 현장에서 본 것을 매주 한 편의 관점으로 씁니다.</p>
            </div>
            <Link href="/columns">다른 칼럼 보기 <ArrowUpRight size={14} /></Link>
          </div>
        </div></div>
      </article>

      <section className="wrap clSection">
        <div className="clHead"><small>다음 글</small><h2>이어서 읽기</h2></div>
        <div className="clGrid">{related.map(c => <Link className="clCard" key={c.id} href={`/columns/${c.id}`}>
          <div className="clMetaLine"><span>{c.cat}</span><span>{c.date}</span><span><Clock size={11} /> {c.read}</span></div>
          <h3>{c.title}</h3>
          <p>{c.excerpt}</p>
          <span className="clMore">읽어보기 <ArrowUpRight size={13} /></span>
        </Link>)}</div>
      </section>

      <section className="wrap"><div className="clCta">
        <span>주간 칼럼 구독</span>
        <h2>새 칼럼이 나오면{' '}<br />가장 먼저 받아보세요.</h2>
        <p>새 칼럼이 발행되면 메일로 보내드립니다.</p>
        <div className="clCtaForm"><SubscribeForm source="column-detail" label="구독하기" /></div>
      </div></section>
    </main>
    <SiteFooter />
  </>;
}
