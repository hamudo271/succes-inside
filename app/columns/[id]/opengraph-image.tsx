import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getColumn } from '../../../lib/columns';

/**
 * 칼럼 공유 이미지 — 카카오톡·슬랙·X에 링크를 붙이면 이 카드가 뜬다.
 * 관리자 편집기 오른쪽의 "공유 카드" 미리보기와 같은 구도.
 */
export const alt = '성공인사이드 칼럼';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, font] = await Promise.all([
    getColumn(id),
    readFile(join(process.cwd(), 'assets', 'Pretendard-Bold-KS.ttf')),
  ]);

  if (!post) notFound();   // 미공개·없는 글은 카드도 없다

  const raw = post.seoTitle || post.title;
  const title = raw.length > 64 ? raw.slice(0, 63) + '…' : raw;
  const fontSize = title.length <= 18 ? 76 : title.length <= 30 ? 64 : 52;

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#0f0f0e', color: '#f2f0ed', fontFamily: 'Pretendard', position: 'relative',
        padding: '64px 76px 64px 100px', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 22, height: 630, background: '#ff6b2c' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#ff6b2c' }} />
          <span>성공인사이드</span>
          <span style={{ color: '#918d86' }}>· 칼럼</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ fontSize: 26, color: '#ff9560', letterSpacing: 2 }}>{post.cat}</span>
          <div style={{ fontSize, lineHeight: 1.28, letterSpacing: -2, wordBreak: 'keep-all' }}>{title}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#918d86' }}>
          <span>{`${post.author}${post.role ? ' · ' + post.role : ''} · ${post.read}`}</span>
          <span>successinside.kr</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }] },
  );
}
