# Praydo - Source Tree Analysis

**Date:** 2026-04-03

## Overview

Praydo is organized around a small application surface with a clean separation between UI/runtime logic in `src/` and native desktop hosting in `src-tauri/`. The source tree is compact enough that the main architectural boundaries are easy to trace from the directory layout alone.

## Multi-Part Structure

This project is organized into 2 distinct parts:

- **Frontend** (`src/`): SvelteKit views, stores, business logic, utility code, and tests
- **Desktop Shell** (`src-tauri/`): Tauri runtime, tray/menu behavior, capabilities, packaging metadata, and bundled media assets

## Complete Directory Structure

```text
praydo/
├── .github/workflows/         # Release automation and workflow docs
├── conductor/                 # Product/process documentation and planning artifacts
├── docs/                      # Generated brownfield documentation
├── src/                       # Frontend application
│   ├── app.css
│   ├── app.html
│   ├── praydo.css
│   ├── lib/
│   │   ├── api/location/      # Geocoding wrapper and tests
│   │   ├── components/        # Reusable UI components
│   │   ├── logic/             # Runtime managers and core app logic
│   │   ├── praytime/          # Vendored prayer-times engine
│   │   ├── sound/             # Audio playback helper for bundled assets
│   │   ├── store/             # Persistent RuneStore state slices
│   │   └── utils/             # Formatting, qibla, date, and time helpers
│   └── routes/
│       ├── +layout.svelte     # App bootstrap and onboarding gate
│       ├── +page.svelte       # Main dashboard
│       ├── calendar/+page.svelte
│       └── settings/+page.svelte
├── src-tauri/                 # Native shell
│   ├── assets/                # Bundled adhan and notification audio
│   ├── capabilities/          # Tauri permission scopes
│   ├── icons/                 # App and bundle icons
│   ├── src/
│   │   ├── main.rs            # Binary entry point
│   │   └── lib.rs             # Tauri builder, tray, command, window events
│   ├── Cargo.toml
│   └── tauri.conf.json
├── static/                    # Frontend static assets
├── package.json
├── svelte.config.js
└── vite.config.js
```

## Critical Directories

### `src/lib/logic`

Contains the highest-value runtime code.

**Purpose:** Central app behavior and lifecycle management  
**Contains:** `PrayerManager`, onboarding step manager, shared types  
**Entry Points:** `PrayerManager.svelte.ts`  
**Integration:** Consumes stores, utilities, Tauri APIs, and audio assets

### `src/routes`

Route-level UI composition.

**Purpose:** Connect managers and state to visible desktop screens  
**Contains:** Dashboard, settings page, calendar page, app layout gate  
**Entry Points:** `src/routes/+layout.svelte`, `src/routes/+page.svelte`

### `src/lib/store`

Persisted configuration state.

**Purpose:** Store user-selected location, prayer display preferences, alerts, calculation settings, theme, and notification lead time  
**Contains:** Small independent RuneStore slices  
**Integration:** Read by managers and pages; persisted locally through the Tauri store layer

### `src/lib/praytime`

Vendored domain engine.

**Purpose:** Local prayer-time calculation with configurable methods and time formatting  
**Contains:** `PrayTime` class and tests  
**Integration:** Used by `PrayerManager` for daily and monthly schedules

### `src-tauri/src`

Native host runtime.

**Purpose:** Start the Tauri application, configure tray/window behavior, and expose the notification command  
**Contains:** `main.rs`, `lib.rs`  
**Entry Points:** `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`  
**Integration:** Called by frontend through `invoke` and Tauri plugins

### `src-tauri/assets`

Bundled media resources.

**Purpose:** Store notification and adhan audio included in desktop bundles  
**Contains:** 7 audio files, approximately `107M` total  
**Integration:** Read through `@tauri-apps/plugin-fs` and played by the frontend

## Part-Specific Trees

### Frontend Structure

```text
src/
├── lib/
│   ├── api/location/
│   ├── components/
│   ├── logic/
│   ├── praytime/
│   ├── sound/
│   ├── store/
│   └── utils/
└── routes/
    ├── +layout.svelte
    ├── +page.svelte
    ├── calendar/+page.svelte
    └── settings/+page.svelte
```

**Key Directories:**

