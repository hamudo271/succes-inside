/**
 * 구조화 데이터(schema.org) 조립기.
 *
 * 원칙: 화면에 없는 사실은 넣지 않는다. 구조화 데이터는 검색엔진에 대한 진술이므로,
 * 페이지가 말하지 않는 것을 여기서 주장하면 잘못된 정보를 배포하는 것이 된다.
 * 그래서 가격·평점·재고처럼 확인되지 않은 항목은 비워 둔다.
 */
import { SITE } from './seo';
import { CHANNEL } from '../app/interviews/data';

export const ORG_ID = `${SITE}/#organization`;
export const SITE_ID = `${SITE}/#website`;

/** 발행 주체 — 로고·연락처·유튜브 채널까지 한 곳에서 정의하고 나머지는 @id로 참조한다. */
export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: '성공인사이드',
    alternateName: 'Success Inside',
    url: SITE,
    description:
      '성공한 결과가 아니라 결정의 이유를 남기는 인터뷰 미디어. ' +
      `${CHANNEL.since}년부터 ${CHANNEL.interviews}명의 사장님을 찾아가 하루를 기록했습니다.`,
    email: CHANNEL.applyEmail,
    foundingDate: CHANNEL.since,
    logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png`, width: 512, height: 512 },
    image: `${SITE}/og.jpg`,
    sameAs: [CHANNEL.url],
    areaServed: { '@type': 'Country', name: '대한민국' },
    knowsLanguage: 'ko-KR',
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE,
    name: '성공인사이드',
    description: '사업가의 하루를 기록하는 인터뷰 미디어',
    inLanguage: 'ko-KR',
    publisher: { '@id': ORG_ID },
  };
}

/** 사이트 어디에나 들어가는 뿌리 — 레이아웃에서 한 번만 심는다. */
export function siteGraph() {
  return { '@context': 'https://schema.org', '@graph': [organization(), website()] };
}

type Crumb = { name: string; path: string };

/** 홈을 첫 마디로 두고 나머지를 잇는다. path는 '/interviews'처럼 앞에 슬래시. */
export function breadcrumb(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: '홈', path: '' }, ...items].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  };
}

/** 목록형 페이지 한 장 — 무엇을 모아 둔 곳인지 알린다. */
export function collectionPage(o: {
  path: string; name: string; description: string; crumbs: Crumb[]; items?: unknown;
}) {
  const url = `${SITE}${o.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: o.name,
        description: o.description,
        inLanguage: 'ko-KR',
        isPartOf: { '@id': SITE_ID },
        publisher: { '@id': ORG_ID },
        ...(o.items ? { mainEntity: o.items } : {}),
      },
      breadcrumb(o.crumbs),
    ],
  };
}

/**
 * 목록의 항목들. 외부(유튜브)로 나가는 링크도 그대로 적는다 —
 * 영상이 이 페이지에서 재생되지 않으므로 VideoObject로는 표시하지 않는다.
 */
export function itemList(entries: { name: string; url: string }[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: entries.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: entries.map((e, i) => ({
      '@type': 'ListItem', position: i + 1, name: e.name, url: e.url,
    })),
  };
}

export function faqPage(qa: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: qa.map(x => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}
