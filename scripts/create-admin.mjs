/**
 * 관리자 계정 생성 / 비밀번호 변경.
 *
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='...' DATABASE_URL=... node scripts/create-admin.mjs
 *
 * - 비밀번호는 환경변수로만 받는다. 코드나 저장소에 평문을 두지 않는다.
 * - 저장되는 값은 scrypt 해시뿐이며, 원본은 어디에도 남기지 않는다.
 * - 같은 username이 있으면 비밀번호를 새로 설정하고 기존 세션을 모두 끊는다.
 *
 * 첫 계정은 배포할 때 migrate.mjs가 자동으로 만든다. 이 스크립트는
 * 비밀번호를 잊었을 때처럼 계정을 강제로 다시 세울 때 쓴다.
 */
import pg from 'pg';
import { usernameProblem, passwordProblem, hashPassword, poolConfig } from './admin-account.mjs';

const url = process.env.DATABASE_URL;
const username = (process.env.ADMIN_USERNAME || '').trim();
const password = process.env.ADMIN_PASSWORD || '';

const fail = (m) => { console.error('✗ ' + m); process.exit(1); };

if (!url) fail('DATABASE_URL이 필요합니다.');
const bad = usernameProblem(username) || passwordProblem(password);
if (bad) fail(bad);

const hash = await hashPassword(password);
const pool = new pg.Pool(poolConfig(url));

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
