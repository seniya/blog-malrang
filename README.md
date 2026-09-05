# blog.malrang.net

개발과 일상을 기록하는 개인 블로그입니다. Next.js App Router 기반으로 운영하며, SQLite와 Drizzle ORM을 데이터 계층으로 사용합니다.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open http://localhost:3000.

`SESSION_SECRET` is required in every runtime and must be at least 32 characters without placeholder text. Generate one with `openssl rand -base64 32`. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` before running `npm run db:bootstrap-admin`.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For local checks, supply a fresh temporary secret explicitly:

```bash
export SESSION_SECRET="$(openssl rand -base64 48)"
npm run lint
npm run typecheck
npm test
npm run build
```

## Database

The SQLite/Drizzle data layer is available through the following commands. `DATABASE_URL` accepts a SQLite path and defaults to `./data/blog.db`.

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:seed` is safe to run repeatedly and creates a sample published post, category, and tag without requiring authentication. SQLite files are ignored by Git.
