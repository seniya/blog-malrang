# blog.malrang.net

개발과 일상을 기록하는 개인 블로그입니다. Next.js App Router, SQLite, Drizzle ORM을 사용합니다.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open http://localhost:3000. `SESSION_SECRET` is required and must be a fresh 32+ character value; generate it with `openssl rand -base64 48`. Set `ADMIN_USERNAME` and an `ADMIN_PASSWORD` of at least 8 characters before `npm run db:bootstrap-admin`. To change an existing account's password, run `npm run db:reset-admin-password` with the same variables.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Database

`DATABASE_URL` accepts a SQLite path and defaults to `./data/blog.db`.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Production deployment

Production packaging is in `Dockerfile` and `compose.yaml`. The image runs Next standalone as a non-root `node` user, mounts `./data` and `./uploads`, and exposes only internal port 3000. It does not publish host ports 80/443. Set `SESSION_SECRET` and optionally `REVERSE_PROXY_NETWORK` in an untracked `.env`, then run the migration and startup commands in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). The existing reverse proxy must route `blog.malrang.net` to `blog:3000` on the same external Docker network. Health is `GET /api/health`; it returns 503 until the database is reachable and migrations have created their ledger.

Never put secrets in Git. Use `scripts/backup-db.sh` and `scripts/restore-db.sh` for SQLite backup/restore; see the deployment guide for retention and recovery steps.
