# Praydo - Project Overview

**Date:** 2026-04-03
**Type:** Multi-part desktop application
**Architecture:** Tauri desktop shell hosting a static SvelteKit frontend

## Executive Summary

Praydo is a cross-platform Muslim prayer times desktop app. The product combines a SvelteKit/Svelte 5 frontend that handles onboarding, prayer-time calculations, countdowns, calendar rendering, and settings management with a Rust/Tauri shell that provides desktop packaging, tray behavior, autostart, resource access, and native notifications.

The codebase is best understood as a small multi-part monorepo. The `src/` tree contains nearly all feature logic, including a locally vendored `PrayTime` calculator and persistent client-side settings stored through `@tauri-store/svelte`. The `src-tauri/` tree is intentionally thin: it owns window lifecycle, tray interactions, capability permissions, and the single custom Tauri command used by the frontend for notifications.

## Project Classification

- **Repository Type:** Monorepo with 2 tightly coupled parts
- **Project Type(s):** `web` frontend and `desktop` shell
- **Primary Language(s):** TypeScript and Rust
- **Architecture Pattern:** Reactive client application plus native host shell

## Multi-Part Structure

This project consists of 2 distinct parts:

### Frontend

- **Type:** Web UI
- **Location:** `src/`
- **Purpose:** Render the prayer dashboard, onboarding flow, calendar view, settings UI, qibla compass, and all calculation/state logic
- **Tech Stack:** SvelteKit 2, Svelte 5 runes, TypeScript, Skeleton UI, Tailwind CSS 4, Vitest

### Desktop Shell

- **Type:** Desktop host
- **Location:** `src-tauri/`
- **Purpose:** Package the web UI as a native app and provide tray menu, autostart, native notifications, resource loading, capabilities, and release bundling
- **Tech Stack:** Tauri 2, Rust 2021, Tauri plugins, Cargo

### How Parts Integrate

The frontend is built into `build/` and loaded by Tauri as the desktop UI. At runtime the frontend uses Tauri plugins directly from JavaScript for HTTP, filesystem, autostart, and notification permissions, and uses `invoke('send_native_notification')` to call the Rust command defined in `src-tauri/src/lib.rs`. The shell controls window lifecycle and minimizes close events into background operation via the tray.

## Technology Stack Summary

### Frontend Stack

| Category | Technology | Version | Justification |
| --- | --- | --- | --- |
| UI framework | SvelteKit | `^2.9.0` | Route-based desktop UI with prerendered static output |
| Component model | Svelte | `^5.0.0` | Runes-based reactive state in managers and views |
| Language | TypeScript | `~5.6.2` | Typed application logic and test code |
| Styling | Tailwind CSS | `^4.1.11` | Utility-driven styling |
| UI kit | Skeleton UI | `^3.1.5` / `^1.3.0` | Tabs, switches, toasts, and theme tokens |
| Persistence | `@tauri-store/svelte` | `^2.6.1` | Persists location, settings, alert, and display preferences |
| Desktop bridge | `@tauri-apps/api` + plugins | Tauri v2 | Native HTTP, notifications, FS, autostart, opener |
| Testing | Vitest | `^4.0.18` | Unit testing for logic, API wrapper, and utilities |

### Desktop Shell Stack

| Category | Technology | Version | Justification |
| --- | --- | --- | --- |
| Desktop framework | Tauri | `2` | Native app host and packaging |
| Language | Rust | edition `2021` | Shell lifecycle, tray, and native notification command |
| Build | Cargo | from lockfile | Rust dependency resolution and builds |
| Packaging | Tauri bundle targets | `deb`, `rpm`, `nsis` | Linux and Windows installers |
| CI release | GitHub Actions | current repo workflow | Draft release creation on tag/manual trigger |

## Key Features

- Mandatory onboarding flow for first-run location, calculation method, and notification choices
- Daily prayer dashboard with next-prayer countdown and enabled-prayer timeline
- Qibla direction calculation from persisted coordinates
- Monthly prayer calendar derived from the same prayer engine
- Settings for calculation methods, time format, alerts, autostart, and theme
- System tray open/hide/quit behavior with native notifications and bundled audio assets

## Architecture Highlights

- `PrayerManager` is the central frontend coordinator and owns the app tick loop, derived prayer state, monthly schedule generation, and notification/audio dispatch.
- Prayer-time computation is local. `src/lib/praytime/index.ts` vendors a prayer calculation engine rather than relying on a remote API for schedule generation.
- Persisted user state is split into small RuneStore instances instead of a single global store.
- Network usage is minimal and focused on geocoding through OpenStreetMap Nominatim.
- The Rust layer is deliberately narrow and mostly concerned with desktop concerns, not business logic.

## Development Overview

### Prerequisites

- Node.js with `pnpm`
- Rust toolchain
- Tauri system prerequisites for the target OS

### Getting Started

Install frontend dependencies with `pnpm install`, then run `pnpm tauri dev` from the repository root for the full desktop environment. Use `pnpm dev` only when working on the frontend in isolation.

### Key Commands

#### Frontend

- **Install:** `pnpm install`
- **Dev:** `pnpm dev`

#### Desktop Shell

- **Install:** `pnpm install`
- **Dev:** `pnpm tauri dev`

## Repository Structure

The root contains the application sources, Tauri shell, conductor planning artifacts, and BMAD workflow assets. The frontend lives under `src/`, while all native packaging and runtime host code lives under `src-tauri/`. Existing product/process documentation lives under `conductor/`.

## Documentation Map

For detailed information, see:

- [index.md](./index.md) - Master documentation index
- [architecture-frontend.md](./architecture-frontend.md) - Frontend architecture
- [architecture-desktop-shell.md](./architecture-desktop-shell.md) - Desktop shell architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [development-guide-frontend.md](./development-guide-frontend.md) - Frontend development workflow
- [development-guide-desktop-shell.md](./development-guide-desktop-shell.md) - Desktop shell development workflow

---

_Generated using BMAD Method `document-project` workflow_
