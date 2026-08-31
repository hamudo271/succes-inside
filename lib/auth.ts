import 'server-only';
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies, headers } from 'next/headers';
import { query, dbEnabled } from './db';

const scrypt = promisify(_scrypt) as (p: string | Buffer, s: Buffer, k: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'si_session';
const SESSION_DAYS = 7;
const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_LEN = 16;

/* ─────────── 비밀번호 ─────────── */

/** scrypt 해시. 평문은 어디에도 저장하지 않는다. 형식: scrypt$<salt-hex>$<hash-hex> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SCRYPT_SALT_LEN);
  const key = await scrypt(password.normalize('NFKC'), salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

/** 타이밍 공격을 피하기 위해 항상 같은 비용으로 비교한다. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (expected.length !== SCRYPT_KEYLEN) return false;
  const actual = await scrypt(password.normalize('NFKC'), salt, SCRYPT_KEYLEN);
  return timingSafeEqual(actual, expected);
}

/* ─────────── 세션 ─────────── */

/** 쿠키로 나가는 원본 토큰. DB에는 이 값의 SHA-256만 저장한다. */
function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export type AdminUser = { id: number; username: string };

export async function createSession(userId: number): Promise<void> {
  const token = newSessionToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);

  const h = await headers();
  const ua = (h.get('user-agent') ?? '').slice(0, 300);
  const ip = clientIp(h);

  await query(
    `insert into sessions (token_hash, user_id, expires_at, ip, user_agent)
     values ($1, $2, $3, $4, $5)`,
    [hashToken(token), userId, expires, ip, ua],
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,                                   // JS에서 접근 불가 → XSS로 탈취 불가
    secure: process.env.NODE_ENV === 'production',    // HTTPS 전용
    sameSite: 'lax',                                  // 크로스사이트 전송 차단(CSRF 완화)
    path: '/',
    expires,
  });
}

/** 현재 요청의 로그인 사용자. 없으면 null. */
export async function getSessionUser(): Promise<AdminUser | null> {
  if (!dbEnabled) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const rows = await query<{ id: number; username: string }>(
      `select u.id, u.username
         from sessions s
         join admin_users u on u.id = s.user_id
        where s.token_hash = $1 and s.expires_at > now()
        limit 1`,
      [hashToken(token)],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error('[auth] session lookup failed:', (err as Error).message);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && dbEnabled) {
    try {
      await query(`delete from sessions where token_hash = $1`, [hashToken(token)]);
    } catch { /* 쿠키는 아래에서 어차피 지운다 */ }
  }
  jar.delete(SESSION_COOKIE);
}

/* ─────────── 로그인 시도 제한 ─────────── */

const MAX_ATTEMPTS = 5;
const WINDOW_MIN = 15;

export async function isLockedOut(identifier: string): Promise<boolean> {
  const rows = await query<{ n: string }>(
    `select count(*)::text as n from login_attempts
      where identifier = $1 and success = false
        and at > now() - interval '${WINDOW_MIN} minutes'`,
    [identifier],
  );
  return Number(rows[0]?.n ?? 0) >= MAX_ATTEMPTS;
}

export async function recordAttempt(identifier: string, success: boolean): Promise<void> {
  await query(`insert into login_attempts (identifier, success) values ($1, $2)`, [identifier, success]);
  if (success) {
    await query(`delete from login_attempts where identifier = $1 and success = false`, [identifier]);
  }
}

/* ─────────── 요청 정보 ─────────── */

export function clientIp(h: Headers): string {
  // Railway는 x-forwarded-for로 원 IP를 전달한다. 첫 번째 값만 신뢰.
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim().slice(0, 64);
  return h.get('x-real-ip')?.slice(0, 64) ?? 'unknown';
}

/**
 * 상태를 바꾸는 요청은 같은 출처에서 왔는지 확인한다.
 * (sameSite=lax와 함께 CSRF를 이중으로 막는다.)
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get('origin');
  if (!origin) return; // 폼 전송 등 Origin이 없는 동일 출처 요청
  const host = h.get('host');
  if (!host) throw new Error('bad request');
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error('bad request');
  }
  if (originHost !== host) throw new Error('cross-origin request rejected');
}

/** 관리자 전용 동작 앞에 반드시 호출한다. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('unauthorized');
  return user;
}
