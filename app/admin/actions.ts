'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { query, dbEnabled } from '../../lib/db';
import {
  verifyPassword, createSession, destroySession, requireAdmin,
  assertSameOrigin, isLockedOut, recordAttempt, clientIp,
} from '../../lib/auth';

/** 로그인 실패는 원인을 구분해 알리지 않는다(계정 존재 여부 노출 방지). */
const GENERIC = '아이디 또는 비밀번호가 올바르지 않습니다.';

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!dbEnabled) return { error: '데이터베이스가 연결되지 않았습니다.' };
  await assertSameOrigin();

  const username = String(form.get('username') ?? '').trim().slice(0, 64);
  const password = String(form.get('password') ?? '');
  if (!username || !password) return { error: GENERIC };

  const ip = clientIp(await headers());
  // IP와 계정 각각에 제한을 건다 — 분산 시도와 특정 계정 집중 공격을 모두 막는다.
  if (await isLockedOut(ip) || await isLockedOut(`user:${username}`)) {
    return { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요.' };
  }

  const rows = await query<{ id: number; password_hash: string }>(
    `select id, password_hash from admin_users where username = $1 limit 1`,
    [username],
  );
  const user = rows[0];

  // 계정이 없어도 동일한 연산 비용을 들여 응답 시간으로 존재 여부를 알 수 없게 한다.
  const dummy = 'scrypt$' + '0'.repeat(32) + '$' + '0'.repeat(128);
  const ok = await verifyPassword(password, user?.password_hash ?? dummy);

  if (!user || !ok) {
    await recordAttempt(ip, false);
    await recordAttempt(`user:${username}`, false);
    return { error: GENERIC };
  }

  await recordAttempt(ip, true);
  await recordAttempt(`user:${username}`, true);
  await query(`update admin_users set last_login_at = now() where id = $1`, [user.id]);
  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  await destroySession();
  redirect('/admin/login');
}

/* ─────────── 칼럼 ─────────── */

function slugify(input: string, fallback: string): string {
  const s = input.trim().toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return s || fallback;
}

/** 빈 줄로 문단을 나눈다. 본문은 HTML로 렌더하지 않으므로 XSS 위험이 없다. */
function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim().replace(/\s*\n\s*/g, ' ')).filter(Boolean);
}

/**
 * 편집기 본문 형식:
 *   문단들…
 *   ## 소제목
 *   문단들…
 * 마지막 문단은 마무리(outro)로 저장한다.
 */
function parseBody(raw: string) {
  const intro: string[] = [];
  const sections: { h: string; ps: string[] }[] = [];
  let cur: { h: string; ps: string[] } | null = null;

  for (const line of raw.split('\n')) {
    const m = /^\s*##\s+(.+?)\s*$/.exec(line);
    if (m) {
      cur = { h: m[1]!, ps: [] };
      sections.push(cur);
      continue;
    }
    (cur ? cur.ps : intro).push(line);
  }
  const introPs = paragraphs(intro.join('\n'));
  const secs = sections.map(s => ({ h: s.h, ps: paragraphs(s.ps.join('\n')) })).filter(s => s.ps.length || s.h);

  // 마지막 문단을 outro로 뽑아낸다.
  let outro = '';
  const last = secs.length ? secs[secs.length - 1]!.ps : introPs;
  if (last.length > 1) outro = last.pop()!;
  return { intro: introPs, sections: secs, outro };
}

export type SaveState = { error?: string; ok?: boolean };

export async function saveColumnAction(_prev: SaveState, form: FormData): Promise<SaveState> {
  await assertSameOrigin();
  await requireAdmin();                       // 세션 없으면 여기서 중단

  const idRaw = String(form.get('id') ?? '');
  const id = /^\d+$/.test(idRaw) ? Number(idRaw) : null;

  const title = String(form.get('title') ?? '').trim().slice(0, 200);
  const cat = String(form.get('cat') ?? '').trim().slice(0, 40);
  const author = String(form.get('author') ?? '').trim().slice(0, 60);
  const role = String(form.get('role') ?? '').trim().slice(0, 80);
  const excerpt = String(form.get('excerpt') ?? '').trim().slice(0, 500);
  const quote = String(form.get('quote') ?? '').trim().slice(0, 300);
  const bodyRaw = String(form.get('body') ?? '').slice(0, 60_000);
  const published = form.get('published') === 'on';
  const featured = form.get('featured') === 'on';

  if (!title) return { error: '제목을 입력해 주세요.' };
  if (!cat) return { error: '카테고리를 입력해 주세요.' };
  if (!author) return { error: '글쓴이를 입력해 주세요.' };
  if (!bodyRaw.trim()) return { error: '본문을 입력해 주세요.' };

  const body = parseBody(bodyRaw);
  const words = bodyRaw.replace(/\s+/g, '').length;
  const readMin = Math.max(1, Math.round(words / 500));

  const slugInput = String(form.get('slug') ?? '');
  const slug = slugify(slugInput || title, `column-${Date.now()}`);

  try {
    if (id === null) {
      await query(
        `insert into columns (slug, cat, title, excerpt, quote, author, role, read_min, body, published, featured, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11, case when $10 then now() else null end)`,
        [slug, cat, title, excerpt, quote, author, role, readMin, JSON.stringify(body), published, featured],
      );
    } else {
      await query(
        `update columns set slug=$1, cat=$2, title=$3, excerpt=$4, quote=$5, author=$6, role=$7,
                            read_min=$8, body=$9::jsonb, published=$10, featured=$11, updated_at=now(),
                            published_at = case when $10 and published_at is null then now()
                                                when $10 then published_at else null end
           where id=$12`,
        [slug, cat, title, excerpt, quote, author, role, readMin, JSON.stringify(body), published, featured, id],
      );
    }
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('duplicate key')) return { error: '같은 주소(slug)의 글이 이미 있습니다.' };
    console.error('[admin] save failed:', msg);
    return { error: '저장에 실패했습니다.' };
  }

  // 하나의 글만 대표로 둔다.
  if (featured) {
    await query(`update columns set featured = false where slug <> $1`, [slug]);
  }

  revalidatePath('/columns');
  revalidatePath(`/columns/${slug}`);
  revalidatePath('/admin');
  redirect('/admin?saved=1');
}

export async function deleteColumnAction(form: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = Number(String(form.get('id') ?? ''));
  if (!Number.isInteger(id)) return;
  await query(`delete from columns where id = $1`, [id]);
  revalidatePath('/columns');
  revalidatePath('/admin');
  redirect('/admin?deleted=1');
}

export async function togglePublishAction(form: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = Number(String(form.get('id') ?? ''));
  if (!Number.isInteger(id)) return;
  await query(
    `update columns
        set published = not published,
            published_at = case when not published and published_at is null then now() else published_at end,
            updated_at = now()
      where id = $1`,
    [id],
  );
  revalidatePath('/columns');
  revalidatePath('/admin');
}
