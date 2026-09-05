# blog.malrang.net 배포 메모

## 목표 구조

```text
https://blog.malrang.net
        |
        v
기존 Reverse Proxy (80/443)
        |
        v
blog container:3000
        |
        +-- host/data:/app/data
        +-- host/uploads:/app/uploads
```

## Reverse Proxy 원칙

- 블로그 컨테이너는 80/443을 직접 publish하지 않는다.
- 기존 Reverse Proxy와 공유 Docker network를 사용한다.
- `blog.malrang.net`을 블로그 컨테이너의 `3000` 포트로 전달한다.
- HTTPS 인증서와 HTTP→HTTPS 리다이렉트는 Reverse Proxy가 담당한다.

## 운영 환경 변수

```env
NODE_ENV=production
DATABASE_URL=/app/data/blog.db
SESSION_SECRET=<random-secret>
NEXT_PUBLIC_SITE_URL=https://blog.malrang.net
```

`.env` 파일에는 비밀값을 저장하며 Git에 커밋하지 않는다.

## 영속 데이터

- SQLite: `data/blog.db`
- 업로드: `uploads/`
- 컨테이너 재생성 후에도 두 경로의 데이터가 유지되어야 한다.

## 배포 순서

```bash
git pull
docker compose build blog
docker compose run --rm blog npm run db:migrate
docker compose up -d blog
docker compose logs --tail=100 blog
```

## 검증 순서

```bash
docker compose ps
curl -fsS http://127.0.0.1:<proxy-or-health-port>/api/health
curl -I https://blog.malrang.net
```

최종적으로 다음을 브라우저에서 확인한다.

- `https://blog.malrang.net`
- `https://blog.malrang.net/admin/login`
- `https://blog.malrang.net/rss.xml`
- `https://blog.malrang.net/sitemap.xml`

## 백업

SQLite 백업은 운영 서비스와 별도의 정기 작업으로 구성한다. 백업 생성과 복구를 실제로 한 번씩 검증한 뒤 운영 전환한다.
