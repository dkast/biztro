# shadcn CSS Variables Migration

This document explains how we migrated the project to use shadcn-style CSS variables and how to regenerate/update components.

What changed

- `components.json`: `cssVariables` set to `true` so future shadcn CLI generated components use CSS variables.
- `styles/globals.css`: Added shadcn-compatible token mappings (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--ring`, `--radius`, etc.) for both light and dark modes.
- `tailwind.config.ts`: Mapped Tailwind color names to the new CSS variables so utilities like `bg-background` and `text-foreground` work.

Quick checklist to finish migration

1. Regenerate shadcn components (recommended):
   - Install the shadcn CLI if you don't have it locally. In this repo we use the shadcn generator via npx or bunx.

   ```bash
   # Using bun (project uses bun scripts)
   bunx shadcn add button input select dialog

   # or with npx
   npx shadcn@latest add button input select dialog
   ```

   Choose `overwrite` when prompted for files you want replaced with variable-driven versions. Note: review diffs carefully — keep custom classes and project-specific variants.

2. Manual updates for custom components:
   - Search for hard-coded color utility classes (e.g., `bg-gray-900`, `text-gray-50`, etc.) in `src/components/**`.
   - Replace them with semantic tokens where appropriate. Examples:
     - `bg-gray-900 text-gray-50` -> `bg-primary text-primary-foreground`
     - `bg-white` -> `bg-card`
     - `text-gray-700` -> `text-foreground` or `text-muted-foreground` depending on usage

   - Keep brand-specific utilities (color-1..5) as-is if they intentionally differ from the component tokens.

3. Test locally
   - Run the dev server and visually inspect key pages (dashboard, menu editor, marketing pages).

   ```bash
   bun run dev
   ```

4. Lint & typecheck

   ```bash
   bun run lint
   bun run typecheck
   ```

Notes & caveats

- The project uses some PostCSS/Tailwind directives that may show as 'unknown at rule' in some editors; that's expected when the CSS parser isn't PostCSS-aware.
- The shadcn CLI may add additional tokens (like `--radius`) — merge them into `styles/globals.css` if needed.
- After regeneration, run `bun run format` to normalize formatting.

If you want, I can now run a targeted replacement for the `Button` component to show how a single component is migrated, or regenerate the core `ui` set and open a PR with the changes.
