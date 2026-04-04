# Praydo Frontend - Architecture

**Date:** 2026-04-03  
**Part:** `frontend`  
**Type:** Web UI embedded in Tauri

## Executive Summary

The frontend is a prerendered SvelteKit application that behaves like a client-only desktop UI. It owns nearly all product behavior: onboarding, prayer calculations, calendar generation, qibla display, settings persistence, notification timing, and adhan playback. The app is stateful but small, with most complexity concentrated in a single manager class and a handful of persisted stores.

## Technology Stack

| Category | Technology | Version | Justification |
| --- | --- | --- | --- |
| App framework | SvelteKit | `^2.9.0` | Route structure and Tauri-compatible static output |
| Reactive model | Svelte 5 runes | `^5.0.0` | `$state` and `$derived` power runtime managers |
| Language | TypeScript | `~5.6.2` | Type-safe prayer logic and UI state |
| Styling | Tailwind CSS 4 + Skeleton UI | current manifest | Fast desktop-oriented UI composition |
| Persistence | `@tauri-store/svelte` | `^2.6.1` | Durable local settings storage |
| Native bridge | Tauri JS APIs/plugins | v2 | Native notifications, HTTP, autostart, filesystem, opener |
| Testing | Vitest | `^4.0.18` | Unit tests for logic, API wrapper, utilities, and praytime engine |

## Architecture Pattern

The frontend follows a reactive manager pattern:

- Route components are intentionally thin and mostly render derived state.
- `PrayerManager` acts as the application service layer and clock loop.
- RuneStore instances provide persisted configuration slices.
- Utility modules encapsulate pure calculations and formatting.
- The frontend delegates desktop-specific concerns to Tauri instead of duplicating them locally.

## Core Runtime Flow

1. `src/routes/+layout.svelte` creates `PrayerManager` and `OnboardingManager`.
2. If no persisted location is present, `OnboardingWizard` blocks the app.
3. Once configured, the dashboard renders the current prayer state from `PrayerManager`.
4. `PrayerManager` ticks every second, updating current time and checking notification thresholds.
5. When thresholds are crossed, the manager invokes native notification APIs and plays local audio assets.

## Major Modules

### Route Layer

- **`src/routes/+layout.svelte`**: App bootstrap, onboarding gate, Svelte context provider
- **`src/routes/+page.svelte`**: Main dashboard for next prayer, timeline, date, qibla
- **`src/routes/calendar/+page.svelte`**: Monthly prayer schedule view
- **`src/routes/settings/+page.svelte`**: User-configurable location, calculations, alerts, time format, autostart, theme

### Logic Layer

- **`PrayerManager.svelte.ts`**: Central runtime coordinator
- **`OnboardingManager.svelte.ts`**: Minimal wizard step controller
- **`types.ts`**: Shared prayer names and schedule types

### Infrastructure and Helpers

- **`src/lib/praytime/index.ts`**: Vendored prayer calculation engine
- **`src/lib/api/location/GeocodeApi.ts`**: OpenStreetMap Nominatim search wrapper
- **`src/lib/sound/index.ts`**: Bundled audio playback helper
- **`src/lib/utils/*`**: Qibla bearing, Hijri formatting, time parsing, string formatting

## State Architecture

The app uses six persisted RuneStore slices rather than a large store:

- `selectedLocation`: chosen location and coordinates
- `calculationSettings`: prayer calculation method and tuning parameters
- `selectedTimes`: enabled prayer rows and display format
- `selectedAlert`: per-prayer alert toggles
- `modeLightSwitch`: light/dark theme
- `timeRemaining`: lead time for pre-prayer notifications

This split keeps mutation localized and allows route/components to depend on only the state they need.

## UI Component Overview

- `OnboardingWizard`: first-run setup
- `QiblaCompass`: directional visualization derived from geocoded coordinates
- `Lightswitch`: theme toggle

The routes themselves carry much of the layout responsibility; there is not yet a large reusable design-system layer.

## Data Architecture

There is no database or remote persistence layer. Data falls into three categories:

- **Persisted local settings:** RuneStore-backed JSON-like data structures
- **Derived runtime data:** daily prayer list, next prayer, countdown, monthly schedule, qibla bearing, formatted Gregorian/Hijri dates
- **External lookup data:** geocoding results from Nominatim

## API and Integration Design

The frontend does not expose a web API. It consumes:

- OpenStreetMap Nominatim search via Tauri HTTP plugin
- Tauri command `send_native_notification`
- Tauri autostart, notification, filesystem, and opener plugins

## Testing Strategy

The frontend has targeted unit coverage around:

- `PrayerManager`
- `OnboardingManager`
- `PrayTime`
- `GeocodeApi`
- qibla utility

The current strategy is logic-heavy unit testing rather than component or end-to-end coverage.

## Deployment Shape

The frontend is prerendered with `adapter-static` and emitted to `build/`. Tauri then loads that static output as the packaged desktop UI. There is no server-side rendering and no long-running backend service.

## Risks and Constraints

- `PrayerManager` is a large central class and a future hotspot for complexity.
- The prayer engine is vendored locally, so upstream updates are manual.
- Audio assets are large relative to the rest of the codebase and affect bundle size.
- Desktop runtime assumptions are embedded in several UI modules through direct Tauri plugin use.

## Key Files

- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/routes/settings/+page.svelte`
- `src/routes/calendar/+page.svelte`
- `src/lib/logic/PrayerManager.svelte.ts`
- `src/lib/praytime/index.ts`

---

_Generated using BMAD Method `document-project` workflow_
