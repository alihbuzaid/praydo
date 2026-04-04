# Praydo Desktop Shell - Development Guide

**Date:** 2026-04-03

## Prerequisites

- Rust toolchain
- Node.js and `pnpm`
- Tauri system prerequisites for the target OS

## Full Desktop Development

```bash
pnpm install
pnpm tauri dev
```

This starts the Svelte frontend and the Tauri host together.

## Native-Oriented Commands

```bash
# Frontend build consumed by Tauri packaging
pnpm build

# Desktop bundle build
pnpm tauri build

# Optional native linting from the shell directory
cd src-tauri
cargo clippy
```

## Shell-Specific Change Areas

Use the desktop shell workflow when changing:

- tray behavior
- app lifecycle and close behavior
- native notifications
- autostart permissions
- Tauri capabilities or bundle resources
- packaging and release configuration

## Files to Check During Native Changes

- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/capabilities/desktop.json`
- `.github/workflows/release.yml`

## Release Workflow

GitHub Actions builds releases from tags matching `v*` or from manual dispatch. The current workflow matrix covers Ubuntu and Windows, and Tauri creates a draft release using the version in the manifests.

Keep these versions aligned:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

---

_Generated using BMAD Method `document-project` workflow_
