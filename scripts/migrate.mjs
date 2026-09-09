/**
 * 스키마 생성 (여러 번 실행해도 안전).
 *   DATABASE_URL=... node scripts/migrate.mjs
 *
 * Railway에서는 서버가 뜨기 직전에 실행된다 (package.json의 start 스크립트).
 * 빌드 단계가 아니다 — Railway의 사설망(*.railway.internal)은 런타임에만 열리므로,
 * 빌드에서 DB에 접속하려 하면 ENOTFOUND로 배포 전체가 실패한다.
 *
 * --keep-going: 실패해도 0으로 끝낸다. 공개 사이트는 DB 없이도 예시 글로 도는데,
 * DB가 잠깐 흔들렸다고 서버를 못 뜨게 하면 멀쩡한 사이트까지 내려간다.
 * 사람이 직접 부를 때(npm run migrate)는 이 옵션 없이 실패를 그대로 알린다.
 */
import pg from 'pg';
import { usernameProblem, passwordProblem, hashPassword, poolConfig } from './admin-account.mjs';

const keepGoing = process.argv.includes('--keep-going');

const url = process.env.DATABASE_URL;
if (!url) {
  // 이 줄이 배포 로그에 보이면, 웹 서비스가 DB 변수를 못 받고 있다는 뜻이다.
  // Railway → 웹 서비스 → Variables 에서 DATABASE_URL 을 ${{Postgres.DATABASE_URL}} 로 참조해야 한다.
  console.log('[migrate] DATABASE_URL이 없어 건너뜁니다. — 관리자 기능은 꺼진 상태로 배포됩니다.');
  process.exit(0);
}
const pool = new pg.Pool(poolConfig(url));

const SQL = `
create table if not exists admin_users (
  id            serial primary key,
  username      text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists sessions (
  id         serial primary key,
  token_hash text not null unique,          -- 원본 토큰은 저장하지 않는다
  user_id    integer not null references admin_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  ip         text,
  user_agent text
);
create index if not exists sessions_expires_idx on sessions (expires_at);

create table if not exists login_attempts (
  id         serial primary key,
  identifier text not null,
  success    boolean not null default false,
  at         timestamptz not null default now()
);
create index if not exists login_attempts_idx on login_attempts (identifier, at desc);

create table if not exists columns (
  id           serial primary key,
  slug         text not null unique,
  cat          text not null,
  title        text not null,
  excerpt      text not null default '',
  quote        text not null default '',
  author       text not null,
  role         text not null default '',
  read_min     integer not null default 5,
  body         jsonb not null default '{"intro":[],"sections":[],"outro":""}'::jsonb,
  published    boolean not null default false,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);
create index if not exists columns_published_idx on columns (published, published_at desc);

-- 검색 최적화 — 비우면 제목·요약을 그대로 쓴다. keywords는 쉼표 구분, 첫 번째가 핵심 키워드.
alter table columns add column if not exists seo_title text not null default '';
alter table columns add column if not exists seo_desc  text not null default '';
alter table columns add column if not exists keywords  text not null default '';

create table if not exists subscribers (
  id         serial primary key,
  email      text not null unique,
  source     text not null default '',
  ip         text,
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id         serial primary key,
  type       text not null default '출연 신청',
  name       text not null,
  business   text not null default '',
  contact    text not null,
  message    text not null default '',
  ip         text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists applications_idx on applications (read, created_at desc);
`;

/**
 * 첫 관리자 계정.
 *
 * 계정이 하나도 없을 때만 만든다 — 이미 있으면 환경변수가 남아 있어도 아무것도 하지 않으므로,
 * 배포할 때마다 비밀번호가 되돌아가거나 덮어써질 일이 없다.
 * 계정을 만든 뒤에는 Railway에서 ADMIN_PASSWORD를 지워도 된다(권장).
 */
async function bootstrapAdmin() {
  const { rows } = await pool.query(`select count(*)::int as n from admin_users`);
  if (rows[0].n > 0) return;

  const username = (process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!username && !password) {
    console.log('[migrate] 관리자 계정이 없습니다. ADMIN_USERNAME·ADMIN_PASSWORD를 설정하고 다시 배포하면 자동으로 만듭니다.');
    return;
  }
  const bad = usernameProblem(username) || passwordProblem(password);
  if (bad) {
    console.log('[migrate] 관리자 계정을 만들지 못했습니다 — ' + bad);
    return;
  }
  await pool.query(
    `insert into admin_users (username, password_hash) values ($1, $2) on conflict (username) do nothing`,
    [username, await hashPassword(password)],
  );
  console.log(`[migrate] 첫 관리자 '${username}' 생성. /admin/login 에서 로그인한 뒤 ADMIN_PASSWORD 변수는 지우세요.`);
}

try {
  await pool.query(SQL);
  // 만료 세션·오래된 로그인 기록 정리
  await pool.query(`delete from sessions where expires_at < now()`);
  await pool.query(`delete from login_attempts where at < now() - interval '7 days'`);
  await bootstrapAdmin();
  console.log('[migrate] 완료');
} catch (err) {
  console.error('[migrate] 실패:', err.message);
  if (keepGoing) console.error('[migrate] 관리자 기능 없이 계속 진행합니다. 공개 사이트는 예시 글로 동작합니다.');
  else process.exitCode = 1;
} finally {
  await pool.end();
}
