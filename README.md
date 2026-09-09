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

## 관리자 (`/admin`)

칼럼 작성·발행, 출연 신청 확인, 뉴스레터 구독자 내려받기. PostgreSQL이 붙어 있을 때만 켜집니다.

### 처음 붙일 때 (Railway)

1. 프로젝트에 **PostgreSQL**을 추가합니다.
2. **웹 서비스**의 Variables에 다음을 넣습니다. Postgres를 추가하는 것만으로는 웹 서비스에 값이 들어가지 않습니다.

   | 변수 | 값 |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (변수 참조) |
   | `ADMIN_USERNAME` | 영문·숫자·`._-` 3~32자 |
   | `ADMIN_PASSWORD` | 12자 이상, 소문자·대문자·숫자·기호 중 3종류 이상 |

3. 배포하면 `scripts/migrate.mjs`가 테이블을 만들고 **계정이 하나도 없을 때만** 첫 관리자를 만듭니다.
   배포 로그에 `[migrate] 완료`가 보이면 성공입니다. `DATABASE_URL이 없어 건너뜁니다`가 보이면 2번이 안 된 것입니다.
4. `/admin/login`으로 로그인한 뒤 **`ADMIN_PASSWORD` 변수를 지웁니다.** 이후 비밀번호는 `/admin/account`에서 바꿉니다.

계정이 이미 있으면 3번은 아무것도 하지 않습니다 — 배포할 때마다 비밀번호가 되돌아가지 않습니다.
비밀번호를 잊었다면 `ADMIN_USERNAME`·`ADMIN_PASSWORD`를 채우고 `npm run create-admin`으로 강제로 다시 세웁니다(기존 세션은 모두 끊깁니다).

### 로컬

```bash
createdb successinside_dev
echo 'DATABASE_URL=postgresql://localhost:5432/successinside_dev' > .env.local
npm run migrate
ADMIN_USERNAME=admin ADMIN_PASSWORD='...' npm run create-admin
```

DB가 없어도 공개 사이트는 `app/columns/data.ts`의 예시 글로 정상 동작합니다.
관리자에서 첫 글을 발행하면 예시는 사라지고 실제 글만 보입니다.

## 콘텐츠 원칙

`소스/`의 수집 자료는 **정보 구조 참고용**입니다. 수집한 페이지에 등장하는 실명 인물·소속·이력은 옮기지 않습니다. 등장하는 인물과 과정은 모두 성공인사이드용으로 새로 작성한 예시입니다. 설계 근거는 [docs/superpowers/specs](docs/superpowers/specs)에 있습니다.

## 다음 단계

칼럼 9편·교육 과정 9개의 실제 내용 교체, 인터뷰 영상을 페이지에 임베드해 VideoObject 구조화 데이터 추가,
과정 상세 페이지(`/programs/[id]`), 네이버 서치어드바이저·구글 서치콘솔 소유 확인.
