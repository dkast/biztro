## Biztro Agent Instructions (Canonical)

This file is the canonical set of repo rules for any coding agent (including GitHub Copilot).
Copilot also reads `.github/copilot-instructions.md`, which should stay short and point here.

- Keep going until the user's query is completely resolved; only stop when solved or genuinely blocked.
- Do not guess file contents or structure; read files before editing.
- Keep edits minimal and safe; avoid drive-by refactors.
- Validate changes: lint + typecheck + the closest relevant runtime/test step.

### Precedence

- User instructions > this file.
- If `.github/copilot-instructions.md` disagrees with this file, prefer this file and update the Copilot file to match.

### Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Project Details

- TypeScript - strong typing across frontend and backend
- Node.js - server-side runtime and tooling
- Next.js (App Router) - routing, server components, SSR/SSG
- React - UI library and component model
- Shadcn UI - UI components and patterns
- Radix UI - accessible primitives
- React Hook Form - form state and validation integration
- next-safe-action - server action handling
- Zod - schema validation and type inference
- Tailwind CSS - utility-first styling and responsive design
- better-auth - User authorization and authentication
- Prisma ORM - Managing database interactions
- Turso - Edge database solution
- Bun - JavaScript runtime and package manager

## Available scripts

Use `bun run <script>` unless the user requests otherwise.

- `dev` — Start dev server (Next.js Turbopack).
- `lint` / `lint:fix` — ESLint.
- `typecheck` — TypeScript typecheck.
- `format` — Prettier.
- `db:dev` — Local Turso DB (`local.db`).
- `stripe:listen` — Forward Stripe webhooks to local.
- `build:content` — Contentlayer build.

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes unless the existing code does.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

## Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

## Syntax and Formatting

- Prefer the existing local style; do not mechanically rewrite function styles.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

## UI and Styling

- Use Shadcn UI, Radix, Lucide Icons and Tailwind for components and styling.
- Prefer the existing components in `@/components/ui`.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.
- Use React Hook Forms with Zod validation when creating Forms.

## Performance Optimization

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

## Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Use 'next-safe-action' for server actions.
- Use 'better-auth' for authentication-related tasks.
- Use 'bun' as a package manager for JavaScript and TypeScript projects.
- Use 'bun' scripts for common tasks like building, linting, formatting, type checking, and database management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.

## Practical repo guardrails

- Prefer React Server Components; keep `use client` components small and scoped.
- Use `src/env.mjs` as the source of truth for required env vars.
- Auth rules/route protection live in `src/proxy.ts`; consult it before changing auth behavior.
- Prisma schema/migrations live in `prisma/`; if changing schema, create a migration and mention the required command(s).
- Avoid editing generated output under `src/generated/` unless that is explicitly the task.

## Commit messages

- Use the commitlint convention when creating new commit messages

## Additional Resources

use the tools provided by context7 MCP to gather more information about libraries used in this project.
