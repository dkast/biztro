# Plan 005: Reconcile the Next.js patch with the installed version

Status: DONE
Written against commit: `147b714`
Finding: Next patch target is stale relative to installed Next
Category: Dependencies / DX
Effort: S/M
Fix risk: MED
Dependencies: none

## Why this matters

The app depends on `next@16.2.9`, but `patchedDependencies` still points at a patch for `next@16.2.6`. A stale patch can silently stop applying to the direct app dependency, keep an obsolete workaround alive through a transitive package, or confuse future framework upgrades.

Current evidence:

```json
// package.json:202-204
"patchedDependencies": {
  "next@16.2.6": "patches/next@16.2.6.patch"
}
```

```toml
# bun.lock:178-179
"patchedDependencies": {
  "next@16.2.6": "patches/next@16.2.6.patch",
```

```toml
# bun.lock:2797
"next": ["next@16.2.9", ...]
```

```diff
// patches/next@16.2.6.patch
diff --git a/dist/server/lib/router-utils/setup-dev-bundler.js b/dist/server/lib/router-utils/setup-dev-bundler.js
...
+ opts.fsChecker.rewrites.beforeFiles = opts.fsChecker.rewrites.beforeFiles.filter((route)=>!(0, _generateinterceptionroutesrewrites.isInterceptionRouteRewrite)(route));
```

`bun.lock:3613` also contains a transitive `@react-email/ui/next` package resolved to `next@16.2.6`, so the executor must distinguish the direct app dependency from transitive lock entries before deleting anything.

## Repo conventions to follow

- Use Bun for dependency changes.
- Keep lockfile and manifest in sync.
- Do not upgrade unrelated dependencies in this plan.
- Do not remove the patch unless you verify the underlying Next behavior is fixed or no longer applies.

## Scope

In scope:

- `package.json`
- `bun.lock`
- `patches/next@16.2.6.patch`
- Possibly a new `patches/next@16.2.9.patch` if the workaround is still required.

Out of scope:

- Upgrading Next beyond `16.2.9`.
- Changing React, eslint-config-next, or React Email versions.
- Refactoring code to avoid the patched behavior unless the patch is obsolete and the code no longer needs it.

## Implementation steps

1. Identify why `patches/next@16.2.6.patch` exists. Search commit history and PRs for the patch filename or the added `isInterceptionRouteRewrite` line.
2. Inspect installed `node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.js` for the target area in `next@16.2.9`.
3. Decide one of two paths:
   - If Next `16.2.9` already includes equivalent behavior, remove the patch entry and delete the stale patch file.
   - If the workaround is still required, rebase the patch onto `next@16.2.9`, rename the patch file accordingly, and update `patchedDependencies`.
4. Regenerate the Bun lockfile using the repo's normal Bun workflow, without upgrading unrelated packages.
5. Confirm `package.json` and `bun.lock` both reference the same patched Next version, or neither references the patch if it is removed.
6. Run the app's validation gates.

## Test plan

This is dependency hygiene, so the main regression check is build/tooling behavior:

- If the patch was for dev bundler rewrites, manually run the narrow dev scenario that originally required it if known from history.
- If no scenario can be identified, document that in the PR and rely on `bun run lint`, `bun run typecheck`, and a production build if feasible.

## Verification

Run:

```sh
bun install
bun run lint
bun run typecheck
```

If the patch is retained or changed, also run:

```sh
bun run build
```

Expected result:

- Manifest and lockfile agree on the patch target.
- No stale `next@16.2.6` direct patch entry remains for the app's direct `next@16.2.9` dependency.
- Lint and typecheck exit 0.
- Build exits 0 when run.

## Done criteria

- `patchedDependencies` is either removed for Next or points at the installed direct Next version.
- Patch file name matches the patched package version if retained.
- `bun.lock` reflects the same decision.
- No unrelated dependency upgrades are included.

## Escape hatches

- If the patch is still required but does not apply cleanly to `16.2.9`, STOP and report the failing hunk plus the upstream code excerpt. Do not hand-edit minified/vendor code blindly.
- If `bun install` attempts broad upgrades, STOP and report the lockfile drift instead of committing a large dependency churn diff.

## Maintenance note

Every future Next upgrade should include a quick check of `patchedDependencies`; stale framework patches are easy to miss because the app can appear to install successfully while the workaround no longer targets the intended package.

## Unresolved questions

- The original issue that required this patch was not documented in the patch file. Resolve from git history before deciding remove vs rebase.
