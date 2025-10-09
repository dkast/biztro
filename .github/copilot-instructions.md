# Copilot / AI Agent Instructions for Biztro

These are concise, actionable rules and repo-specific conventions for AI coding agents working on this codebase.

Global agent rules (preserve):

- Always finish the user's query before returning control; continue until the task is resolved.
- Do not guess file contents — read files with tools before editing. Use exact paths: `AGENTS.md`, `package.json`, `src/`, `prisma/`, `src/env.mjs`, `src/middleware.ts`.
- Keep edits minimal and safe; prefer small, reversible changes and include tests when non-trivial.

Project overview (short):

- Next.js (App Router) + TypeScript + React. Server-first components are preferred; minimize `use client`.
- UI: shadcn / Radix / Tailwind. Forms: React Hook Form + Zod. State: `nuqs` used for URL-search state.
- Auth: `better-auth` + middleware in `src/middleware.ts` protects routes via session cookie.
- DB: Prisma with Turso for local dev (`db:dev`); `prisma generate` runs in lifecycle scripts.

Non-obvious developer workflows (exact commands):

- Dev: `bun run dev` (project uses `next dev --turbopack` via `npm/yarn/bun` scripts) — check `package.json` for `dev`.
- Ensure `prisma generate` has been run: lifecycle scripts include `postinstall`, `predev`, `prebuild` that call it.
- Local DB: `bun run db:dev` runs `turso dev --db-file local.db`.
- Stripe local webhook: `bun run stripe:listen` forwards events to `/api/webhooks/stripe` during dev.
- Content build: `bun run build:content` uses `contentlayer2 build`.

Conventions & integration points (quick references):

- Use `next-safe-action` for server actions (server-side form handlers and mutations).
- Use `nuqs` for URL search state (see `src/app/providers.tsx` and usages in `src/app/**` like filter toolbars).
- Centralized env: `src/env.mjs` (uses createEnv + zod); reference it for R2 keys, TURSO DB URL, and analytics keys.
- Auth: `src/middleware.ts` uses `better-auth/cookies` to guard routes — prefer using provided helpers.
- Prefer server components; if `use client` is required, keep the component small and well-scoped.

Files to inspect first when asked to implement or change features:

- `AGENTS.md` (canonical agent rules and expanded context)
- `package.json` (scripts and lifecycle hooks)
- `src/env.mjs` (env schema and runtime values)
- `src/middleware.ts` (auth rules)
- `prisma/` (schema & migrations)
- `src/app/providers.tsx` (nuqs provider)

Edge cases to watch for:

- Missing env vars (use `src/env.mjs` schema to validate presence).
- DB migrations vs local dev DB state (use `prisma generate` and `db:dev` appropriately).
- Routes protected by middleware — changes may require middleware/config updates.
- Large client bundles — avoid moving large logic from server to client.

When in doubt, preserve behavior and add tests or small migrations. If changes touch DB schema or auth, mention migration steps and required env updates in the PR.

Reference: See `AGENTS.md` for full, normative agent rules.
