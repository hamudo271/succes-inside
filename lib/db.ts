import { Pool } from 'pg';

// DATABASE_URL이 없으면 DB 기능 전체를 끈다.
// (Railway에 DB를 붙이기 전에도 공개 사이트는 정적 데이터로 정상 동작해야 한다.)
export const dbEnabled = Boolean(process.env.DATABASE_URL);

declare global {
  // 개발 중 핫리로드로 커넥션 풀이 계속 늘어나는 것을 막는다.
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const url = process.env.DATABASE_URL!;
  // Railway 내부 네트워크(*.railway.internal)는 TLS를 쓰지 않는다.
  const internal = url.includes('.railway.internal') || url.includes('localhost') || url.includes('127.0.0.1');
  return new Pool({
    connectionString: url,
    ssl: internal ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!dbEnabled) throw new Error('DATABASE_URL is not set');
  if (!global.__pgPool) global.__pgPool = createPool();
  return global.__pgPool;
}

/**
 * 파라미터 바인딩 전용 쿼리 헬퍼.
 * 값은 반드시 $1, $2 자리표시자로 넘긴다 — 문자열 결합 금지(SQL 인젝션 방지).
 */
export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

/** DB가 꺼져 있거나 장애일 때 공개 페이지가 죽지 않도록 감싼다. */
export async function tryQuery<T = unknown>(text: string, params: unknown[] = []): Promise<T[] | null> {
  if (!dbEnabled) return null;
  try {
    return await query<T>(text, params);
  } catch (err) {
    console.error('[db] query failed:', (err as Error).message);
    return null;
  }
}
