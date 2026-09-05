# blog.malrang.net 기능 및 제품 요구사항

## 1. 목표

`blog.malrang.net`에서 관리자가 Markdown 글을 작성하고 발행하며, 방문자는 빠르고 읽기 쉬운 블로그 글을 조회할 수 있는 개인 블로그를 구축한다.

## 2. 운영 환경

- 서비스 URL: `https://blog.malrang.net`
- 배포 방식: 홈 서버의 Docker 컨테이너
- 외부 진입점: 기존 Reverse Proxy(Caddy 또는 Nginx)
- 애플리케이션 내부 포트: `3000`
- 데이터베이스: SQLite
- 데이터 보존 경로: 호스트의 `data/`와 `uploads/`
- HTTPS: 기존 Reverse Proxy의 자동 인증서/HTTPS 처리

애플리케이션 컨테이너는 80/443 포트를 직접 사용하지 않는다. Reverse Proxy와 공유 Docker 네트워크에 연결하고 `blog:3000`으로 라우팅한다.

## 3. MVP 사용자

### 방문자

- 최신 글 목록 조회
- 게시글 상세 조회
- 카테고리별 조회
- 태그별 조회
- 다크 모드 사용
- RSS 구독
- 검색 엔진에서 페이지 발견

### 관리자

- 로그인/로그아웃
- 글 작성/수정/삭제
- 임시 저장
- 글 공개/비공개 전환
- 카테고리와 태그 지정
- Markdown 미리보기

초기 버전은 관리자 1명을 지원한다. 방문자 회원가입, 댓글, 좋아요, 다중 관리자 계정은 MVP 이후 기능이다.

## 4. URL 구조

- `/` - 최신 글과 블로그 소개
- `/posts/[slug]` - 게시글 상세
- `/categories/[slug]` - 카테고리별 게시글
- `/tags/[slug]` - 태그별 게시글
- `/admin/login` - 관리자 로그인
- `/admin/posts` - 관리자 글 목록
- `/admin/posts/new` - 새 글 작성
- `/admin/posts/[id]/edit` - 글 수정
- `/rss.xml` - RSS 피드
- `/sitemap.xml` - 사이트맵
- `/api/health` - 운영 상태 확인

## 5. 게시글 상태

- `draft`: 관리자에게만 표시
- `published`: 공개 페이지와 RSS에 표시

공개 페이지의 모든 조회는 `published` 상태인 게시글만 반환해야 한다.

## 6. 데이터 모델

### users

- `id`
- `username` (unique)
- `password_hash`
- `created_at`
- `updated_at`

### posts

- `id`
- `title`
- `slug` (unique)
- `excerpt`
- `content` (Markdown)
- `cover_image_url` (nullable)
- `status` (`draft` | `published`)
- `published_at` (nullable)
- `created_at`
- `updated_at`

### categories

- `id`
- `name`
- `slug` (unique)
- `description`
- `created_at`
- `updated_at`

### tags

- `id`
- `name`
- `slug` (unique)
- `created_at`
- `updated_at`

### 관계 테이블

- `post_categories(post_id, category_id)`
- `post_tags(post_id, tag_id)`

## 7. 기술 요구사항

- Next.js App Router
- TypeScript
- Tailwind CSS
- Radix UI 기반 공통 UI
- TanStack Query는 관리자 조회/변경 화면에 사용
- Drizzle ORM + `better-sqlite3`
- Zod 입력 검증
- React Hook Form 관리자 폼
- Markdown 렌더링과 GFM 지원
- raw HTML은 기본적으로 비활성화하거나 sanitize
- 관리자 세션은 HttpOnly/Secure 쿠키 사용
- 비밀번호는 Argon2 또는 bcrypt로 해시
- 모바일/데스크톱 반응형 지원
- 페이지별 metadata와 canonical URL 설정

## 8. 품질 및 보안 요구사항

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test` 통과
- `npm run build` 통과
- 핵심 사용자 흐름 Playwright 테스트
- 비로그인 관리 경로 접근 차단
- draft 게시글 외부 노출 차단
- Markdown XSS 방지
- 업로드 기능 추가 시 MIME 타입/확장자/크기 검증
- `.env`, SQLite 파일, 업로드 파일을 Git에 포함하지 않음

## 9. 운영 요구사항

- SQLite 파일은 컨테이너 외부 bind mount로 보존
- 업로드 디렉터리도 컨테이너 외부에 보존
- `/api/health`로 컨테이너 상태 확인
- Reverse Proxy 뒤에서만 외부 공개
- HTTP에서 HTTPS로 리다이렉트
- SQLite 정기 백업 및 복구 절차 문서화
- 배포 전 migration 실행

## 10. MVP 완료 기준

다음 흐름이 실제로 동작해야 한다.

1. 방문자가 `https://blog.malrang.net`에 접속한다.
2. 발행된 게시글이 최신순으로 표시된다.
3. 게시글 상세 URL에서 Markdown 본문을 읽을 수 있다.
4. 비로그인 사용자는 `/admin`을 사용할 수 없다.
5. 관리자가 로그인한다.
6. 관리자가 Markdown 게시글을 draft로 저장한다.
7. draft 게시글이 공개 페이지에 노출되지 않는다.
8. 관리자가 게시글을 published로 변경한다.
9. 게시글이 홈, 상세 페이지, RSS에 노출된다.
10. 컨테이너를 재시작해도 게시글이 유지된다.
