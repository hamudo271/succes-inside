/**
 * 스키마 생성 (여러 번 실행해도 안전).
 *   DATABASE_URL=... node scripts/migrate.mjs
 * Railway에서는 배포 시 자동 실행된다 (package.json의 build 스크립트).
 */
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.log('[migrate] DATABASE_URL이 없어 건너뜁니다.');
  process.exit(0);
}
const internal = url.includes('.railway.internal') || url.includes('localhost') || url.includes('127.0.0.1');
const pool = new pg.Pool({
  connectionString: url,
  ssl: internal ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15_000,
});

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
`;

try {
  await pool.query(SQL);
  // 만료 세션·오래된 로그인 기록 정리
  await pool.query(`delete from sessions where expires_at < now()`);
  await pool.query(`delete from login_attempts where at < now() - interval '7 days'`);
  console.log('[migrate] 완료');
} catch (err) {
  console.error('[migrate] 실패:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
