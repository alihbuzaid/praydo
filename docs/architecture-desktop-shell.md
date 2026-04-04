# Praydo Desktop Shell - Architecture

**Date:** 2026-04-03  
**Part:** `desktop-shell`  
**Type:** Native Tauri host

## Executive Summary

The desktop shell is intentionally narrow. It packages the frontend, defines the native window and bundle settings, exposes one custom notification command, installs desktop plugins, and converts close events into hide-to-tray behavior. Nearly all product logic lives in the frontend; the shell exists to provide native capabilities cleanly.

## Technology Stack

| Category | Technology | Version | Justification |
| --- | --- | --- | --- |
| Desktop host | Tauri | `2` | Native shell and packaging |
| Language | Rust | edition `2021` | Shell lifecycle and command implementation |
| Plugins | Tauri plugin ecosystem | current lockfile | Autostart, FS, HTTP, notifications, opener, Svelte |
| Packaging | Tauri bundle | config targets | Installer and resource packaging |

## Architecture Pattern

The shell follows a thin host adapter pattern:

- frontend business logic stays in TypeScript
- shell code only exposes native capabilities and lifecycle hooks
- permissions are declared through Tauri capabilities files
- bundling and release concerns stay in configuration rather than custom runtime code

## Runtime Responsibilities

- Start the Tauri app through `praydo_lib::run()`
- Register plugins used by the frontend
- Build a tray icon with open/hide/quit menu items
- Expose `send_native_notification` as a Tauri command
- Prevent close from terminating the app and hide the window instead
- Package resources and icons for desktop distribution

## Key Modules

### `src-tauri/src/main.rs`

Minimal binary entry point that delegates to the library runtime.

### `src-tauri/src/lib.rs`

The actual host implementation. It:

- configures plugins
- defines the tray menu
- handles menu events
- exposes the native notification command
- intercepts close requests and hides the main window

### `src-tauri/tauri.conf.json`

Declares:

- product metadata and identifier
- fixed window size and title
- frontend dev/build wiring
- media CSP allowance
- bundle targets and packaged resources

### `src-tauri/capabilities/*.json`

Declares the native permission envelope. The default capability allows:

- `https://nominatim.openstreetmap.org/*`
- `https://api.myquran.com/v2/*`
- notification access
- filesystem resource reads
- default opener access

The desktop capability additionally enables autostart.

## Frontend Integration

The frontend interacts with the shell in two ways:

- **Tauri plugins from JavaScript:** HTTP, notification permission checks, autostart toggles, resource filesystem access
- **Custom Tauri command:** `send_native_notification(app, title, body)`

This makes the shell a provider of capabilities rather than an active business-logic layer.

## Deployment and Release Shape

- Frontend static output is read from `../build`
- Linux targets: `deb`, `rpm`
- Windows target: `nsis`
- Release workflow creates draft GitHub releases from tags or manual dispatch
- Ubuntu CI installs required WebKit/AppIndicator dependencies before bundling

## Operational Notes

- Close requests do not exit the app; they hide it and notify the user that Praydo is still running in the background.
- Tray actions are the main lifecycle controls outside the UI.
- The shell includes large audio resources under `src-tauri/assets`, which the frontend reads at runtime.

## Risks and Constraints

- The release workflow documentation mentions platforms beyond the current workflow matrix; release docs should be kept aligned with `release.yml`.
- There is only one custom Rust command today, so future native feature growth will likely increase shell surface area from this minimal baseline.

## Key Files

- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/capabilities/desktop.json`
- `.github/workflows/release.yml`

---

_Generated using BMAD Method `document-project` workflow_
