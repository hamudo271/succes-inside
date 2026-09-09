'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { query, dbEnabled } from '../../lib/db';
import { slugify, parseKeywords } from '../../lib/seo';
import {
  verifyPassword, hashPassword, passwordProblem, createSession, destroySession, requireAdmin,
  assertSameOrigin, isLockedOut, recordAttempt, clientIp, revokeOtherSessions,
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

/* ─────────── 계정 ─────────── */

export type PasswordState = { error?: string; ok?: string };

/**
 * 비밀번호 변경. 현재 비밀번호를 확인한 뒤에만 바꾼다.
 * 바꾸고 나면 다른 기기의 로그인은 모두 끊는다 — 비밀번호가 샜을 때 되찾는 수단이 되어야 하므로.
 */
export async function changePasswordAction(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  await assertSameOrigin();
  const user = await requireAdmin();

  const current = String(form.get('current') ?? '');
  const next = String(form.get('next') ?? '');
  const confirm = String(form.get('confirm') ?? '');

  if (!current || !next) return { error: '모든 칸을 채워 주세요.' };
  if (next !== confirm) return { error: '새 비밀번호가 서로 다릅니다.' };
  if (next === current) return { error: '지금 쓰는 비밀번호와 같습니다.' };

  const weak = passwordProblem(next);
  if (weak) return { error: weak };

  const rows = await query<{ password_hash: string }>(
    `select password_hash from admin_users where id = $1`, [user.id],
  );
  if (!rows[0] || !(await verifyPassword(current, rows[0].password_hash))) {
    // 현재 비밀번호 확인도 무차별 대입 대상이다 — 로그인과 같은 제한을 건다.
    const ip = clientIp(await headers());
    await recordAttempt(ip, false);
    if (await isLockedOut(ip)) return { error: '시도가 너무 많습니다. 15분 후 다시 시도해 주세요.' };
    return { error: '현재 비밀번호가 올바르지 않습니다.' };
  }

  await query(`update admin_users set password_hash = $1 where id = $2`, [await hashPassword(next), user.id]);
  const cut = await revokeOtherSessions(user.id);

  revalidatePath('/admin/account');
  return { ok: cut > 0 ? `비밀번호를 바꿨습니다. 다른 기기의 로그인 ${cut}건을 끊었습니다.` : '비밀번호를 바꿨습니다.' };
}

export async function logoutOtherDevicesAction(): Promise<void> {
  await assertSameOrigin();
  const user = await requireAdmin();
  await revokeOtherSessions(user.id);
  revalidatePath('/admin/account');
}

/* ─────────── 칼럼 ─────────── */

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
  // 검색 최적화 — 비우면 공개 페이지가 제목·요약을 대신 쓴다.
  const seoTitle = String(form.get('seo_title') ?? '').trim().slice(0, 120);
  const seoDesc = String(form.get('seo_desc') ?? '').trim().slice(0, 320);
  const keywords = parseKeywords(String(form.get('keywords') ?? '').slice(0, 600)).join(', ');

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
        `insert into columns (slug, cat, title, excerpt, quote, author, role, read_min, body, published, featured,
                              seo_title, seo_desc, keywords, published_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14, case when $10 then now() else null end)`,
        [slug, cat, title, excerpt, quote, author, role, readMin, JSON.stringify(body), published, featured,
         seoTitle, seoDesc, keywords],
      );
    } else {
      // 발행일은 한 번 정해지면 유지한다. 비공개로 돌렸다가 다시 여는 것만으로
      // 구조화 데이터의 datePublished가 오늘로 바뀌면, 검색엔진에는 새 글로 보인다.
      await query(
        `update columns set slug=$1, cat=$2, title=$3, excerpt=$4, quote=$5, author=$6, role=$7,
                            read_min=$8, body=$9::jsonb, published=$10, featured=$11,
                            seo_title=$12, seo_desc=$13, keywords=$14, updated_at=now(),
                            published_at = case when $10 and published_at is null then now()
                                                else published_at end
           where id=$15`,
        [slug, cat, title, excerpt, quote, author, role, readMin, JSON.stringify(body), published, featured,
         seoTitle, seoDesc, keywords, id],
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

/* ─────────── 출연 신청 관리 ─────────── */

export async function toggleApplicationReadAction(form: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = Number(String(form.get('id') ?? ''));
  if (!Number.isInteger(id)) return;
  await query(`update applications set read = not read where id = $1`, [id]);
  revalidatePath('/admin');
}

export async function deleteApplicationAction(form: FormData): Promise<void> {
  await assertSameOrigin();
  await requireAdmin();
  const id = Number(String(form.get('id') ?? ''));
  if (!Number.isInteger(id)) return;
  await query(`delete from applications where id = $1`, [id]);
  revalidatePath('/admin');
}
