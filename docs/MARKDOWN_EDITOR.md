# 관리자 Markdown 에디터

## 목적

관리자가 새 글 작성 및 글 수정 화면에서 Markdown 본문을 편리하게 작성하고, 저장 전에 렌더링 결과를 확인할 수 있도록 한다.

## 제공 기능

- Markdown 본문 입력
- 데스크톱 분할 화면: 입력 영역과 실시간 미리보기
- 모바일 세로 배치: 입력 영역 다음에 미리보기 표시
- 툴바 명령
  - 굵게
  - 기울임
  - 소제목
  - 인용
  - 링크
  - 이미지 링크
  - 순서 없는 목록
  - 순서 있는 목록
  - 인라인 코드
- 키보드 단축키
  - `Ctrl/Cmd+B`: 굵게
  - `Ctrl/Cmd+I`: 기울임
  - `Ctrl/Cmd+K`: 링크
- 선택 영역을 유지한 Markdown 삽입
- GFM 문법 지원 — 표, 체크리스트, 취소선 등
- raw HTML 비활성화로 본문 XSS 위험 완화

## 구현 위치

- `src/components/admin/markdown-editor.tsx`
  - 제어 컴포넌트 형태의 에디터
  - 툴바와 단축키 처리
  - Markdown 명령 적용 함수
  - 입력/미리보기 반응형 레이아웃
- `src/components/admin/post-form.tsx`
  - React Hook Form의 `Controller`로 에디터 연결
- `src/components/admin/markdown-editor.test.ts`
  - 굵게 처리 및 선택 영역 유지
  - 링크 템플릿 삽입
  - 여러 줄 목록 변환

## 저장 형식

게시글 본문은 기존 정책과 같이 Markdown 원문으로 `posts.content`에 저장한다. 미리보기는 저장 시 HTML로 변환하지 않고 `Markdown` 컴포넌트를 통해 렌더링한다.

## 검증

```bash
npm run lint
npm run typecheck
SESSION_SECRET="$(openssl rand -base64 48)" npm test
SESSION_SECRET="$(openssl rand -base64 48)" npm run build
git diff --check
```

2026-09-05 기준 위 검증을 모두 통과했다.
