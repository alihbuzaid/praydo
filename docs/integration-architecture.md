# Praydo - Integration Architecture

**Date:** 2026-04-03

## Overview

Praydo has one primary cross-part integration boundary: the SvelteKit frontend running inside the Tauri desktop host. Instead of a networked backend, the app relies on local computation plus a small native bridge.

## Integration Points

### Frontend → Tauri Command

- **Source:** `src/lib/logic/PrayerManager.svelte.ts`
- **Target:** `src-tauri/src/lib.rs`
- **Type:** Command invocation
- **Contract:** `invoke('send_native_notification', { title, body })`
- **Purpose:** Deliver OS-native notification popups

### Frontend → Tauri Plugins

- **HTTP plugin:** geocoding requests to Nominatim
- **Notification plugin:** permission checks and prompt flow
- **Autostart plugin:** settings toggle for startup behavior
- **FS plugin:** reads packaged audio resources from `src-tauri/assets`

### Desktop Shell → Operating System

- **Tray menu:** open, hide, quit
- **Window lifecycle:** close requests are converted to hide-to-tray
- **Bundle packaging:** icons, resources, and installer output

## Data Flow

1. User configures a location in onboarding or settings.
2. Frontend persists location and calculation settings locally.
3. `PrayerManager` computes schedules locally through the vendored `PrayTime` engine.
4. The manager checks every second for pre-prayer and exact-time notification thresholds.
5. When a threshold is crossed, the frontend calls native notifications and plays local audio.

## Shared Dependencies Across Parts

- Tauri plugin permissions must match the frontend integrations actually used.
- Resource packaging must include the audio files expected by `src/lib/sound/index.ts`.
- Frontend build output must stay aligned with `tauri.conf.json` (`frontendDist: ../build`).

## Architectural Characteristics

- No REST backend inside the repo
- No database integration between parts
- No message bus or background worker subsystem
- Low-latency, in-process integration through the Tauri bridge

## Risks

- The shell is minimal today, so new native features could rapidly expand the bridge surface.
- Capability drift is possible if frontend integrations change without updating Tauri permissions.

---

_Generated using BMAD Method `document-project` workflow_
