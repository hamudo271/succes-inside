import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PenLine, LogOut, Eye, EyeOff, Trash2, Star, ExternalLink, MailOpen, Mail, Users } from 'lucide-react';
import { getSessionUser } from '../../lib/auth';
import { getAllColumnsForAdmin, getApplications, getSubscriberStats } from '../../lib/columns';
import { logoutAction, deleteColumnAction, togglePublishAction, toggleApplicationReadAction, deleteApplicationAction } from './actions';

export const dynamic = 'force-dynamic';

const fmt = (s: string) => {
  const d = new Date(s);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export default async function AdminHome({
  searchParams,
}: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const sp = await searchParams;
  const [rows, apps, subs] = await Promise.all([getAllColumnsForAdmin(), getApplications(), getSubscriberStats()]);
  const unread = apps.filter(a => !a.read).length;

  return (
    <main className="admWrap">
      <header className="admTop">
        <div>
          <span className="admBrand">성공인사이드 관리자</span>
          <h1>칼럼 관리</h1>
        </div>
        <div className="admTopActions">
          <span className="admUser">{user.username}</span>
          <Link className="admBtn" href="/admin/new"><PenLine size={15} /> 새 칼럼</Link>
          <form action={logoutAction}>
            <button className="admBtn ghost" type="submit"><LogOut size={15} /> 로그아웃</button>
          </form>
        </div>
      </header>

      {sp.saved && <p className="admFlash">저장했습니다.</p>}
      {sp.deleted && <p className="admFlash">삭제했습니다.</p>}

      {rows.length === 0 ? (
        <div className="admEmpty">
          <p>아직 작성한 칼럼이 없습니다.</p>
          <p className="sub">
            지금 <code>/columns</code>에는 초기 예시 글이 보이고 있으며,
            여기서 첫 글을 발행하면 그 글로 대체됩니다.
          </p>
          <Link className="admBtn" href="/admin/new"><PenLine size={15} /> 첫 칼럼 쓰기</Link>
        </div>
      ) : (
        <div className="admTable">
          <div className="admRow admHead">
            <span>제목</span><span>카테고리</span><span>글쓴이</span><span>수정일</span><span>상태</span><span />
          </div>
          {rows.map(r => (
            <div className="admRow" key={r.id}>
              <span className="admTitle">
                {r.featured && <i className="admStar" title="대표 글"><Star size={12} fill="currentColor" /></i>}
                <Link href={`/admin/edit/${r.id}`}>{r.title}</Link>
              </span>
              <span>{r.cat}</span>
              <span>{r.author}</span>
              <span className="admDim">{fmt(r.updated_at)}</span>
              <span>
                <em className={r.published ? 'admPill on' : 'admPill'}>
                  {r.published ? '공개' : '비공개'}
                </em>
              </span>
              <span className="admRowActions">
                {r.published && (
                  <a href={`/columns/${r.slug}`} target="_blank" rel="noreferrer" title="사이트에서 보기">
                    <ExternalLink size={15} />
                  </a>
                )}
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" title={r.published ? '비공개로 전환' : '공개로 전환'}>
                    {r.published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </form>
                <form action={deleteColumnAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="danger" title="삭제">
                    <Trash2 size={15} />
                  </button>
                </form>
              </span>
            </div>
          ))}
        </div>
      )}

      <section className="admBlock">
        <div className="admBlockHead">
          <h2>출연·문의 신청 {unread > 0 && <em className="admBadge">{unread} 새 신청</em>}</h2>
          <span className="admDim"><Users size={13} /> 뉴스레터 구독자 {subs.count.toLocaleString()}명</span>
        </div>
        {apps.length === 0 ? (
          <p className="admEmptyLine">아직 접수된 신청이 없습니다. 사이트의 ‘출연 신청’ 버튼으로 들어온 신청이 여기에 쌓입니다.</p>
        ) : (
          <div className="admApps">{apps.map(a => (
            <details className={a.read ? 'admApp read' : 'admApp'} key={a.id}>
              <summary>
                <em className="admPill">{a.type}</em>
                <b>{a.name}</b>
                {a.business && <span className="admDim">{a.business}</span>}
                <span className="admDim right">{fmt(a.created_at)}</span>
              </summary>
              <div className="admAppBody">
                <p className="admAppContact">연락처 — {a.contact}</p>
                <p className="admAppMsg">{a.message}</p>
                <div className="admAppActions">
                  <form action={toggleApplicationReadAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="admBtn ghost">
                      {a.read ? <><Mail size={14} /> 안 읽음으로</> : <><MailOpen size={14} /> 읽음 처리</>}
                    </button>
                  </form>
                  <form action={deleteApplicationAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="admBtn ghost danger"><Trash2 size={14} /> 삭제</button>
                  </form>
                </div>
              </div>
            </details>
          ))}</div>
        )}
      </section>
    </main>
  );
}
