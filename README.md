## Biztro

> [!NOTE]
> This project is in beta and under active development.

[![DeepSource](https://deepsource.io/gh/dkast/biztro.svg/?label=active+issues&show_trend=true&token=ka1uwQTdoJTIVeRZl6gI7ERb)](https://deepsource.io/gh/dkast/biztro/?ref=repository-badge)

Biztro helps restaurants create and publish digital menus and manage day-to-day
sales. It combines a visual menu editor, public menus, AI-assisted menu tools,
multilingual content, media management, subscriptions and restaurant operations.

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
  details, filter and export transaction history to CSV, view revenue dashboards,
  best sellers and recent activity, and export daily closing reports to CSV.
- **Order operations** — send orders to a live kitchen board, collect payment for
  pending orders, and track customer balances and payments in receivables.
- **Organization operations** — manage locations, opening hours, services,
  member settings, billing and Cloudflare R2-backed media assets.
- **Public publishing** — publish mobile-friendly menus at organization
  URLs/subdomains, with QR codes and supported menu translations.

## Core stack

- Next.js 16 App Router + TypeScript
- React 19 with React Server Components preferred
- Tailwind CSS 4 + Shadcn UI + Radix UI primitives
- Prisma 7 with the LibSQL adapter; Turso for local/dev database access
- Upstash Redis and Realtime for order updates
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
- `docs/kitchen-display.md` — kitchen queue and payment timing behavior
- `docs/deployment/subdomain-routing.md` — Cloudflare + Vercel host-based
  subdomain deployment guide

## Quick start

Use Bun and Node.js 24 for local development. The local database command also
requires the Turso CLI.

1. Install dependencies

```sh
bun install
```

2. Configure environment variables

Create a `.env` file at the project root, or export variables in your shell.
Configure the variables validated by `src/env.mjs` before starting the app:

- Database and realtime: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Authentication: `BETTER_AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`;
  production also requires `BETTER_AUTH_SECRET` and `AUTH_SECRET`
- Media and email: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_KEY_ID`,
  `R2_BUCKET_NAME`, `R2_CUSTOM_DOMAIN`, `RESEND_API_KEY`
- Billing and analytics: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`,
  `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`, `NEXT_PUBLIC_POSTHOG_KEY`
- `AI_GATEWAY_API_KEY` is optional for startup; real AI imports and translations
  require it.

The local Turso server started below backs `local.db`. Set the runtime
`TURSO_DATABASE_URL` to the local server's URL and `TURSO_AUTH_TOKEN` to a
nonempty value. Prisma CLI uses `LOCAL_DATABASE_URL` (defaulting to
`file:./local.db`), separate from the application's runtime connection.

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

5. Apply migrations to the local database

Make sure `LOCAL_DATABASE_URL` points to the local database, then run:

```sh
bun run prisma:migrate
```

6. Start the development server

```sh
bun run dev
```

## Common scripts

- `bun run dev` — start the Next.js dev server
- `bun run build` — build for production
- `bun run start` — start the production server
- `bun run lint` — run Oxlint
- `bun run lint:fix` — run Oxlint fixes
- `bun run typecheck` — run TypeScript type checking
- `bun run test` — run Vitest tests
- `bun run format` — format source files with Prettier
- `bun run prisma:migrate` — apply deployed Prisma migrations
- `bun run db:dev` — start the local Turso database
- `bun run email` — run React Email dev tooling
- `bun run stripe:listen` — forward Stripe webhooks to the local auth webhook

## Feature flags

- `FLAGS_ENABLE_SUBSCRIPTIONS=1` enables subscription-related UI and flows.
- `FLAGS_SIMULATE_PDF_AI=1` uses AI SDK mock responses for menu import during
  development/testing. Unset or any other value uses real AI.

Real AI menu import and visual generation require `AI_GATEWAY_API_KEY`. Menu
translations require it regardless of the simulation flag.

For contributor guidance and less frequently needed compatibility or performance
notes, see `AGENTS.md` and [`docs/development-notes.md`](docs/development-notes.md).
