# Praydo Frontend - Development Guide

**Date:** 2026-04-03

## Prerequisites

- Node.js
- `pnpm`
- Tauri prerequisites if you need the full desktop runtime

## Install Dependencies

```bash
pnpm install
```

## Common Commands

```bash
# Frontend-only dev server
pnpm dev

# Type and Svelte checks
pnpm check

# Unit tests
pnpm test

# Coverage
pnpm test:coverage

# Production frontend build
pnpm build
```

## Recommended Workflow

1. Use `pnpm dev` for fast UI work when native integration is not involved.
2. Use `pnpm tauri dev` when working on notifications, autostart, bundled audio, or any plugin-powered feature.
3. Run `pnpm check` before considering a change complete.
4. Run `pnpm test` for logic changes.

## Frontend Architecture Notes

- The application is prerendered and runs with `ssr = false`.
- `PrayerManager` is the primary runtime abstraction and should be understood before larger frontend changes.
- State persistence is handled through RuneStore slices in `src/lib/store`.
- The vendored `PrayTime` engine is core domain code and should be changed carefully.

## Testing Notes

Current test focus is unit coverage for logic and helper modules:

- `PrayerManager`
- onboarding manager
- geocoding wrapper
- qibla utility
- prayer-time engine

There is no end-to-end or component-test layer in the scanned repository.

## Formatting and Pre-Commit

- Prettier is the formatter of record.
- Husky runs `pnpm lint-staged` on pre-commit.
- `.prettierrc` uses single quotes, semicolons, 2-space indentation, trailing commas where applicable, and the Svelte parser override.

## Important Frontend Files

- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/routes/settings/+page.svelte`
- `src/lib/logic/PrayerManager.svelte.ts`
- `src/lib/praytime/index.ts`

---

_Generated using BMAD Method `document-project` workflow_
