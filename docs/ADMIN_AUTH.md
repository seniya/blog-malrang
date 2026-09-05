# Admin authentication

Admin authentication uses the existing `users` table, bcrypt password hashes, and signed seven-day HttpOnly/Secure/SameSite=Lax cookies.

Set `SESSION_SECRET` to a unique random value of at least 32 characters in deployment. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` only in an untracked environment when creating the initial account. Then run:

```sh
npm run db:migrate
npm run db:bootstrap-admin
```

The bootstrap is idempotent: an existing username is not changed. It never logs the password or hash. Remove the initial password variables after bootstrapping. Do not commit `.env` files or secrets.

`requireAdmin(request)` in `src/lib/auth.ts` is the reusable authorization guard for future admin API handlers.
