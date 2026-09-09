/**
 * 구조화 데이터를 <head>가 아닌 본문에 심는다 — 검색엔진은 위치를 가리지 않는다.
 * JSON 안의 '<'를 이스케이프해 </script> 주입을 막는다.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
