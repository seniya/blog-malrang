# blog.malrang.net 배포

## 구성

`compose.yaml`은 앱을 내부 Docker 포트 `3000`으로만 노출합니다. 호스트의 `80`/`443`을 publish하지 않으며, 기존 home-server reverse proxy가 공유 Docker network를 통해 `blog:3000`으로 전달해야 합니다.

```text
Internet -> existing reverse proxy (80/443, TLS) -> blog:3000
                                             |-> /app/data/blog.db
                                             |-> /app/uploads
```

## 최초 설정

1. Docker와 Compose를 설치하고, reverse proxy가 연결된 외부 network를 확인합니다.
2. 앱 디렉터리에 `.env`를 만들고(절대 커밋하지 않음) 아래처럼 설정합니다.

```env
SESSION_SECRET=<openssl rand -base64 48 결과>
# 기본값은 reverse-proxy이며, 실제 network 이름이 다르면 지정
REVERSE_PROXY_NETWORK=reverse-proxy
```

`NEXT_PUBLIC_SITE_URL`과 `DATABASE_URL`은 compose가 각각 `https://blog.malrang.net`, `/app/data/blog.db`로 고정합니다. `SESSION_SECRET`은 32자 이상의 랜덤 값이어야 합니다. 외부 network가 없다면 reverse proxy가 사용하는 정확한 이름으로 먼저 생성/연결합니다(예: `docker network create reverse-proxy`).

3. 데이터 디렉터리를 만들고 권한을 확인합니다.

```bash
mkdir -p data uploads backups
# Keep the runtime directories present in a fresh checkout.
touch backups/.gitkeep uploads/.gitkeep
# reverse proxy가 다른 compose 프로젝트라면 같은 external network에 연결
# docker network connect reverse-proxy <reverse-proxy-container>
```

## 배포 및 마이그레이션

```bash
git pull
docker compose config
docker compose build blog
docker compose run --rm blog npm run db:migrate
docker compose up -d blog
docker compose ps
docker compose logs --tail=100 blog
```

`compose.yaml`의 healthcheck는 `/api/health`를 호출합니다. DB 연결이 실패하거나 Drizzle migration ledger가 없으면 `503`을 반환하므로, 마이그레이션 전에는 ready 상태가 되지 않습니다. 마이그레이션 후에는 `docker compose exec blog node -e "fetch('http://127.0.0.1:3000/api/health').then(async r=>{console.log(r.status,await r.text());process.exit(r.ok?0:1)})"`로 확인합니다.

Reverse proxy에서 upstream을 `http://blog:3000`으로 설정하고 호스트 `blog.malrang.net`을 연결합니다. TLS 인증서, HTTP→HTTPS redirect, 외부 80/443은 기존 proxy가 담당합니다. 앱 자체에는 `ports:`가 없고 `expose: 3000`만 있습니다.

## 영속 데이터와 백업/복구

- `./data:/app/data`: SQLite와 migration metadata
- `./uploads:/app/uploads`: 업로드 파일
- 컨테이너/이미지 교체 시 두 디렉터리를 삭제하지 않습니다.
- 백업은 SQLite CLI의 online `.backup`으로 생성합니다. 운영 전에 `sqlite3`를 설치합니다.

```bash
# 서비스 중에도 일관된 백업 생성
./scripts/backup-db.sh ./data/blog.db ./backups

# 복구: 기존 DB를 백업한 뒤 서비스를 멈추고, clean staging target에 복구
docker compose down
./scripts/backup-db.sh ./data/blog.db ./backups
rm -rf ./data/restore-staging
mkdir -p ./data/restore-staging
./scripts/restore-db.sh ./backups/blog-YYYYMMDDTHHMMSSZ.db ./data/restore-staging/blog.db
mv ./data/blog.db ./data/blog.db.before-restore
mv ./data/restore-staging/blog.db ./data/blog.db
rm -rf ./data/restore-staging
docker compose run --rm blog npm run db:migrate
docker compose up -d blog
```

`YYYYMMDDTHHMMSSZ`는 실제 백업 파일명으로 바꿉니다. 복구 전 `backup-db.sh`로 현재 DB를 별도 백업하고, `restore-db.sh`는 기존 파일 덮어쓰기를 거부하므로 반드시 비어 있는 staging 경로를 사용합니다. `blog.db.before-restore`는 복구가 검증될 때까지 보관하고, 검증 실패 시 서비스를 다시 멈춘 뒤 이 파일을 원래 이름으로 되돌립니다. 업로드 파일은 DB와 별개이므로 복구 시 `uploads/`도 필요한 시점의 파일 백업에서 복원합니다.

백업 파일은 앱 데이터와 별도의 디스크/호스트에 보관하고 보존 정책을 운영자가 정합니다. 이 문서는 호스트에서 실행하는 절차이며, 현재 호스트에 `sqlite3`가 설치되어 있지 않다면 백업/복구 명령을 실행할 수 없습니다. 운영 전 `sqlite3` 설치와 실제 백업 파일 존재를 확인하세요.

## 업데이트 및 검증

```bash
docker compose pull  # registry 이미지를 쓰는 경우
docker compose build --pull blog
docker compose run --rm blog npm run db:migrate
docker compose up -d blog
curl -fsS https://blog.malrang.net/api/health
curl -I https://blog.malrang.net
```

브라우저에서 `/`, `/admin/login`, `/rss.xml`, `/sitemap.xml`도 확인합니다. `.env`, `data/`, `uploads/`, DB 파일은 Git에 포함하지 않습니다.
