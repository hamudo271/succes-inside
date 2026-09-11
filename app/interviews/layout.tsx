import type { Metadata } from 'next';
import JsonLd from '../components/JsonLd';
import { pageMeta } from '../../lib/seo';
import { collectionPage, itemList } from '../../lib/schema';
import { CHANNEL, interviews, cats, watchUrl } from './data';

const DESC = `${CHANNEL.since}년 ${CHANNEL.origin}에서 시작해 ${CHANNEL.interviews}명의 사장님의 하루를 따라갔습니다. 요식업·뷰티·온라인 등 업종별 인터뷰를 조회수 순으로 봅니다.`;

export const metadata: Metadata = pageMeta({
  path: '/interviews',
  title: '인터뷰',
  description: DESC,
  keywords: ['사장님 인터뷰', '자영업 인터뷰', '창업 인터뷰', '성공인사이드 인터뷰', ...cats.filter(c => c !== '전체')],
});

/** 조회수 순 목록. 영상은 유튜브에서 재생되므로 VideoObject가 아니라 링크 목록으로 적는다. */
const schema = collectionPage({
  path: '/interviews',
  name: `인터뷰 — ${CHANNEL.interviews}명의 하루`,
  description: DESC,
  crumbs: [{ name: '인터뷰', path: '/interviews' }],
  items: itemList(
    [...interviews].sort((a, b) => b.views - a.views)
      .map(v => ({ name: v.title, url: watchUrl(v.id) })),
  ),
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={schema} />{children}</>;
}
