# Praydo Frontend - Data Models

**Date:** 2026-04-03

## Overview

Praydo has no relational database or ORM layer. Its effective data model is the set of persisted RuneStore objects plus runtime prayer/time structures derived from them.

## Persisted Models

### `selectedLocation`

- **Store Key:** `location`
- **Shape:**
  - `id: string`
  - `label: string`
  - `latitude: number`
  - `longitude: number`
- **Purpose:** Defines the current geographic location for prayer-time and qibla calculations

### `calculationSettings`

- **Store Key:** `calculationSettings`
- **Shape:**
  - `method`
  - `fajrAngle`
  - `dhuhrMinutes`
  - `asrMethod`
  - `maghrib`
  - `maghribMode`
  - `isha`
  - `ishaMode`
  - `midnight`
  - `highLatitudes`
- **Purpose:** Tunes how the local `PrayTime` engine calculates schedules

### `selectedTimes`

- **Store Key:** `times`
- **Shape:**
  - `daily.fajr|sunrise|dhuhr|asr|maghrib|isha: boolean`
  - `format: TimeFormat`
- **Purpose:** Controls which prayers are shown and what time format is used

### `selectedAlert`

- **Store Key:** `alert`
- **Shape:** `alert.<prayerName>: boolean`
- **Purpose:** Enables or disables alert audio per prayer

### `modeLightSwitch`

- **Store Key:** `modeLightSwitch`
- **Shape:** `{ mode: 'light' | string }`
- **Purpose:** Persists theme mode

### `timeRemaining`

- **Store Key:** `timeRemaining`
- **Shape:** `{ minutes: number }`
- **Purpose:** Controls the lead time for pre-prayer notifications

## Runtime Models

### `PrayerTimes`

- **Defined In:** `src/lib/logic/types.ts`
- **Purpose:** Typed prayer schedule for a day or calendar row

### `PrayerName`

- **Defined In:** `src/lib/logic/types.ts`
- **Purpose:** Restricts prayer identifiers used across the app

### Derived Aggregates from `PrayerManager`

- `enabledPrayers`
- `nextPrayer`
- `countdownString`
- `todaysPrayerTimes`
- `tomorrowsPrayerTimes`
- monthly schedule rows returned by `getMonthSchedule`

These are not persisted but form the app’s working state model.

## Persistence Strategy

- All stores use `saveOnChange: true`
- Debounced persistence with `saveInterval: 1000`
- `autoStart: true` means stores rehydrate at startup without extra bootstrap code

## Data Relationships

- `selectedLocation` + `calculationSettings` + `selectedTimes` drive prayer schedule generation
- `selectedAlert` + `timeRemaining` drive notification behavior
- `selectedLocation` also drives qibla bearing and onboarding completion state

## Schema Constraints

- Prayer calculations assume a valid selected location
- Onboarding completion is effectively derived from whether `selectedLocation.id` and `selectedLocation.label` are populated
- `PrayerManager` expects calculation settings to align with the vendored `PrayTime` method names and adjustment semantics

---

_Generated using BMAD Method `document-project` workflow_
