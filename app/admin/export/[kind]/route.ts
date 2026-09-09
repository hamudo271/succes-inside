import { getSessionUser } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * 관리자 전용 CSV 내려받기.
 * 모아 둔 이메일과 신청 내용을 화면 밖으로 꺼낼 수 있어야 실제로 쓸 수 있다.
 */

/**
 * 엑셀은 =, +, -, @ 로 시작하는 칸을 수식으로 실행한다.
 * 남이 입력한 값이 그대로 들어오는 파일이므로 따옴표를 앞에 붙여 무력화한다.
 */
/** pg가 돌려주는 Date를 엑셀이 날짜로 읽는 형식으로. 그대로 String()하면 'Wed Sep 09 2026 …'가 된다. */
function stampCell(v: unknown): string {
  if (!(v instanceof Date)) return String(v ?? '');
  const p = (n: number) => String(n).padStart(2, '0');
  return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())} ${p(v.getHours())}:${p(v.getMinutes())}`;
}

function cell(v: unknown): string {
  let s = v instanceof Date ? stampCell(v) : v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function csv(head: string[], rows: unknown[][]): string {
  const lines = [head.map(cell).join(','), ...rows.map(r => r.map(cell).join(','))];
  // BOM — 없으면 엑셀이 한글을 깨진 글자로 연다.
  return '﻿' + lines.join('\r\n') + '\r\n';
}

const stamp = () => new Date().toISOString().slice(0, 10);

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!await getSessionUser()) return new Response('unauthorized', { status: 401 });

  const { kind } = await params;
  let body: string;
  let name: string;

  if (kind === 'subscribers') {
    const rows = await query<{ email: string; source: string; created_at: Date }>(
      `select email, source, created_at from subscribers order by created_at desc`,
    );
    body = csv(['이메일', '유입', '구독일'], rows.map(r => [r.email, r.source, r.created_at]));
    name = `구독자_${stamp()}.csv`;
  } else if (kind === 'applications') {
    const rows = await query<{
      type: string; name: string; business: string; contact: string;
      message: string; read: boolean; created_at: Date;
    }>(`select type, name, business, contact, message, read, created_at
          from applications order by created_at desc`);
    body = csv(
      ['종류', '성함', '사업', '연락처', '내용', '읽음', '접수일'],
      rows.map(r => [r.type, r.name, r.business, r.contact, r.message, r.read ? 'Y' : '', r.created_at]),
    );
    name = `신청_${stamp()}.csv`;
  } else {
    return new Response('not found', { status: 404 });
  }

  return new Response(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      // 한글 파일명은 RFC 5987 형식으로만 안전하게 전달된다.
      'content-disposition': `attachment; filename="export-${kind}-${stamp()}.csv"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'cache-control': 'no-store',
    },
  });
}
