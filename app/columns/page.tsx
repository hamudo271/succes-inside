import type { Metadata } from 'next';
import { getColumns } from '../../lib/columns';
import ColumnsView from './ColumnsView';

const DESC = '인터뷰 현장에서 본 것을 매주 한 편의 관점으로 씁니다. 창업·마케팅·브랜딩·커리어 — 사장님의 결정을 돕는 칼럼.';
export const metadata: Metadata = {
  title: '칼럼',
  description: DESC,
  alternates: { canonical: '/columns' },
  openGraph: { url: '/columns', title: '칼럼 | 성공인사이드', description: DESC },
};

// 관리자가 글을 발행하면 바로 반영되도록 요청 시마다 조회한다.
export const dynamic = 'force-dynamic';

export default async function ColumnsPage() {
  const all = await getColumns();
  const featured = all.find(c => c.featured) ?? all[0]!;
  const list = all.filter(c => c.id !== featured.id);
  return <ColumnsView featured={featured} list={list} />;
}
