import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { getSessionUser } from '../../../lib/auth';
import { query, dbEnabled } from '../../../lib/db';

export const dynamic = 'force-dynamic';

/** 원본 최대 15MB. 그 위는 사진이 아니라 실수다. */
const MAX_IN = 15 * 1024 * 1024;
/** 본문 폭이 720px이라 1600px이면 레티나에서도 남는다. */
const MAX_W = 1600;

/**
 * 관리자 사진 올리기. 어떤 형식으로 오든 WebP 한 가지로 저장한다 —
 * 형식 검사(sharp가 못 읽으면 사진이 아니다)와 용량 절감을 한 번에 한다.
 * 저장된 파일 이름은 임의 값이라 원본 파일명이 새지 않는다.
 */
export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: '데이터베이스가 연결되지 않았습니다.' }, { status: 503 });
  if (!await getSessionUser()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  // 상태를 바꾸는 요청 — 같은 출처에서만 받는다.
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: '파일을 읽지 못했습니다.' }, { status: 400 });
  }
  if (!file || file.size === 0) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
  if (file.size > MAX_IN) return NextResponse.json({ error: '15MB보다 큰 파일은 올릴 수 없습니다.' }, { status: 413 });

  let out: Buffer; let width: number; let height: number;
  try {
    const img = sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'error' }).rotate(); // EXIF 회전 반영
    const meta = await img.metadata();
    if (!meta.width || !meta.height) throw new Error('no dimensions');
    out = await img.resize({ width: MAX_W, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    const m2 = await sharp(out).metadata();
    width = m2.width!; height = m2.height!;
  } catch {
    return NextResponse.json({ error: '사진 파일이 아니거나 읽을 수 없습니다. JPG·PNG·WebP·HEIC를 올려 주세요.' }, { status: 415 });
  }

  const key = randomBytes(9).toString('base64url');   // 12자, 파일명에 안전
  await query(
    `insert into images (key, bytes, width, height, size) values ($1, $2, $3, $4, $5)`,
    [key, out, width, height, out.length],
  );
  return NextResponse.json({ url: `/img/${key}.webp`, width, height, size: out.length });
}
