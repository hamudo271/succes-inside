import { redirect } from 'next/navigation';
import { getSessionUser } from '../../../lib/auth';
import ColumnEditor from '../ColumnEditor';

export const dynamic = 'force-dynamic';

export default async function NewColumn() {
  if (!await getSessionUser()) redirect('/admin/login');
  return <ColumnEditor />;
}
