'use server';
import { headers } from 'next/headers';
import { query, dbEnabled } from '../lib/db';
import { assertSameOrigin, clientIp } from '../lib/auth';

const FALLBACK = '지금은 접수가 어렵습니다. success.inside.kr@gmail.com 으로 직접 보내주세요.';
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

/** 같은 IP의 최근 1시간 제출 횟수를 제한한다(스팸·봇 방어 1차). */
async function overRateLimit(table: 'subscribers' | 'applications', ip: string, max: number): Promise<boolean> {
  const rows = await query<{ n: string }>(
    `select count(*)::text as n from ${table} where ip = $1 and created_at > now() - interval '1 hour'`,
    [ip],
  );
  return Number(rows[0]?.n ?? 0) >= max;
}

/* ─────────── 뉴스레터 구독 ─────────── */

export type SubscribeState = { ok?: boolean; error?: string; message?: string };

export async function subscribeAction(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  await assertSameOrigin();
  // 허니팟: 사람에게는 보이지 않는 필드가 채워져 오면 봇이다. 성공한 척 응답한다.
  if (String(form.get('website') ?? '') !== '') return { ok: true, message: '구독이 완료됐습니다.' };

  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) return { error: '이메일 주소를 확인해 주세요.' };
  if (!dbEnabled) return { error: FALLBACK };

  const ip = clientIp(await headers());
  try {
    if (await overRateLimit('subscribers', ip, 5)) {
      return { error: '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.' };
    }
    const source = String(form.get('source') ?? '').slice(0, 40);
    const rows = await query<{ id: number }>(
      `insert into subscribers (email, source, ip) values ($1, $2, $3)
         on conflict (email) do nothing returning id`,
      [email, source, ip],
    );
    return rows.length
      ? { ok: true, message: '구독이 완료됐습니다. 새 소식을 보내드릴게요.' }
      : { ok: true, message: '이미 구독 중인 주소입니다.' };
  } catch (err) {
    console.error('[subscribe] failed:', (err as Error).message);
    return { error: FALLBACK };
  }
}

/* ─────────── 출연·문의 신청 ─────────── */

const APPLY_TYPES = ['출연 신청', '교육 과정 문의', '기타 문의'] as const;

export type ApplyState = { ok?: boolean; error?: string };

export async function applyAction(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  await assertSameOrigin();
  if (String(form.get('website') ?? '') !== '') return { ok: true }; // 허니팟

  const typeRaw = String(form.get('type') ?? '');
  const type = (APPLY_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : APPLY_TYPES[0];
  const name = String(form.get('name') ?? '').trim().slice(0, 60);
  const business = String(form.get('business') ?? '').trim().slice(0, 120);
  const contact = String(form.get('contact') ?? '').trim().slice(0, 120);
  const message = String(form.get('message') ?? '').trim().slice(0, 4000);

  if (!name) return { error: '성함을 입력해 주세요.' };
  if (!contact) return { error: '연락받을 이메일이나 전화번호를 입력해 주세요.' };
  if (message.length < 10) return { error: '내용을 조금 더 적어주세요. (10자 이상)' };
  if (!dbEnabled) return { error: FALLBACK };

  const ip = clientIp(await headers());
  try {
    if (await overRateLimit('applications', ip, 3)) {
      return { error: '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.' };
    }
    await query(
      `insert into applications (type, name, business, contact, message, ip)
       values ($1, $2, $3, $4, $5, $6)`,
      [type, name, business, contact, message, ip],
    );
    return { ok: true };
  } catch (err) {
    console.error('[apply] failed:', (err as Error).message);
    return { error: FALLBACK };
  }
}