- **`src/lib/api/location`**: Nominatim geocoding wrapper and tests
- **`src/lib/components`**: `Lightswitch`, `OnboardingWizard`, `QiblaCompass`
- **`src/lib/logic`**: App managers and typed prayer models
- **`src/lib/praytime`**: Local calculation engine
- **`src/lib/store`**: Persisted user settings
- **`src/routes`**: Top-level screens

### Desktop Shell Structure

```text
src-tauri/
├── assets/
├── capabilities/
├── icons/
├── src/
│   ├── lib.rs
│   └── main.rs
├── Cargo.toml
└── tauri.conf.json
```

**Key Directories:**

- **`src-tauri/assets`**: Runtime audio resources
- **`src-tauri/capabilities`**: Desktop permission scopes for HTTP, FS, notifications, and autostart
- **`src-tauri/src`**: Native runtime setup

## Integration Points

### Frontend → Desktop Shell

- **Location:** `src/lib/logic/PrayerManager.svelte.ts` → `src-tauri/src/lib.rs`
- **Type:** Tauri command bridge
- **Details:** The frontend calls `invoke('send_native_notification')`; Rust shows the native notification and the shell handles close-to-tray behavior

### Frontend → Tauri Plugins

- **Location:** `src/lib/api/location/GeocodeApi.ts`, `src/lib/sound/index.ts`, `src/routes/settings/+page.svelte`
- **Type:** Plugin bridge
- **Details:** HTTP plugin for geocoding, FS plugin for bundled audio, autostart plugin for boot behavior, notification plugin for permission checks

## Entry Points

### Frontend

- **Entry Point:** `src/routes/+layout.svelte`
- **Bootstrap:** Instantiates `PrayerManager`, instantiates `OnboardingManager`, exposes manager via Svelte context, and blocks the app behind onboarding until a location is persisted

### Desktop Shell

- **Entry Point:** `src-tauri/src/main.rs`
- **Bootstrap:** Delegates to `praydo_lib::run()`, which configures the Tauri builder, plugins, tray, notification command, and window-close interception

## File Organization Patterns

- Domain logic is kept out of route components when possible and placed in `src/lib/logic`.
- User preferences are separated into narrowly scoped persisted stores instead of a global monolithic settings object.
- Test files sit adjacent to the modules they cover.
- Desktop-specific code is concentrated in `src-tauri/` rather than spread across the frontend.

## Key File Types

### Svelte routes and components

- **Pattern:** `src/routes/**/*.svelte`, `src/lib/components/*.svelte`
- **Purpose:** Screen composition and reusable desktop UI pieces
- **Examples:** `src/routes/+page.svelte`, `src/lib/components/OnboardingWizard.svelte`

### Frontend runtime logic

- **Pattern:** `src/lib/**/*.ts`, `src/lib/**/*.svelte.ts`
- **Purpose:** Prayer calculations, persistence, utilities, and native-bridge orchestration
- **Examples:** `src/lib/logic/PrayerManager.svelte.ts`, `src/lib/store/calculationSettings/index.ts`

### Native shell sources

- **Pattern:** `src-tauri/src/*.rs`
- **Purpose:** App host lifecycle, tray menu, and native notifications
- **Examples:** `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`

## Asset Locations

- **Audio resources**: `src-tauri/assets/` (7 files, `107M`)
- **Static frontend assets**: `static/` (favicon and static web assets)
- **Bundle icons**: `src-tauri/icons/`

## Configuration Files

- **`package.json`**: Frontend scripts, dependency manifest, formatter/test tooling
- **`vite.config.js`**: Tauri-aware Vite dev server configuration
- **`svelte.config.js`**: Static adapter for Tauri-compatible prerendered output
- **`src-tauri/Cargo.toml`**: Rust crate and plugin dependencies
- **`src-tauri/tauri.conf.json`**: Window, bundle, and frontend build wiring
- **`src-tauri/capabilities/default.json`**: Allowed HTTP domains, notification, FS, and default permissions
- **`src-tauri/capabilities/desktop.json`**: Autostart permission for desktop targets
- **`.github/workflows/release.yml`**: Draft release automation for tagged/manual builds

## Notes for Development

Most feature work will start in `src/lib/logic`, `src/lib/store`, and the route files. Shell changes are only needed when desktop capabilities, tray behavior, permissions, or bundle/resource handling change. The large audio bundle under `src-tauri/assets` is a practical consideration for packaging and repository size.

---

_Generated using BMAD Method `document-project` workflow_
