## Biztro

> [!NOTE]
> This is a WORK IN PROGRESS.

[![DeepSource](https://deepsource.io/gh/dkast/biztro.svg/?label=active+issues&show_trend=true&token=ka1uwQTdoJTIVeRZl6gI7ERb)](https://deepsource.io/gh/dkast/biztro/?ref=repository-badge)

Biztro is a mobile-first, server-first Next.js application for creating, editing and publishing digital menus.
It uses a modern TypeScript + React stack with Prisma for persistence and Tailwind for styling.

## Core stack

- Next.js (App Router) + TypeScript
- React 19 (server components preferred)
- Tailwind CSS + tailwindcss-animate
- Shadcn UI + Radix UI primitives
- Prisma (LibSQL adapter) — Turso used for local/dev
- Authentication: Better-auth
- Server actions: next-safe-action
- Forms & validation: React Hook Form + Zod
- Data caching: @tanstack/react-query
- Analytics & monitoring: PostHog + Sentry
- File uploads: Uppy (S3 / R2 adapters)
- Payments: Stripe

## Useful files

- `package.json` — scripts and dependency list
- `src/env.mjs` — environment schema and required variables
- `prisma.config.ts` — Prisma adapter config
- `prisma/schema.prisma` — database schema
- `AGENTS.md` — repo conventions and agent rules
- `src/app/config.ts` — application limits and defaults

## Quick start / configuration

Follow these steps to configure and run the project locally.

1. Install dependencies

```pwsh
npm install
```

2. Generate Prisma client

Lifecycle scripts run `prisma generate` automatically, but you can run it manually:

```pwsh
npm run predev
# or
npx prisma generate
```

3. Configure environment variables

- Create a `.env` file at the project root (or set env vars in your shell). The required variables are validated in `src/env.mjs`.
- Important variables include Turso/LibSQL URL and keys, R2 credentials, Stripe keys, Better-auth keys, and analytics/Sentry keys.

4. Start a local dev database

```pwsh
npm run db:dev
```

This starts a local Turso development database using `local.db`.

5. Start the dev server

```pwsh
npm run dev
```

6. Common scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run prisma:migrate` — apply Prisma migrations (deploy)
- `npm run db:dev` — start local Turso dev DB
- `npm run email` — run email dev tooling
- `npm run build:content` — build Contentlayer content
- `npm run stripe:listen` — forward Stripe webhooks to local server

## Conventions & notes

- Prefer React Server Components and minimize `use client` scopes.
- Use React Hook Form + Zod for forms and validation.
- URL search state is managed with `nuqs` (see `src/app/providers.tsx`).
- Auth is implemented with `better-auth`; middleware lives in `src/proxy.ts`.
- Prisma uses the LibSQL adapter configured in `prisma.config.ts` and migrations live under `prisma/migrations`.

For contributor guidance and agent rules see `AGENTS.md`.
