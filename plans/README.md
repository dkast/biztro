# Biztro improvement plans

Audit run: 2026-07-18
Written against commit: `147b714`
Effort level: standard
Mode: non-interactive default selection, wrote the top five plans by leverage and dependency order.

## Recommended execution order

| Order | Plan                                                                                                         | Status | Depends on | Why first                                                                          |
| ----: | ------------------------------------------------------------------------------------------------------------ | ------ | ---------- | ---------------------------------------------------------------------------------- |
|     1 | [001-establish-test-baseline.md](001-establish-test-baseline.md)                                             | DONE   | None       | Security fixes need an automated regression harness before broad mutation changes. |
|     2 | [002-scope-menu-mutators-to-active-organization.md](002-scope-menu-mutators-to-active-organization.md)       | DONE   | 001        | Multiple authenticated menu actions mutate by ID or caller-supplied org ID.        |
|     3 | [003-scope-catalog-mutators-to-active-organization.md](003-scope-catalog-mutators-to-active-organization.md) | DONE   | 001        | Product, category, and variant bulk actions have the widest tenant-write surface.  |
|     4 | [004-scope-location-and-media-mutators.md](004-scope-location-and-media-mutators.md)                         | DONE   | 001        | Location hours and upload signing include direct object-ID mutation paths.         |
|     5 | [005-reconcile-next-patch-version.md](005-reconcile-next-patch-version.md)                                   | DONE   | None       | Small dependency hygiene fix with clear manifest and lockfile evidence.            |

## Vetted findings

|   # | Finding                                                                                                 | Category           | Impact                                                                                                                                                      | Effort | Risk | Evidence                                                                                                                                                                                                                                       |
| --: | ------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | No automated test runner or regression suite                                                            | Test coverage / DX | Critical auth, billing, sales, and tenant mutations can regress with only lint/typecheck feedback.                                                          | M      | MED  | `package.json:10`, `package.json:14` define lint/typecheck but no `test` script; repo search found no `*.test.*` or `*.spec.*` files.                                                                                                          |
|   2 | Menu and theme mutations trust object IDs or caller-supplied org IDs                                    | Security           | Authenticated users may mutate another organization's menus or custom themes if an ID is known or leaked.                                                   | M      | MED  | `src/server/actions/menu/mutations.ts:97`, `:107`, `:147`, `:164`, `:361`, `:374`, `:400`, `:409`, `:433`, `:478`, `:482`, `:536`, `:558`, `:611`, `:619`, `:669`, `:680`.                                                                     |
|   3 | Catalog mutations update products, categories, variants, and bulk selections without active-org scoping | Security           | Cross-tenant product/category/variant edits, deletes, image deletion, and published-menu sync can occur from foreign IDs.                                   | M/L    | MED  | `src/server/actions/item/mutations.ts:499`, `:520`, `:654`, `:664`, `:688`, `:781`, `:791`, `:804`, `:894`, `:907`, `:963`, `:974`, `:987`, `:1023`, `:1035`, `:1074`, `:1083`, `:1114`, `:1135`, `:1175`, `:1185`, `:1204`, `:1229`, `:1250`. |
|   4 | Location and media upload mutators lack complete ownership and input checks                             | Security           | Foreign location hours can be replaced, locations deleted by ID, and menu-item image uploads can update a foreign item; upload MIME type is client-trusted. | M      | MED  | `src/server/actions/location/mutations.ts:113`, `:138`, `:184`, `:188`, `:222`, `:245`, `:251`; `src/app/api/file/route.ts:34`, `:100`, `:107`, `:179`, `:182`, `:247`, `:248`; `src/lib/types/media.ts:172`.                                  |
|   5 | Next patch target is stale relative to installed Next                                                   | Dependencies / DX  | The local workaround may no longer apply to the app's direct Next version, or it may mask an obsolete workaround.                                           | S/M    | MED  | `package.json:202`, `package.json:203`; `bun.lock:178`, `bun.lock:179`, `bun.lock:2797`; `patches/next@16.2.6.patch`.                                                                                                                          |
|   6 | `getMenuById()` rewrites serialized editor data on every read                                           | Performance        | Menu editor/detail reads pay decompression, JSON parse, full node scan, recompression, and allocation proportional to layout size.                          | M      | MED  | `src/server/actions/menu/queries.ts:39`, `:69`, `:70`, `:73`, `:98`, `:110`.                                                                                                                                                                   |
|   7 | Catalog/image hydration logic is duplicated across menu read/sync paths                                 | Tech debt          | Asset URL behavior can drift between editor, public menu, and sync paths.                                                                                   | M      | LOW  | `src/server/actions/menu/queries.ts:52`, `:59`, `:69`; `src/server/actions/menu/sync.ts:124` and nearby helper paths.                                                                                                                          |

## Direction findings

|   # | Suggestion                                                                                          | Evidence                                                                                                                                | Trade-offs                                                                                                                                           |
| --: | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
|  D1 | Remove remaining editor/session coupling by deriving organization context once in the editor shell. | `src/components/menu-editor/blocks/container-settings.tsx:289` has a TODO to remove `organizationId` prop and get it from user session. | Improves reuse and reduces prop trust, but touches editor entry points and should wait until tenant-scope mutation tests exist.                      |
|  D2 | Add a short ADR/current-state note for host-based subdomain routing.                                | `docs/deployment/subdomain-routing.md` is detailed and operational, while no ADR directory was found.                                   | Low effort; useful only if the guide is still authoritative. If deployment is changing, document the target instead of polishing stale instructions. |

## Considered and rejected

- Broad "run dependency audit" finding: not accepted because the advisory session was denied permission to run `bun audit --audit-level high`; no advisory evidence was available.
- Broad "sales dashboard is inefficient" finding: not accepted as a separate plan because the current queries are bounded by date periods and recent sales are capped; groupBy usage already exists where obvious.
- "Documented Cloudflare Worker routing is risky" finding: not accepted because the deployment doc explicitly explains the tradeoff and validation checklist. Treat drift from that doc as a future finding if live config/code diverges.

## Verification gates for all executor plans

Use Bun, matching `AGENTS.md` and `package.json`.

```sh
bun run lint
bun run typecheck
```

After plan 001 lands, also run:

```sh
bun run test
```

If a plan changes `prisma/schema.prisma`, the executor must create or describe the migration and run `bunx prisma generate`. None of the current five plans should require a schema migration.
