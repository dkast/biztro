# GitHub Copilot Instructions (Biztro)

This file is intentionally short. The canonical repo rules live in `AGENTS.md`.

Before editing code:

- Read `AGENTS.md` and follow it.
- Do not guess file contents; open files before changing them.
- Keep changes minimal and consistent with existing patterns.

High-signal repo conventions:

- Next.js App Router; prefer React Server Components, minimize `use client`.
- Server mutations: use `next-safe-action`.
- URL query state: use `nuqs`.
- Auth: `better-auth`; route protection logic is centralized in `src/proxy.ts`.
- Env: source of truth is `src/env.mjs`.
- DB: Prisma + Turso; if you change `prisma/schema.prisma`, create/describe the migration steps.

Common commands (bun):

- `bun run dev`, `bun run lint`, `bun run typecheck`, `bun run db:dev`.
