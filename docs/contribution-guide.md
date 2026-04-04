# Praydo - Contribution Guide

**Date:** 2026-04-03

## Source Documents

This guide is derived from the repository’s existing process documentation, primarily:

- `conductor/workflow.md`
- `conductor/code_styleguides/`
- `.husky/pre-commit`
- `.prettierrc`

## Working Style

- Track implementation work through the conductor planning artifacts when operating within the project’s existing workflow.
- Prefer TDD for logic changes.
- Prefer non-interactive, CI-friendly commands.
- Keep tech-stack changes reflected in documentation before implementation diverges.

## Code Quality Expectations

- Run `pnpm check` for Svelte/TypeScript validation
- Run `pnpm test` for logic changes
- Run `cargo clippy` for Rust changes
- Keep type safety and project conventions intact

## Formatting

- Prettier is the configured formatter
- Husky runs `pnpm lint-staged` on pre-commit
- Main formatting rules:
  - single quotes
  - semicolons
  - 2-space indentation
  - trailing commas with `es5`

## Frontend Conventions

- Keep route components focused on rendering and interaction orchestration
- Put shared business logic in `src/lib/logic` or `src/lib/utils`
- Keep persisted settings in the existing RuneStore slices unless there is a strong reason to restructure

## Shell Conventions

- Keep Rust code focused on native concerns rather than business rules
- Update Tauri capabilities whenever frontend integrations require new permissions
- Keep bundle configuration and release workflow aligned

## Before Opening a PR

```bash
pnpm check
pnpm test
pnpm build
```

For Rust changes, also run:

```bash
cd src-tauri
cargo clippy
```

---

_Generated using BMAD Method `document-project` workflow_
