import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PenLine, LogOut, Eye, EyeOff, Trash2, Star, ExternalLink } from 'lucide-react';
import { getSessionUser } from '../../lib/auth';
import { getAllColumnsForAdmin } from '../../lib/columns';
import { logoutAction, deleteColumnAction, togglePublishAction } from './actions';

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
  const rows = await getAllColumnsForAdmin();

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
    </main>
  );
}
