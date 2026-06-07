# dssoca — Claude / agent context

Standalone **Svelte 5 design system**, published to npm as [`dssoca`](https://www.npmjs.com/package/dssoca).
Extracted from the `hubssoca` homelab monorepo (was `@homelab/ui`). Read this before working.

## What it is

A token-driven component library. One `theme.css` + ~14 components. Configured along **two
orthogonal axes**:

| Axis        | Attribute      | Values              | Default |
|-------------|----------------|---------------------|---------|
| **Color**   | `data-theme`        | `dark` · `light`    | `dark`  |
| **Size**    | `data-size-variant` | `sm` · `md` · `lg`  | `md`    |

Each component styles itself in a scoped `<style lang="scss">` block and consumes the global
`--ss-*` tokens; flip an axis on any ancestor (usually `<html>`) and everything below
recolors/rescales (custom properties cascade through Svelte's scoped boundary). `theme.css`
carries only tokens, base styles, and app-shell/layout — not per-component rules (since `0.3.0`;
see agile `DS-0009`). Full rationale: `DESIGN.md`. Token table: `docs/tokens.md`. Theme API:
`docs/themes.md`.

## Stack

- **SvelteKit + `@sveltejs/package`** (`svelte-package`) builds `src/lib/` → `dist/`. `publint` validates.
- **Sass** (`vitePreprocess`): component `<style lang="scss">` compiles via svelte-package; the global
  stylesheet is authored as `@use` partials in `src/styles/` and compiled to `dist/theme.css` by a
  Dart Sass CLI step in `prepack` (see agile `DS-0008`).
- **Vitest + `@testing-library/svelte`** (jsdom) for tests.
- **pnpm only** — never npm/npx. Node 24. ESM (`"type": "module"`).
- Peer dependency: `svelte@^5` (runes).

## Layout

```
src/lib/
  components/      one .svelte per component
  index.ts         barrel export (components + config + toast)
  dssoca.config.ts manifest (exported as `dssocaConfig`): axes/values/defaults — config source of truth
  config.ts        applyDesignConfig / designAttributes / getDesignConfig (derives types+defaults from the manifest)
  toast.svelte.ts  reactive toast store + imperative `toast` API
src/styles/        Sass source (@use partials) → compiled to dist/theme.css; not published
  theme.scss       entry; _tokens / _base / _layout / _components partials
                   (the --ss-* / .ss-* prefix lives here — token + base-style source of truth)
src/routes/        showcase/preview app (dev only, not published)
test/              Vitest suite (unit/ + harness/) + setup.ts
docs/              themes.md, tokens.md
agile/             work tracker (board = index.html). Slug: DS
```

Published surface (`exports`): `dssoca` (components + config) and `dssoca/theme.css`. Only `dist/`
ships (`files` field); `src/`, `test/`, `docs/` do not.

## House rules — non-negotiable

- **Zero border-radius.** Every radius token is `0`. Never override.
- **Prefix is `ss-`, reserved for identity**: CSS custom properties are `--ss-*`; the `.ss-*`
  class prefix is for **component-identity** roots (`.ss-btn`, `.ss-panel`, …) and global
  app-layout classes only. Generic internal elements use plain, unprefixed scoped names
  (`.head`, `.title`, `.dot`). No new `--hs-`/`hub-` (those were renamed; see agile `DS-0005`).
- **Styling is scoped**: component CSS lives in that component's `<style lang="scss">`. Only
  tokens, base/element styles, and app-shell/layout belong in `src/styles/` (global `theme.css`).
- **New chrome reads size tokens** (`--ss-*`), not hardcoded px, or it won't rescale.
- **Tests are a RULE**: run `pnpm test` and add/extend tests for any change before calling it done.
  A11y is covered by `vitest-axe` (unit) + `@storybook/addon-a11y` (Storybook); target WCAG 2.2 AA.
- **Agile is a RULE**: update `agile/` items on any change (move status, add stories/tasks, bump
  `updated`), then `node build.mjs` in `agile/` to rebuild the board.

## Commands

```sh
pnpm install            # deps (postinstall runs svelte-kit sync)
pnpm dev                # showcase app: live theme + size toggles
pnpm test               # Vitest suite (run once)
pnpm test:watch         # Vitest watch
pnpm pack               # build dist/ via prepack (sync → svelte-package → build:css → publint), make tarball
pnpm build:css          # compile src/styles/theme.scss → dist/theme.css (Dart Sass)
pnpm storybook          # Storybook dev server (port 6006): component pages + axis toolbar
pnpm build-storybook    # static Storybook build → storybook-static/ (gitignored)
```

Storybook config lives in `.storybook/` (`main.ts`, `preview.ts`); stories live in `src/stories/`
(**never** `src/lib/` — `svelte-package` would publish them). Stories use Svelte CSF
(`*.stories.svelte`); the preview exposes both design axes as toolbar globals applied to `<html>`.
Not wired into CI.

Note: `pnpm check` (svelte-check) currently reports a known `$lib` alias error under its tsconfig
context — pre-existing from the library template, not a real type bug. CI does **not** run it; it
runs `pnpm test` + `pnpm pack`.

## Adding / changing a component

1. Add `src/lib/components/Foo.svelte` — style it in a scoped `<style lang="scss">` using `--ss-*`
   tokens; `.ss-foo` for the root identity, plain unprefixed names for internals. Don't add
   component rules to global `theme.css`.
2. Export it from `src/lib/index.ts`.
3. Add a Vitest test under `test/unit/` (mirror an existing one; harness in `test/harness/` if needed).
4. `pnpm test` green; `pnpm pack` clean (publint).
5. Update `agile/` + rebuild board.

## Git flow — ALL changes follow this

Branching model: **git-flow**.

- `main` — released code only; every commit is a published/taggable state.
- `develop` — integration branch; day-to-day work merges here.
- `feature/<slug>` — branch off `develop`, PR back into `develop`.
- `release/<x.y.z>` — branch off `develop` to stabilize a release, merge into `main` (tagged) **and** back into `develop`.
- `hotfix/<x.y.z>` — branch off `main` for urgent fixes, merge into `main` (tagged) **and** `develop`.

Rules:
- **No direct pushes to `main` or `develop`** — both are protected; merge only via PR with green CI.
- CI (`.github/workflows/ci.yml`) runs `pnpm test` + `pnpm pack` on every PR and on pushes to
  `main`/`develop`. A PR cannot merge until the `test` check passes.
- Conventional Commits for messages (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…). End commit
  messages with the co-author trailer: `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Releasing

1. From `develop`: bump `version` in `package.json` (semver; the `--ss-` rename is breaking → ≥ `0.2.0`).
2. `release/<x.y.z>` → PR into `main`; merge when green; tag `vX.Y.Z` + GitHub release.
3. `pnpm publish --access public` (npm 2FA → pass `--otp <code>`). `prepack` rebuilds `dist/`.
4. Merge `main` back into `develop`.
