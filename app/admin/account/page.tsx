import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, LogOut, Monitor } from 'lucide-react';
import { getSessionUser, getAccountInfo } from '../../../lib/auth';
import { logoutOtherDevicesAction } from '../actions';
import ConfirmSubmit from '../ConfirmSubmit';
import PasswordForm from './PasswordForm';

export const dynamic = 'force-dynamic';

const fmt = (s: string | null) => {
  if (!s) return '기록 없음';
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} `
    + `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const info = await getAccountInfo(user.id);

  return (
    <main className="admWrap admNarrow">
      <header className="admTop">
        <div>
          <Link className="admBack" href="/admin"><ArrowLeft size={14} /> 목록</Link>
          <h1>계정</h1>
        </div>
      </header>

      <dl className="admFacts">
        <div><dt>아이디</dt><dd>{user.username}</dd></div>
        <div><dt>만든 날</dt><dd>{fmt(info?.createdAt ?? null)}</dd></div>
        <div><dt>마지막 로그인</dt><dd>{fmt(info?.lastLoginAt ?? null)}</dd></div>
        <div><dt>로그인 중인 기기</dt><dd>{info?.sessions ?? 1}대</dd></div>
      </dl>

      <section className="admPanel">
        <h2>비밀번호 바꾸기</h2>
        <p className="admPanelNote">
          바꾸고 나면 지금 이 브라우저만 남고 다른 기기의 로그인은 모두 끊깁니다.
        </p>
        <PasswordForm />
      </section>

      {(info?.sessions ?? 1) > 1 && (
        <section className="admPanel">
          <h2>다른 기기에서 로그아웃</h2>
          <p className="admPanelNote">
            <Monitor size={13} /> 지금 {info!.sessions}대에서 로그인되어 있습니다.
            공용 컴퓨터에서 로그아웃하지 않고 나온 것 같다면 여기서 모두 끊으세요.
          </p>
          <form action={logoutOtherDevicesAction}>
            <ConfirmSubmit className="admBtn ghost" message="지금 이 브라우저를 뺀 나머지 기기의 로그인을 모두 끊을까요?">
              <LogOut size={15} /> 다른 기기 모두 로그아웃
            </ConfirmSubmit>
          </form>
        </section>
      )}
    </main>
  );
}
