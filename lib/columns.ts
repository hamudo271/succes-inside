import 'server-only';
import { tryQuery } from './db';
import { columns as staticColumns, type ColumnPost } from '../app/columns/data';

export type { ColumnPost };

type Row = {
  slug: string; cat: string; title: string; excerpt: string; quote: string;
  author: string; role: string; read_min: number; featured: boolean;
  published_at: string | null; created_at: string;
  body: { intro?: string[]; sections?: { h: string; ps: string[] }[]; outro?: string };
};

const AVATAR = ['#d4550f', '#ff6b2c', '#c2865a', '#8a5a3b', '#57524b', '#e0824a', '#4a4540'];
/** 글쓴이 이름에서 항상 같은 아바타 색이 나오도록 고정 매핑 */
function colorFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length]!;
}

function toPost(r: Row): ColumnPost {
  const d = new Date(r.published_at ?? r.created_at);
  return {
    id: r.slug,
    cat: r.cat,
    title: r.title,
    excerpt: r.excerpt,
    quote: r.quote,
    author: r.author,
    role: r.role,
    init: r.author.trim().slice(0, 1) || '·',
    color: colorFor(r.author),
    date: `${d.getMonth() + 1}월 ${d.getDate()}일`,
    read: `${r.read_min}분`,
    featured: r.featured,
    intro: r.body?.intro ?? [],
    sections: r.body?.sections ?? [],
    outro: r.body?.outro ?? '',
  };
}

const SELECT = `select slug, cat, title, excerpt, quote, author, role, read_min,
                       featured, published_at, created_at, body
                  from columns`;

/** 공개된 칼럼 목록. DB가 없거나 글이 없으면 기존 정적 데이터를 그대로 쓴다. */
export async function getColumns(): Promise<ColumnPost[]> {
  const rows = await tryQuery<Row>(
    `${SELECT} where published = true
      order by featured desc, coalesce(published_at, created_at) desc`,
  );
  if (!rows || rows.length === 0) return staticColumns;
  return rows.map(toPost);
}

export async function getColumn(slug: string): Promise<ColumnPost | null> {
  const rows = await tryQuery<Row>(`${SELECT} where slug = $1 and published = true limit 1`, [slug]);
  if (rows && rows.length) return toPost(rows[0]!);
  return staticColumns.find(c => c.id === slug) ?? null;
}

/** 관리자용 — 미공개 글까지 전부 */
export async function getAllColumnsForAdmin() {
  return (await tryQuery<Row & { id: number; published: boolean; updated_at: string }>(
    `select id, slug, cat, title, author, published, featured, updated_at, created_at, published_at
       from columns order by updated_at desc`,
  )) ?? [];
}

export async function getColumnForEdit(id: number) {
  const rows = await tryQuery<Row & { id: number; published: boolean }>(
    `select id, slug, cat, title, excerpt, quote, author, role, read_min,
            published, featured, body
       from columns where id = $1 limit 1`,
    [id],
  );
  return rows?.[0] ?? null;
}

/* ─────────── 관리자: 출연 신청·구독 현황 ─────────── */

export type ApplicationRow = {
  id: number; type: string; name: string; business: string;
  contact: string; message: string; read: boolean; created_at: string;
};

export async function getApplications(): Promise<ApplicationRow[]> {
  return (await tryQuery<ApplicationRow>(
    `select id, type, name, business, contact, message, read, created_at
       from applications order by read asc, created_at desc limit 50`,
  )) ?? [];
}

export async function getSubscriberStats() {
  const rows = await tryQuery<{ n: string; recent: string | null }>(
    `select count(*)::text as n, max(created_at)::text as recent from subscribers`,
  );
  return rows?.[0] ? { count: Number(rows[0].n), recent: rows[0].recent } : { count: 0, recent: null };
}
