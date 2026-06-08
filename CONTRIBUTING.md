# Contributing to dssoca

Thanks for your interest in dssoca — a token-driven Svelte 5 design system. This guide covers the
workflow and the house rules. For the full architecture, read [`CLAUDE.md`](./CLAUDE.md) and
[`DESIGN.md`](./DESIGN.md).

## Prerequisites

- **Node 24**
- **pnpm** (this repo is pnpm-only — never use `npm`/`npx`)

```sh
pnpm install   # postinstall runs svelte-kit sync
```

## Common commands

```sh
pnpm dev               # library SvelteKit app (stub)
pnpm test              # Vitest suite (run once)
pnpm test:watch        # Vitest watch
pnpm storybook         # Storybook explorer on :6006
pnpm pack              # build dist/ via prepack + publint, make a tarball
pnpm docs:dev          # documentation site (documentation/) on :5173
pnpm docs:build        # build the docs site (static)
```

> The docs site embeds live Storybook stories, so run `pnpm storybook` alongside `pnpm docs:dev` for
> the component demos to render.

## House rules (non-negotiable)

- **Zero border-radius.** Every radius token is `0`. Never override.
- **Prefix is `ss-`.** CSS custom properties are `--ss-*`; the `.ss-*` class prefix is reserved for
  component-identity roots and global app-layout classes. Internal elements use plain, unprefixed
  scoped names.
- **Styling is scoped.** Component CSS lives in that component's `<style lang="scss">`. Only tokens,
  base/element styles, and app-shell layout belong in `src/styles/` (the global `theme.css`).
- **New chrome reads size tokens** (`--ss-*`), never hardcoded px, or it won't rescale.
- **Tests are required.** Run `pnpm test` and add/extend tests for any change. A11y is covered by
  `vitest-axe` (unit) and `@storybook/addon-a11y` (Storybook); target **WCAG 2.2 AA**.
- **Update the agile tracker.** Move the relevant `agile/` item, then run `node build.mjs` in
  `agile/` to rebuild the board.

## Adding or changing a component

1. Add `src/lib/components/Foo.svelte`, styled in a scoped `<style lang="scss">` using `--ss-*`
   tokens (`.ss-foo` for the root identity; plain names for internals).
2. Export it from `src/lib/index.ts`.
3. Add a Vitest test under `test/unit/` (mirror an existing one).
4. Add a story under `src/stories/` (never `src/lib/`) and, if it's a public component, a page entry
   in `documentation/src/lib/docs.config.ts`.
5. `pnpm test` green; `pnpm pack` clean (publint).
6. Update `agile/` and rebuild the board.

## Git flow

This repo uses **git-flow**:

- `main` — released code only (every commit is taggable).
- `develop` — integration branch; day-to-day work merges here.
- `feature/<slug>` — branch off `develop`, PR back into `develop`.
- `release/<x.y.z>` / `hotfix/<x.y.z>` — as per git-flow.

Rules:

- **No direct pushes to `main` or `develop`** — both are protected; merge via PR with green CI.
- CI runs `pnpm test` + `pnpm pack` on every PR.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`,
  `chore:`, `docs:`…). End commit messages with the co-author trailer:
  `Co-Authored-By: Claude <noreply@anthropic.com>`.
