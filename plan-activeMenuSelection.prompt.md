## Plan: Make “Active Menu” Deterministic

Today “active menu” is implicitly derived (e.g., latest published / latest modified). That’s usually OK early on, but it becomes brittle once you allow multiple published menus, editing older menus, or concurrent publishes. This plan moves to an explicit selection model using `organization.activeMenuId`, and adds guardrails like preventing deletion of the currently active menu.

### Steps (3–6 steps, 5–20 words each)

1. Audit current “active menu” selection in [src/server/actions/menu/queries.ts](src/server/actions/menu/queries.ts) and [src/app/[subdomain]/page.tsx](src/app/[subdomain]/page.tsx).
2. Compare dashboard “Activo” labeling with list ordering in [src/app/dashboard/menu-list.tsx](src/app/dashboard/menu-list.tsx).
3. Add `Organization.activeMenuId` and backfill from current “latest published” menu.
4. Update public + dashboard queries to use `activeMenuId` (fallback policy defined).
5. Update publish/unpublish flow in [src/server/actions/menu/mutations.ts](src/server/actions/menu/mutations.ts) to set/clear `activeMenuId`.
6. Add a “Marcar como activo” dropdown action in [src/app/dashboard/menu-list.tsx](src/app/dashboard/menu-list.tsx) to set `activeMenuId`.
7. Update the “Activo” badge logic to compare against `activeMenuId` (not `index === 0`).
8. Prevent deleting the active menu (server-side) and show an alert message in the dashboard UI.
9. Add deterministic ordering + indexes aligned to lookup patterns (schema + queries).

### Further Considerations (1–3, 5–25 words each)

1. Should multiple published menus be allowed? If yes, `activeMenuId` is required for deterministic routing.
2. What’s the fallback when `activeMenuId` is null? Auto-pick latest published vs require explicit selection.
3. Deletion UX: show a clear alert if the user tries to delete the active menu.
4. Confirm authorization: do menu mutations always scope by org (or rely on centralized checks in [src/proxy.ts](src/proxy.ts))?
