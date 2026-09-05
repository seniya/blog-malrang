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

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The database schema, migrations, authentication, and admin UI are intentionally deferred to later implementation phases. `DATABASE_URL` is documented now so the local environment is ready for the Drizzle/SQLite data layer.
