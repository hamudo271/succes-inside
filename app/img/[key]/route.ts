import { tryQuery } from '../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * 올린 사진을 내보낸다. 이름이 임의 값이라 내용이 바뀔 일이 없으므로 1년 캐시 —
 * 브라우저와 Cloudflare 엣지가 들고 있어 DB는 처음 한 번만 읽는다.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const m = /^([A-Za-z0-9_-]{8,24})\.webp$/.exec(key);
  if (!m) return new Response('Not found', { status: 404 });
  const rows = await tryQuery<{ bytes: Buffer }>(`select bytes from images where key = $1`, [m[1]]);
  if (!rows?.length) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(rows[0]!.bytes), {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
