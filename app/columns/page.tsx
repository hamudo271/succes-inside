import { getColumns } from '../../lib/columns';
import ColumnsView from './ColumnsView';

// 관리자가 글을 발행하면 바로 반영되도록 요청 시마다 조회한다.
export const dynamic = 'force-dynamic';

export default async function ColumnsPage() {
  const all = await getColumns();
  const featured = all.find(c => c.featured) ?? all[0]!;
  const list = all.filter(c => c.id !== featured.id);
  return <ColumnsView featured={featured} list={list} />;
}
