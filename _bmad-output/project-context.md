---
project_name: 'praydo'
user_name: 'Alihbuzaid'
date: '2026-04-03T00:00:00+03:00'
sections_completed:
  [
    'technology_stack',
    'language_rules',
    'framework_rules',
    'testing_rules',
    'quality_rules',
    'workflow_rules',
    'anti_patterns',
  ]
status: 'complete'
rule_count: 18
optimized_for_llm: true
existing_patterns_found: 9
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Frontend app: SvelteKit `^2.9.0` with Svelte `^5.0.0`
- Build tooling: Vite `^6.0.3`, adapter-static `^3.0.6`, TypeScript `~5.6.2`
- Styling: Tailwind CSS `^4.1.11`, `@tailwindcss/forms` `^0.5.10`, Skeleton UI `^3.1.5` and `@skeletonlabs/skeleton-svelte` `^1.3.0`
- Desktop shell: Tauri v2 on both JS (`@tauri-apps/*`) and Rust (`tauri = "2"`, `tauri-build = "2"`)
- Frontend persistence/network/plugins: `@tauri-store/svelte`, notification/http/fs/autostart/opener plugins
- Prayer/date helpers: `@tabby_ai/hijri-converter`, custom PrayTime implementation under `src/lib/praytime`
- Testing: Vitest `^4.0.18` with `@vitest/coverage-v8`
- Formatting/hooks: Prettier `^3.8.1`, `prettier-plugin-svelte`, Husky `^9.1.7`, lint-staged `^16.2.7`
- Rust backend: edition `2021`; thin Tauri host in `src-tauri/src/lib.rs`

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript runs in `strict` mode. Do not weaken types to get code through unless the file already uses a contained escape hatch for a library mismatch.
- This codebase uses Svelte 5 runes. State in manager classes is declared with `$state` and `$derived`; do not rewrite that logic into legacy Svelte stores/reactivity.
- Files that use runes outside components are named `*.svelte.ts`, for example `PrayerManager.svelte.ts`. Keep that suffix when adding rune-based classes/modules.
- Imports use the SvelteKit `$lib` alias heavily. Prefer `$lib/...` over long relative paths inside app code.
- Prettier is the formatting authority: single quotes, semicolons, width defaults, 2 spaces, trailing commas `es5`.

### Framework-Specific Rules

- SSR is intentionally disabled. `src/routes/+layout.ts` sets `prerender = true` and `ssr = false` because Tauri has no Node server. Do not introduce server-only code paths or assume runtime SSR.
- The root layout owns app-wide managers and context. `PrayerManager` is created once in `src/routes/+layout.svelte`, injected via `setContext('prayerManager', ...)`, and destroyed in `onDestroy`. Reuse that pattern instead of instantiating managers per page.
- Persisted client settings use `RuneStore` instances from `@tauri-store/svelte`. Update them through `.state` mutations, not by replacing the store object.
- Store keys are part of the persisted contract (`location`, `calculationSettings`, `times`, `timeRemaining`, `alert`, `modeLightSwitch`). Do not rename keys casually or users will lose saved preferences.
- Tauri-facing browser capabilities should use Tauri plugins, not browser or Node substitutes. Current examples: `@tauri-apps/plugin-http` for geocoding, `@tauri-apps/plugin-fs` for packaged assets, `@tauri-apps/plugin-notification` for permissions.
- Native notifications are funneled through the Rust command `send_native_notification`. If notification behavior changes, keep the JS `invoke(...)` contract and the Rust handler aligned.
- Window close is intentionally intercepted in Rust so the app hides to tray instead of exiting. Do not change close behavior without considering tray restore and background notification flows.

### Testing Rules

- Tests are colocated next to source as `*.test.ts`.
- Use Vitest primitives (`describe`, `it`, `expect`, `vi`) and mock Tauri/plugin boundaries explicitly with `vi.mock(...)`.
- Time-sensitive logic should use fake timers and fixed system time. `PrayerManager.test.ts` uses `vi.useFakeTimers()` and `vi.setSystemTime(...)`; follow that approach for countdown/notification behavior.
- For Tauri HTTP wrappers, test both success and failure paths and return-shape compatibility, not just happy-path JSON.

### Code Quality & Style Rules

- Component files use PascalCase in `src/lib/components`. Route files follow SvelteKit conventions under `src/routes`.
- Utilities live under `src/lib/utils`, stores under `src/lib/store`, and integration wrappers under `src/lib/api`. Keep new code in those buckets instead of mixing concerns into routes.
- This codebase favors small helper functions and derived state over deeply nested markup logic. If route markup starts growing, extract helpers/components before adding more branching.
- Existing code comments are sparse and functional. Add comments only when behavior is non-obvious, for example time-crossing or Tauri lifecycle constraints.

### Development Workflow Rules

- Primary scripts are `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`, and `pnpm tauri dev/build`. Prefer these over ad hoc commands when verifying work.
- There is no repo-local architecture artifact or CI workflow checked in under `_bmad-output`/`.github` right now. Treat the current source tree as the source of truth for conventions.
- Generated build outputs under `src-tauri/target/` are not source files. Never edit generated artifacts there; only change files under `src-tauri/src`, `src-tauri/assets`, config files, or frontend source.

### Critical Don't-Miss Rules

- Do not replace `@tauri-apps/plugin-http` calls with global `fetch` for runtime code. This app is a Tauri desktop app and current networking is intentionally plugin-based.
- Do not assume prayer times are plain static strings. `PrayerManager` derives them from location, calculation settings, enabled prayers, and the current clock; changes in any of those inputs must flow through the manager.
- Do not break the one-second tick model without checking notification edge cases. The current implementation deliberately compares previous and current timestamps so missed exact-second boundaries still fire.
- Do not change asset loading to filesystem-relative browser paths for audio. Packaged sounds are loaded from Tauri resources through `BaseDirectory.Resource`.
- Avoid introducing persistence schema changes without a migration plan. Several user-facing flows depend on previously saved store state to skip onboarding and preserve preferences.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Preserve Svelte rune patterns, Tauri plugin boundaries, and persisted store keys unless the task explicitly requires changing them.
- Prefer the existing architecture: route/layout shell -> manager classes -> stores/utilities/plugins.
- When modifying time or notification logic, add or update Vitest coverage with fake timers.

**For Humans:**

- Update this file when core stack versions, plugin choices, persistence schema, or lifecycle patterns change.
- Keep the document lean; remove advice that becomes obvious from the codebase.
- Revisit the rules if the app adds SSR, backend services, or more Rust-side commands.

Last Updated: 2026-04-03
