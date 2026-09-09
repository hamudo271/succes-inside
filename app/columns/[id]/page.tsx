import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Clock } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';
import { getColumns, getColumn, getColumnPreview } from '../../../lib/columns';
import { SITE } from '../../../lib/seo';
import { ORG_ID, SITE_ID } from '../../../lib/schema';
import SubscribeForm from '../../components/SubscribeForm';
import '../columns.css';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** 관리자가 쓴 검색 제목·설명·키워드가 그대로 <head>로 나간다. 비어 있으면 제목·요약. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = await getColumn(id);
  if (!post) {
    // 발행 전 글을 관리자가 열어 본 경우. 색인은 절대 시키지 않는다.
    const draft = await getColumnPreview(id);
    return draft
      ? { title: `[미리보기] ${draft.seoTitle || draft.title}`, robots: { index: false, follow: false } }
      : { title: '칼럼을 찾을 수 없습니다', robots: { index: false } };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDesc || post.excerpt;
  const url = `/columns/${post.id}`;
  return {
    title,
    description,
    keywords: post.keywords?.length ? post.keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', url, title, description,
      siteName: '성공인사이드', locale: 'ko_KR',
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt,
      authors: [post.author], section: post.cat, tags: post.keywords,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ColumnDetail({ params }: Params) {
  const { id } = await params;
  const published = await getColumn(id);
  // 공개된 글이 없을 때만 초안을 찾는다 — 관리자가 아니면 여기서도 null이 돌아온다.
  const post = published ?? await getColumnPreview(id);
  if (!post) notFound();
  const draft = !published;

  const columns = await getColumns();
  const related = [
    ...columns.filter(c => c.id !== post.id && c.cat === post.cat),
    ...columns.filter(c => c.id !== post.id && c.cat !== post.cat),
  ].slice(0, 2);

  // 구조화 데이터 — 구글·네이버가 글의 정체(기사, 작성자, 날짜, 위치)를 읽는다.
  const url = `${SITE}/columns/${post.id}`;
  const wordCount = [...post.intro, ...post.sections.flatMap(s => s.ps), post.outro]
    .join(' ').replace(/\s+/g, '').length;
  // 레이아웃이 이미 Organization을 @id로 정의했으므로 여기서는 참조만 한다 — 그래프에 같은 주체가 두 번 생기지 않게.
  const author = post.author === '성공인사이드'
    ? { '@id': ORG_ID }
    : { '@type': 'Person', name: post.author, jobTitle: post.role || undefined };
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: post.title,
        description: post.seoDesc || post.excerpt,
        image: [`${url}/opengraph-image`],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        author,
        publisher: { '@id': ORG_ID },
        isPartOf: { '@id': SITE_ID },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        articleSection: post.cat,
        keywords: post.keywords?.length ? post.keywords.join(', ') : undefined,
        inLanguage: 'ko-KR',
        wordCount,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '성공인사이드', item: SITE },
          { '@type': 'ListItem', position: 2, name: '칼럼', item: `${SITE}/columns` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return <>
    {!draft && <script
      type="application/ld+json"
      // JSON 안의 '<'를 이스케이프해 </script> 주입을 막는다.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
    />}
    <SiteHeader active="columns" />
    <main>
      {draft && (
        <div className="clDraftBar">
          <b>발행 전 미리보기</b>
          <span>관리자에게만 보입니다. 검색에도 잡히지 않습니다.</span>
          <Link href="/admin">관리자로 돌아가기</Link>
        </div>
      )}
      <article>
        <div className="wrap clArtHero">
          <Link className="clBack" href="/columns"><ArrowLeft size={15} /> 칼럼 목록</Link>
          <span className="clTag">{post.cat}</span>
          <h1>{post.title}</h1>
          <p className="clLead">{post.excerpt}</p>
          <div className="clArtMeta">
            <div className="clByline"><b>{post.author}</b><small>{post.role}</small></div>
            <small className="clMeta">
              <time dateTime={post.publishedAt}>{post.date}</time> · <Clock size={11} /> {post.read}
            </small>
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
