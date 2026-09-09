/**
 * 관리자 계정 규칙 — 한 곳에서만 정한다.
 * create-admin.mjs(수동 생성)와 migrate.mjs(첫 계정 자동 생성)가 함께 쓴다.
 * 같은 규칙의 TypeScript 판이 lib/auth.ts에도 있다(관리자 화면의 비밀번호 변경용).
 * 둘 중 하나를 고치면 나머지도 함께 고쳐야 한다.
 */
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);

export function usernameProblem(username) {
  if (!username) return 'ADMIN_USERNAME이 필요합니다.';
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) return '아이디는 영문·숫자·._- 3~32자여야 합니다.';
  return null;
}

/** 약한 비밀번호가 그대로 운영에 올라가는 것을 막는다. 통과하면 null. */
export function passwordProblem(password) {
  if (password.length < 12) return '비밀번호는 12자 이상이어야 합니다.';
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) return '비밀번호는 소문자·대문자·숫자·기호 중 3종류 이상을 포함해야 합니다.';
  if (/^(password|admin|qwerty|1234)/i.test(password)) return '추측하기 쉬운 비밀번호입니다.';
  return null;
}

/** scrypt 해시. 평문은 어디에도 저장하지 않는다. 형식: scrypt$<salt-hex>$<hash-hex> */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

/** Railway 내부 네트워크(*.railway.internal)와 로컬은 TLS를 쓰지 않는다. */
export function poolConfig(url) {
  const internal = url.includes('.railway.internal') || url.includes('localhost') || url.includes('127.0.0.1');
  return {
    connectionString: url,
    ssl: internal ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
  };
}
