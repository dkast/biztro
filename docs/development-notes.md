# Development Notes

These notes cover implementation and maintenance details that are not needed
for a project overview. For repository-wide contributor guidance, see
[`../AGENTS.md`](../AGENTS.md).

## Better Auth account schema compatibility

Better Auth 1.7.3 and newer no longer write the `issuer` account field introduced
in 1.7.0-1.7.2. Migration `20261116210000_relax_legacy_account_issuer` makes that
legacy column nullable, preserves its stored values and restores uniqueness on
`provider` and `providerAccountId`. It stops before changing permanent tables if
those identity keys collide; review conflicting accounts manually rather than
deleting or merging them automatically.

The [linking error reference](https://better-auth.com/docs/reference/errors/unable_to_link_account)
lists both provider trust configuration and database failures. Adding Google to
`account.accountLinking.trustedProviders` does not fix a required `issuer` column.
See the [1.7 upgrade guide](https://better-auth.com/docs/guides/1-7-upgrade-guide#relax-the-constraint)
for the legacy constraint fix.

Back up the target database and stop auth writers before applying migrations.
Verify the datasource in `prisma.config.ts` targets the same database used by
the app (`TURSO_DATABASE_URL`); client generation alone does not migrate it.
For a local SQLite database, explicitly set `LOCAL_DATABASE_URL` to its file URL
before running `bun run prisma:migrate`. For remote Turso, apply the migration
through your Turso deployment workflow; do not assume the CLI's local fallback
targets the remote database. Then run `bunx prisma generate` and restart the app.

## Closing report performance

Development builds enable Next.js Request Insights. After loading
`/dashboard/sales/closing`, use the dev server's `/_next/mcp`
`get_request_insights` tool to inspect request durations, server fetches and
cache behavior. Compare an initial load, a date change and a repeat client
navigation with DevTools **Disable cache** off. Hard reloads with
`Cache-Control: no-cache` bypass development caches.

Run the isolated, in-memory database regression benchmark with:

```sh
bun run test src/server/actions/sales/__tests__/closing-queries.test.ts --reporter=verbose --silent=false
```

It reports elapsed report time, SQL statement count and individual statement
durations through Prisma query events, plus per-operation timings and top-level
result row counts, without logging SQL parameters or using the application
database. Summed statement durations are not wall-clock latency because
operations can overlap. Local SQLite timings do not predict remote Turso latency.

The populated fixture went from 19 to 13 SQL statements (10 to 8 top-level
database operations). Complete report snapshots verify identical financial
output. Counts vary with relation data; they exclude page authentication and
layout queries. Selected and previous-day financial rows share two range reads.
Credit history uses a parameterized existence query instead of transferring
historical sales/allocations, and still includes credit later settled through
receivable payments.

Private report caching is unchanged: client router reuse follows `stale: 30`;
it is not a persistent cross-request production server cache. Request Insights
is development-only.

## Project conventions

- Prefer React Server Components and keep `use client` scopes small.
- Use `next-safe-action` for server mutations and call `reset()` in client action
  handlers after success or handled errors.
- Use React Hook Form + Zod for forms and validation.
- Manage URL search state with `nuqs`.
- Keep authentication and route protection centralized in `src/proxy.ts`.
- Treat `src/env.mjs` as the source of truth for environment variables.
- Gate Pro-only creation/generation flows on the server. Client plan state is UX
  only.
- Prisma migrations live under `prisma/migrations`; run `bunx prisma generate`
  after schema changes.
