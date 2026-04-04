# Praydo Frontend - Component Inventory

**Date:** 2026-04-03

## Overview

The frontend uses a small component set. Most reusable behavior lives in managers and stores rather than in a broad UI component library.

## Route Screens

### `src/routes/+page.svelte`

- **Category:** Dashboard screen
- **Purpose:** Shows next prayer countdown, enabled-prayer timeline, date/time, location, and qibla widget
- **Depends On:** `PrayerManager`, `QiblaCompass`, Lucide icons

### `src/routes/calendar/+page.svelte`

- **Category:** Calendar screen
- **Purpose:** Displays per-day prayer schedule for the selected month
- **Depends On:** `PrayerManager`, `selectedTimes`

### `src/routes/settings/+page.svelte`

- **Category:** Settings screen
- **Purpose:** Allows location search, prayer calculation tuning, visible-prayer toggles, notification preferences, autostart, time format, and theme changes
- **Depends On:** multiple RuneStore slices, `geocode`, Skeleton UI, Tauri APIs

## Reusable Components

### `OnboardingWizard.svelte`

- **Category:** Setup flow
- **Responsibilities:** Collect initial location, calculation method, and alert preferences
- **Patterns:** Controlled multi-step modal, first-run gate

### `QiblaCompass.svelte`

- **Category:** Visualization
- **Responsibilities:** Render the direction of qibla from the calculated bearing
- **Patterns:** Pure presentational component

### `Lightswitch.svelte`

- **Category:** Utility control
- **Responsibilities:** Toggle persisted color mode
- **Patterns:** Simple state-driven control

## Supporting Non-Visual Components

### `PrayerManager`

- **Role:** Application service / runtime coordinator
- **Why it matters:** Although not a visual component, it is the most important reusable unit in the app and effectively powers every screen

### RuneStore slices

- **Role:** Shared state components
- **Why they matter:** They define the app’s durable settings contract and are reused across routes and managers

## Reuse Opportunities

- The settings page currently owns substantial UI markup that could be extracted into form subsections if the surface area grows.
- Prayer cards and timeline items are implemented inline in `+page.svelte`; those are natural candidates for extraction if the dashboard evolves.

## Gaps

- There is no formal design system or component folder for form primitives beyond third-party Skeleton controls.
- Cross-screen layout patterns are implicit rather than codified into reusable view components.

---

_Generated using BMAD Method `document-project` workflow_
