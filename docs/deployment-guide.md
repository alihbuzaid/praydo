# Praydo - Deployment Guide

**Date:** 2026-04-03

## Packaging Model

Praydo is a packaged Tauri desktop application. The frontend is built to static files and bundled into the native installers configured in `src-tauri/tauri.conf.json`.

## Build Inputs

- Frontend build command: `pnpm build`
- Tauri build command: `pnpm tauri build`
- Frontend distribution folder: `build/`
- Native bundle resources: `src-tauri/assets`

## Bundle Targets

Configured bundle targets in the scanned repository:

- `deb`
- `rpm`
- `nsis`

## CI/CD

The repository includes `.github/workflows/release.yml`:

- triggers on tags matching `v*`
- can also be run manually with `workflow_dispatch`
- installs Node, pnpm, and Rust
- installs Ubuntu desktop build dependencies on Linux runners
- runs `pnpm install`
- uses `tauri-apps/tauri-action@v0`
- creates a **draft** GitHub release

## Version Management

Keep these files synchronized before a release:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

The release tag should match the version with a `v` prefix, for example `v0.5.0`.

## Desktop Runtime Configuration

- Window is fixed-size and non-resizable by default
- CSP explicitly permits media loading from bundled assets
- App identifier: `id.my.apr.praydo`

## Manual Release Flow

```bash
pnpm install
pnpm check
pnpm test
pnpm tauri build
git tag v0.5.0
git push origin v0.5.0
```

Then review the resulting draft release in GitHub before publishing.

## Operational Notes

- Linux CI currently installs `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`
- The release guide under `.github/workflows/README.md` should be kept aligned with the actual workflow matrix and targets

---

_Generated using BMAD Method `document-project` workflow_
