# blog.malrang.net 구현 계획

> 이 문서는 `docs/PRODUCT.md`의 요구사항을 구현하기 위한 단계별 계획이다.

## 목표

Next.js, TypeScript, Tailwind CSS, Radix UI, TanStack Query, SQLite를 사용해 `https://blog.malrang.net`에서 운영 가능한 개인 블로그 MVP를 만든다.

## 아키텍처

Next.js App Router를 사용한다. 공개 페이지는 Server Component에서 직접 조회해 SEO와 초기 응답을 확보한다. 관리자 화면의 조회/변경은 Route Handler와 TanStack Query를 사용한다. Drizzle ORM이 SQLite 접근을 담당하며, 애플리케이션은 Docker로 실행하고 기존 Reverse Proxy 뒤에 둔다.

## 단계별 구현

### 1. 프로젝트 기반

- Next.js App Router와 TypeScript 초기화
- Tailwind CSS, Radix UI, ESLint, Prettier 설정
- `src/app`, `src/components`, `src/db`, `src/features`, `src/lib` 구조 생성
- 환경 변수 스키마와 개발용 `.env.example` 작성
- 공통 layout, theme, query provider 작성
- lint/typecheck/build 실행

### 2. 데이터 계층

- Drizzle ORM과 `better-sqlite3` 설치
- users/posts/categories/tags 및 관계 테이블 스키마 작성
- migration 설정
- database client의 개발 환경 singleton 처리
- seed 명령 작성
- 게시글 repository와 공개 글 필터 작성
- schema/repository 단위 테스트 작성

### 3. 공개 블로그

- 홈 페이지
- 게시글 상세 페이지
- 카테고리/태그 페이지
- Markdown + GFM 렌더러
- 코드 하이라이팅
- 404와 empty state
- metadata, canonical URL, sitemap, RSS
- 반응형 레이아웃과 다크 모드
- 공개 페이지 E2E 테스트

### 4. 관리자 인증

- 로그인/로그아웃 API
- 비밀번호 해시 검증
- HttpOnly/Secure 세션 쿠키
- middleware의 `/admin` 보호
- API 권한 재검증
- 로그인 성공/실패 테스트

### 5. 관리자 게시글 관리

- 관리자 게시글 목록
- 상태 필터와 검색
- 새 게시글 작성
- 게시글 수정/삭제
- draft/published 전환
- 카테고리/태그 선택
- Markdown 입력과 미리보기
- React Hook Form + Zod 검증
- TanStack Query cache invalidation
- 관리자 핵심 흐름 E2E 테스트

### 6. 운영 패키징

- production Dockerfile
- `compose.yaml`
- SQLite와 uploads bind mount
- `/api/health` endpoint와 Docker healthcheck
- Reverse Proxy 연결 문서
- `blog.malrang.net` HTTPS 검증 절차
- 데이터베이스 backup/restore 스크립트
- 운영 환경 변수 문서

### 7. 최종 품질 검증

- lint
- typecheck
- unit/integration tests
- production build
- Playwright 핵심 흐름
- Docker compose config 검증
- 로컬 컨테이너 실행 검증
- git diff와 비밀정보 노출 검토

## 권장 디렉터리 구조

```text
src/
├── app/
│   ├── (public)/
│   ├── admin/
│   ├── api/
│   ├── rss.xml/route.ts
│   ├── sitemap.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── posts/
│   ├── editor/
│   └── admin/
├── db/
│   ├── client.ts
│   ├── schema.ts
│   ├── seed.ts
│   └── migrations/
├── features/
│   ├── posts/
│   ├── categories/
│   └── tags/
├── lib/
└── providers/
```

## 의존성 방향

```text
UI components
  -> features/hooks
  -> API route handlers 또는 server queries
  -> repository/service
  -> Drizzle
  -> SQLite
```

화면 컴포넌트가 SQLite client를 직접 import하지 않는다. 인증과 입력 검증은 Route Handler와 service 계층에서 재검증한다.

## 배포 구성

```text
blog.malrang.net
  -> 기존 Reverse Proxy :443
  -> blog container :3000
  -> /app/data/blog.db
  -> /app/uploads
```

블로그 컨테이너는 호스트의 80/443 포트를 publish하지 않는다. 기존 Reverse Proxy와 공유 Docker network에 연결한다. 실제 network 이름과 proxy 종류는 배포 단계에서 현재 서버 상태를 확인해 확정한다.

## 테스트 전략

각 기능은 가능한 경우 다음 순서로 구현한다.

1. 실패하는 테스트 작성
2. 실패 확인
3. 최소 구현
4. 테스트 통과
5. 전체 회귀 테스트
6. 작은 단위로 커밋

핵심 E2E 시나리오:

- 비로그인 관리자 접근 차단
- 관리자 로그인
- draft 작성 후 공개되지 않음
- published 전환 후 홈/상세/RSS 노출
- 게시글 수정
- 게시글 삭제
- 잘못된 slug 404

## 완료 후 검증 명령

```bash
npm run lint
npm run typecheck
npm run test
npm run build
docker compose config
```

운영 연결 후에는 컨테이너 상태, 내부 health endpoint, Reverse Proxy Host 라우팅, HTTPS URL, SQLite 영속성, backup/restore를 순서대로 확인한다.

## 커밋 단위

- `docs: define blog requirements and implementation plan`
- `chore: initialize Next.js project`
- `feat: add SQLite schema and repositories`
- `feat: add public blog pages`
- `feat: add admin authentication`
- `feat: add admin post management`
- `chore: add production Docker deployment`
- `test: verify blog critical flows`
