import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '../../../../lib/auth';
import { getColumnForEdit } from '../../../../lib/columns';
import ColumnEditor from '../../ColumnEditor';

export const dynamic = 'force-dynamic';

/** DB의 body(jsonb)를 편집기 텍스트 형식으로 되돌린다. */
function toText(body: { intro?: string[]; sections?: { h: string; ps: string[] }[]; outro?: string }) {
  const out: string[] = [...(body.intro ?? [])];
  for (const s of body.sections ?? []) {
    out.push(`## ${s.h}`);
    out.push(...s.ps);
  }
  if (body.outro) out.push(body.outro);
  return out.join('\n\n');
}

export default async function EditColumn({ params }: { params: Promise<{ id: string }> }) {
  if (!await getSessionUser()) redirect('/admin/login');

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const row = await getColumnForEdit(Number(id));
  if (!row) notFound();

  return <ColumnEditor initial={{
    id: row.id, slug: row.slug, cat: row.cat, title: row.title,
    excerpt: row.excerpt, quote: row.quote, author: row.author, role: row.role,
    published: row.published, featured: row.featured, body: toText(row.body),
  }} />;
}
