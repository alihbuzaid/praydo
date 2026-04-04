---
name: Arabic Font Support
description: Fix Arabic text rendering - characters display separated instead of connected
status: in-progress
---

## Context

Arabic text in the app renders with characters separated instead of connected (e.g. دَعْوَة renders as د ع و ة). This is a font issue — `system-ui` doesn't support Arabic script character shaping (cursive joining).

## Fix

**Root cause:** `praydo.css` sets `--base-font-family: system-ui, sans-serif` and `app.html` loads no web font with Arabic support.

**Solution:** Add **Cairo** Google Font (designed for Arabic, clean and modern) and use it as the Arabic font family. Cairo is loaded via `<link>` in `app.html` and applied via CSS variable in `praydo.css` for Arabic language.

## Changes

### 1. `src/app.html`
Add Google Fonts `<link>` for Cairo (Arabic-optimized) and Noto Sans (fallback).

### 2. `src/praydo.css`
Update `--base-font-family` to use Cairo first, Noto Sans fallback.

## Acceptance Criteria

- [ ] When locale is `ar`, Arabic text renders with properly connected characters
- [ ] English text continues to render correctly
- [ ] No font Flash of Unstyled Text (FOUT) — fonts load before paint
