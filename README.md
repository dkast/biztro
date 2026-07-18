## Biztro

> [!NOTE]
> This project is in beta and under active development.

[![DeepSource](https://deepsource.io/gh/dkast/biztro.svg/?label=active+issues&show_trend=true&token=ka1uwQTdoJTIVeRZl6gI7ERb)](https://deepsource.io/gh/dkast/biztro/?ref=repository-badge)

Biztro is a mobile-first, server-first Next.js application for restaurants that
need to build, publish, translate and operate digital menus. It combines a visual
menu editor, QR/public menu publishing, AI-assisted imports, multilingual menu
content, media management, subscriptions and a lightweight sales module.

## Product capabilities

- **Digital menu builder** — create menu items, categories, variants, prices,
  images, allergens and one active public menu per organization.
- **Visual menu editor** — compose and preview mobile-first public menus with
  editable font and color themes.
- **AI menu import** — upload a PDF or image menu, extract products with
  confidence/review metadata, edit the generated rows, then save products or
  generate a complete draft menu with AI-selected design settings.
- **CSV import/export** — import products with Spanish or English column aliases
  and export catalog rows by product variant.
- **AI translations** — translate active menu items, variants and categories to
  supported locales: English, French, German, Portuguese, Italian, Japanese and
  Chinese.
- **Sales module** — register quick sales from the active catalog, support
  dine-in/takeout/delivery order types, void sales with reasons, inspect sale
  details, view revenue dashboards, best sellers and recent activity, and export
  daily closing reports to CSV.
- **Organization operations** — manage locations, opening hours, services,
  member settings, billing and Cloudflare R2-backed media assets.
- **Public publishing** — serve public menus from organization slugs/subdomains
  with host-based routing support.

## Core stack

- Next.js 16 App Router + TypeScript
- React 19 with React Server Components preferred
- Tailwind CSS 4 + Shadcn UI + Radix UI primitives
- Prisma 7 with the LibSQL adapter; Turso for local/dev database access
- Better Auth for authentication and organization membership
- next-safe-action for server mutations
- Zod for schemas and validation
- nuqs for URL query state
- TanStack Query/Table/Virtual for client data workflows
- Vercel AI SDK through AI Gateway for AI extraction, visual analysis and
  translations
- Cloudflare R2/S3-compatible storage for uploads
- Stripe + better-auth Stripe plugin for subscriptions
- PostHog, Sentry and next-axiom for analytics, monitoring and logging

## Useful files

- `package.json` — scripts and dependency list
- `src/env.mjs` — environment schema and required variables
- `src/app/config.ts` — product limits and defaults
- `src/flags.ts` — feature flags, including simulated PDF AI imports
- `prisma.config.ts` — Prisma adapter config
- `prisma/schema.prisma` — application data model, including sales and
  translations
- `prisma/models/auth.prisma` — Better Auth data model
- `docs/deployment/subdomain-routing.md` — Cloudflare + Vercel host-based
  subdomain deployment guide
- `AGENTS.md` — contributor and agent conventions

## Quick start

Use Bun for local development unless you are intentionally testing another
runtime.

1. Install dependencies

```sh
bun install
```

2. Configure environment variables

Create a `.env` file at the project root, or export variables in your shell.
Required variables are validated in `src/env.mjs`.

Common local requirements:

- Turso/LibSQL: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- Better Auth/Google OAuth: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
  `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Cloudflare R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_KEY_ID`,
  `R2_BUCKET_NAME`, `R2_CUSTOM_DOMAIN`
- Email: `RESEND_API_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`,
  `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`
- Analytics: `NEXT_PUBLIC_POSTHOG_KEY`; optional `POSTHOG_HOST` and
  `POSTHOG_API_KEY`
- AI features: optional `AI_GATEWAY_API_KEY`; required for real AI imports and
  translations when not using simulation

3. Generate Prisma client

Lifecycle scripts run `prisma generate` automatically, but you can run it
manually when needed:

```sh
bun run predev
# or
bunx prisma generate
```

4. Start the local database

```sh
bun run db:dev
```

This starts a local Turso development database backed by `local.db`.

5. Start the development server

```sh
bun run dev
```

## Common scripts

- `bun run dev` — start the Next.js dev server
- `bun run build` — build for production
- `bun run start` — start the production server
- `bun run lint` — run ESLint
- `bun run lint:fix` — run ESLint fixes
- `bun run typecheck` — run TypeScript type checking
- `bun run format` — format source files with Prettier
- `bun run prisma:migrate` — apply deployed Prisma migrations
- `bun run db:dev` — start the local Turso database
- `bun run email` — run React Email dev tooling
- `bun run build:content` — build Contentlayer content
- `bun run stripe:listen` — forward Stripe webhooks to the local auth webhook

## Feature flags

- `FLAGS_ENABLE_SUBSCRIPTIONS=1` enables subscription-related UI and flows.
- `FLAGS_SIMULATE_PDF_AI=1` uses AI SDK mock responses for menu import during
  development/testing. The flag defaults to simulated imports when unset.

When simulated imports are disabled, AI menu import, full-menu visual generation
and menu translations require `AI_GATEWAY_API_KEY`.

## Conventions and notes

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

## Deployment notes

- Host-based public menu URLs such as `https://slug.biztro.co` are documented in
  `docs/deployment/subdomain-routing.md`.
- The current production approach uses Cloudflare wildcard DNS + TLS and a
  Cloudflare Worker proxying to Vercel.

For detailed contributor guidance and repository guardrails, see `AGENTS.md`.
