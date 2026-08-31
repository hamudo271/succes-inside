import { redirect } from 'next/navigation';
import { getSessionUser } from '../../../lib/auth';
import { dbEnabled } from '../../../lib/db';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin');

  return (
    <main className="admLogin">
      <div className="admLoginCard">
        <span className="admBrand">성공인사이드</span>
        <h1>관리자 로그인</h1>
        {dbEnabled
          ? <LoginForm />
          : <p className="admNotice">
              데이터베이스가 아직 연결되지 않았습니다. Railway에서 PostgreSQL을 추가하고
              <code>DATABASE_URL</code> 환경변수를 설정한 뒤 다시 시도해 주세요.
            </p>}
      </div>
    </main>
  );
}
