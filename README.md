# 성공인사이드

사업가와 실무자를 위한 커뮤니티 프런트엔드 MVP입니다. SiteSucker로 수집한 자료는 정보 구조 참고에만 사용했고, 코드와 브랜드·콘텐츠는 새로 작성했습니다.

```bash
npm install
npm run dev
```

## 페이지

| 경로 | 내용 |
|---|---|
| `/` | 홈. 카테고리·검색 필터, 좋아요/북마크, 글쓰기 모달, 인기 글·멤버·뉴스레터 UI |
| `/programs` | 교육 과정. 강사진, 정기 과정 4개, VOD 과정 5개(아코디언), 과정 유형 필터 |
| `/about` | 서비스 소개. Why us, Success OS(진행 순서), What you get, FAQ |

헤더와 푸터는 `app/components/SiteHeader.tsx`, `SiteFooter.tsx`로 공용화되어 있습니다.

## 콘텐츠 원칙

`소스/`의 수집 자료는 **정보 구조 참고용**입니다. 수집한 페이지에 등장하는 실명 인물·소속·이력은 옮기지 않습니다. 등장하는 인물과 과정은 모두 성공인사이드용으로 새로 작성한 예시입니다. 설계 근거는 [docs/superpowers/specs](docs/superpowers/specs)에 있습니다.

## 다음 단계

Supabase Auth + Postgres, 게시글/댓글 CRUD, 이미지 업로드, 운영자 신고·승인, SEO 상세 페이지, 과정 상세 페이지(`/programs/[id]`)와 신청 폼 연동.
