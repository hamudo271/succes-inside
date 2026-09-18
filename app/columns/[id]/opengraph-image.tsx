import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getColumn } from '../../../lib/columns';

/**
 * 칼럼 공유 이미지 — 카카오톡·슬랙·X에 링크를 붙이면 이 카드가 뜬다.
 * 관리자 편집기 오른쪽의 "공유 카드" 미리보기와 같은 구도로 맞춰 둔다(admin.css .admOg).
 *
 * 카톡 대화창에서는 300px 남짓으로 줄어든다 — 제목은 크게, 잔무늬는 얕게.
 * 뒤에 깔린 따옴표는 본문 인용 카드(.clPull)에서 쓰는 모티프다.
 */
export const alt = '성공인사이드 칼럼';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, font, mark] = await Promise.all([
    getColumn(id),
    readFile(join(process.cwd(), 'assets', 'Pretendard-Bold-KS.ttf')),
    readFile(join(process.cwd(), 'public', 'mark-orange.svg')),
  ]);

  if (!post) notFound();   // 미공개·없는 글은 카드도 없다

  const raw = post.seoTitle || post.title;
  const title = raw.length > 64 ? raw.slice(0, 63) + '…' : raw;
  const fontSize = title.length <= 18 ? 82 : title.length <= 30 ? 68 : title.length <= 46 ? 56 : 48;
  const markSrc = `data:image/svg+xml;base64,${mark.toString('base64')}`;
  // 같은 깃발을 아주 어둡게 칠해 뒤에 크게 깐다 — 제목 위 빈 자리를 채우는 무늬.
  const markFaint = `data:image/svg+xml;base64,${Buffer.from(
    mark.toString('utf8').replaceAll('#ff6b2c', '#251c16')).toString('base64')}`;
  // 글쓴이가 매체 이름과 같으면 위 워드마크와 겹친다 — 그때는 날짜·분량만.
  const meta = [post.author === '성공인사이드' ? '' : post.author, post.date, `${post.read} 분량`]
    .filter(Boolean).join('  ·  ');

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#0f0f0e',
        backgroundImage: 'radial-gradient(880px 520px at 84% 112%, #32200f 0%, #0f0f0e 62%)',
        color: '#f2f0ed', fontFamily: 'Pretendard', position: 'relative',
        padding: '54px 72px 48px',
      }}>
        <img src={markFaint} width={420} height={420} alt=""
             style={{ position: 'absolute', right: 20, top: 58 }} />

        {/* 머리 — 깃발 마크와 워드마크 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={markSrc} width={46} height={46} alt="" />
            <span style={{ fontSize: 29, letterSpacing: -0.5 }}>성공인사이드</span>
          </div>
          <span style={{ fontSize: 22, color: '#6d6963', letterSpacing: 5 }}>칼럼</span>
        </div>

        {/* 본체 — 분류 알약, 제목, 서명 같은 짧은 줄 */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          <div style={{ display: 'flex' }}>
            <span style={{
              fontSize: 25, color: '#ffab7a', background: '#3a2415',
              padding: '11px 24px 13px', borderRadius: 999, letterSpacing: 0.5,
            }}>{post.cat}</span>
          </div>
          <div style={{
            fontSize, lineHeight: 1.26, letterSpacing: -2.4, wordBreak: 'keep-all',
            marginTop: 26, maxWidth: 960, display: 'flex',
          }}>{title}</div>
          <div style={{ width: 66, height: 5, background: '#ff6b2c', borderRadius: 3, marginTop: 30, marginBottom: 34 }} />
        </div>

        {/* 발 — 실선 한 줄 위에 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #272320', paddingTop: 24, fontSize: 23, color: '#918d86',
        }}>
          <span>{meta}</span>
          <span>successinside.kr</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Pretendard', data: font, weight: 700, style: 'normal' }] },
  );
}
