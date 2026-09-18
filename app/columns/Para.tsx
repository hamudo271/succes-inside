import { parseInline, type Inline } from '../../lib/inline';

type TextNode = Exclude<Inline, { t: 'img' }>;

/**
 * 본문 문단 하나. 이미지는 문단 어디에 있든 <figure>로 따로 세우고,
 * 그 앞뒤 글은 링크·강조를 살린 <p>로 그린다. 글이 없는 조각은 <p>를 만들지 않는다.
 */
export default function Para({ text, className }: { text: string; className?: string }) {
  const nodes = parseInline(text);
  const blocks: (TextNode[] | { img: { alt: string; src: string } })[] = [];
  let cur: TextNode[] = [];
  for (const n of nodes) {
    if (n.t === 'img') {
      if (cur.some(c => c.v.trim())) blocks.push(cur);
      cur = [];
      blocks.push({ img: { alt: n.alt, src: n.src } });
    } else cur.push(n);
  }
  if (cur.some(c => c.v.trim())) blocks.push(cur);

  return <>{blocks.map((b, i) =>
    'img' in b ? (
      <figure key={i} className="clFig">
        <img src={b.img.src} alt={b.img.alt} loading="lazy" />
        {b.img.alt && <figcaption>{b.img.alt}</figcaption>}
      </figure>
    ) : (
      <p key={i} className={className}>
        {b.map((n, j) =>
          n.t === 'bold' ? <strong key={j}>{n.v}</strong>
          : n.t === 'link' ? (
            n.external
              ? <a key={j} href={n.href} target="_blank" rel="noopener">{n.v}</a>
              : <a key={j} href={n.href}>{n.v}</a>
          )
          : <span key={j}>{n.v}</span>,
        )}
      </p>
    ),
  )}</>;
}
