import { parseInline, imagePara } from '../../lib/inline';

/** 본문 문단 하나. 이미지만 있는 문단은 그림으로, 나머지는 링크·강조를 살린 <p>로. */
export default function Para({ text, className }: { text: string; className?: string }) {
  const img = imagePara(text);
  if (img) {
    return (
      <figure className="clFig">
        <img src={img.src} alt={img.alt} loading="lazy" />
        {img.alt && <figcaption>{img.alt}</figcaption>}
      </figure>
    );
  }
  return (
    <p className={className}>
      {parseInline(text).map((n, i) =>
        n.t === 'bold' ? <strong key={i}>{n.v}</strong>
        : n.t === 'link' ? (
          n.external
            ? <a key={i} href={n.href} target="_blank" rel="noopener">{n.v}</a>
            : <a key={i} href={n.href}>{n.v}</a>
        )
        : <span key={i}>{n.v}</span>,
      )}
    </p>
  );
}
