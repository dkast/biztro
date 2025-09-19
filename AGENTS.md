## Global Rules

- You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved.
- If you are not sure about file content or codebase structure pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

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
- Better-auth - User authorization and authentication
- Prisma ORM - Managing database interactions
- Turso - Edge database solution
- Bun - JavaScript runtime and package manager

## Available scripts

- `build` — Runs the Next.js production build (next build).
- `dev` — Starts the development server with Turbopack (next dev --turbopack).
- `postinstall` — Generates the Prisma client after package install (prisma generate).
- `lint` — Runs Next.js/ESLint checks (next lint).
- `start` — Starts the Next.js production server (next start).
- `format` — Formats source files with Prettier using the project config (prettier ... --write).
- `lint:fix` — Runs ESLint with automatic fixes on source files (eslint --fix ...).
- `typecheck` — Runs TypeScript compiler for type checking (tsc --project ./tsconfig.json).
- `prepare` — Runs Husky to install git hooks (husky).
- `prebuild` — Generates the Prisma client before building (prisma generate).
- `predev` — Generates the Prisma client before starting dev (prisma generate).
- `prisma:migrate` — Applies Prisma database migrations in deploy mode (prisma migrate deploy).
- `db:dev` — Starts a local Turso development database using local.db (turso dev --db-file local.db).
- `email` — Runs the email dev tooling to preview/build emails from src/emails (email dev --dir src/emails).
- `build:content` — Builds Contentlayer content (contentlayer2 build).
- `stripe:listen` — Listens for Stripe events and forwards them to the local webhook endpoint (stripe listen --forward-to=localhost:3000/api/webhooks/stripe)

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

## Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

## Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

## UI and Styling

- Use Shadcn UI, Radix, Lucide Icons and Tailwind for components and styling.
- Always try to use the components available in "@/componentes/ui" folder.
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
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.

## Commit messages

- Use the commitlint convention when creating new commit messages

## Additional Resources

- **Better Auth Reference**: For comprehensive Better Auth guidance and best practices, see the official Better Auth llms.txt file: https://www.better-auth.com/llms.txt
