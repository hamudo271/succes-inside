/**
 * 관리자 계정 생성 / 비밀번호 변경.
 *
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='...' DATABASE_URL=... node scripts/create-admin.mjs
 *
 * - 비밀번호는 환경변수로만 받는다. 코드나 저장소에 평문을 두지 않는다.
 * - 저장되는 값은 scrypt 해시뿐이며, 원본은 어디에도 남기지 않는다.
 * - 같은 username이 있으면 비밀번호를 새로 설정하고 기존 세션을 모두 끊는다.
 */
import pg from 'pg';
import { randomBytes, scrypt as _scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);

const url = process.env.DATABASE_URL;
const username = (process.env.ADMIN_USERNAME || '').trim();
const password = process.env.ADMIN_PASSWORD || '';

const fail = (m) => { console.error('✗ ' + m); process.exit(1); };

if (!url) fail('DATABASE_URL이 필요합니다.');
if (!username) fail('ADMIN_USERNAME이 필요합니다.');
if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) fail('ADMIN_USERNAME은 영문·숫자·._- 3~32자여야 합니다.');

// 최소 강도 검사 — 약한 비밀번호가 그대로 운영에 올라가는 것을 막는다.
if (password.length < 12) fail('ADMIN_PASSWORD는 12자 이상이어야 합니다.');
const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
if (classes < 3) fail('ADMIN_PASSWORD는 소문자·대문자·숫자·기호 중 3종류 이상을 포함해야 합니다.');
if (/^(password|admin|qwerty|1234)/i.test(password)) fail('추측하기 쉬운 비밀번호입니다.');

const salt = randomBytes(16);
const key = await scrypt(password.normalize('NFKC'), salt, 64);
const hash = `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;

const internal = url.includes('.railway.internal') || url.includes('localhost') || url.includes('127.0.0.1');
const pool = new pg.Pool({
  connectionString: url,
  ssl: internal ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15_000,
});

try {
  const { rows } = await pool.query(
    `insert into admin_users (username, password_hash) values ($1, $2)
       on conflict (username) do update set password_hash = excluded.password_hash
     returning id, (xmax = 0) as created`,
    [username, hash],
  );
  const { id, created } = rows[0];
  // 비밀번호가 바뀌면 기존 세션은 모두 무효화한다.
  if (!created) await pool.query(`delete from sessions where user_id = $1`, [id]);
  console.log(`✓ 관리자 '${username}' ${created ? '생성' : '비밀번호 변경'} 완료 (id=${id})`);
  if (!created) console.log('  기존 로그인 세션을 모두 만료시켰습니다.');
  console.log('  이제 /admin/login 에서 로그인하세요.');
} catch (err) {
  console.error('✗ 실패:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
