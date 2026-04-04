# Praydo Frontend - API Contracts

**Date:** 2026-04-03

## Overview

Praydo does not expose a public HTTP API. The frontend consumes one external HTTP endpoint and one custom native command, and also depends on several Tauri plugin contracts.

## External HTTP API

### OpenStreetMap Nominatim Search

- **Wrapper:** `src/lib/api/location/GeocodeApi.ts`
- **Method:** `GET`
- **URL:** `https://nominatim.openstreetmap.org/search`
- **Query Parameters:**
  - `q`: search string entered by the user
  - `format=json`
  - `limit=1`
- **Headers:**
  - `Accept: application/json`
  - `User-Agent: Praydo/0.4 (https://github.com/agnanp/praydo; praydo@apr.my.id)`
- **Success Contract:** expects a JSON array; the first item is mapped to the persisted selected location
- **Failure Contract:** wrapper catches errors and returns an object shaped like a failed response with `status=500` and `json() => []`

## Tauri Command Contract

### `send_native_notification`

- **Caller:** `src/lib/logic/PrayerManager.svelte.ts`
- **Rust Implementation:** `src-tauri/src/lib.rs`
- **Invocation:** `invoke('send_native_notification', { title, body })`
- **Inputs:**
  - `title: string`
  - `body: string`
- **Behavior:** builds and shows a native desktop notification through `tauri_plugin_notification`
- **Return Type:** `Result<(), String>` on the Rust side; surfaced as a resolved/rejected invoke promise

## Tauri Plugin Contracts

### Notification Permission

- **Used By:** onboarding flow and `PrayerManager`
- **APIs:** `isPermissionGranted()`, `requestPermission()`
- **Purpose:** gate notification delivery and prompt for permission when alerts are enabled

### Autostart

- **Used By:** settings page
- **APIs:** `enable()`, `disable()`, `isEnabled()`
- **Purpose:** map settings toggle to OS startup behavior

### Filesystem Resource Read

- **Used By:** `src/lib/sound/index.ts`
- **API:** `readFile('assets/<name>', { baseDir: BaseDirectory.Resource })`
- **Purpose:** load bundled audio resources packaged by Tauri

### HTTP

- **Used By:** geocoding wrapper
- **API:** plugin `fetch`
- **Purpose:** allow native-safe HTTP calls under Tauri capability restrictions

## Capability Boundaries

The shell restricts HTTP calls to:

- `https://nominatim.openstreetmap.org/*`
- `https://api.myquran.com/v2/*`

Only Nominatim is currently used by the scanned frontend sources.

## Notes

- There is no authenticated API surface.
- There is no backend server route tree in the repository.
- The current API surface is small and mostly capability-driven.

---

_Generated using BMAD Method `document-project` workflow_
