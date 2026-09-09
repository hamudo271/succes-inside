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
          : <div className="admNotice">
              <p>
                이 서버는 <code>DATABASE_URL</code>을 받지 못했습니다. Railway에 PostgreSQL을 추가하는 것만으로는
                웹 서비스에 값이 들어가지 않습니다.
              </p>
              <ol>
                <li>Railway → <b>웹 서비스</b> → Variables → <code>DATABASE_URL</code> 을
                    <code>{'${{Postgres.DATABASE_URL}}'}</code> 로 추가</li>
                <li>같은 화면에서 <code>ADMIN_USERNAME</code>·<code>ADMIN_PASSWORD</code> 추가 (첫 계정이 자동으로 만들어집니다)</li>
                <li>다시 배포한 뒤 배포 로그에 <code>[migrate] 완료</code> 가 보이는지 확인</li>
              </ol>
            </div>}
      </div>
    </main>
  );
}
