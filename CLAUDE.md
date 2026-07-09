# dssoca — Claude / agent context

Standalone **Svelte 5 design system**, published to npm as [`dssoca`](https://www.npmjs.com/package/dssoca).
Extracted from the `hubssoca` homelab monorepo (was `@homelab/ui`). Read this before working.

## What it is

A token-driven component library. One `theme.css` + ~13 components. Configured along **two
orthogonal axes**:

| Axis      | Attribute           | Values             | Default |
| --------- | ------------------- | ------------------ | ------- |
| **Color** | `data-theme`        | `dark` · `light`   | `dark`  |
| **Size**  | `data-size-variant` | `sm` · `md` · `lg` | `md`    |

Each component styles itself in a scoped `<style lang="scss">` block and consumes the global
`--ss-*` tokens; flip an axis on any ancestor (usually `<html>`) and everything below
recolors/rescales (custom properties cascade through Svelte's scoped boundary). `theme.css`
carries only tokens, base styles, and app-shell/layout — not per-component rules (since `0.3.0`;
see agile `DS-0009`). Full rationale: `DESIGN.md`. Token table: `docs/tokens.md`. Theme API:
`docs/themes.md`.

**Color architecture (0.12.0, agile `DS-0125`)**: a monochromatic 16-slot terminal palette.
`_tokens.scss` has a GENERATED root layer (19 slots per theme — the 16 ANSI colors + `bg`/`fg` +
`--ss-accent` — in OKLCH; regenerate via `pnpm gen:palette`, recipe in `scripts/lib/palette.mjs`,
drift-guarded by tests — **never edit the marked region by hand**) and a hand-maintained semantic
layer where every other color token derives from the slots via `var()`/`color-mix()`. Custom
palettes: `applyDesignConfig({ palette })` or `paletteToCss()`; interactive generator = the docs
app's `/theme-builder` page. No raw color literals in components — slot-based `color-mix()` washes
instead of the removed `--ss-*-rgb` triplets.

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
- **Docs are a RULE**: every user-facing change ships its docs. Update the component page in
  `documentation/src/lib/docs.config.ts` (`COMPONENTS` — `props`/`usage`/`description`/`notes`) for
  any API change, and `docs/tokens.md` (+ `docs/themes.md` when colors/theming change) for any token
  add/rename/value change. Keep `pnpm docs:test` green. Content = _what exists today_ — no
  speculative APIs.
- **Agile is a RULE**: update `agile/` items on any change (move status, add stories/tasks, bump
  `updated`), then `node build.mjs` in `agile/` to rebuild the board.

## Commands

```sh
pnpm install            # deps (postinstall runs svelte-kit sync)
pnpm dev                # showcase app: live theme + size toggles
pnpm test               # Vitest suite (run once)
pnpm test:watch         # Vitest watch
pnpm test:coverage      # Vitest + v8 coverage report (coverage/)
pnpm lint               # ESLint (flat config, svelte + ts; severity baseline in eslint.config.js)
pnpm format             # Prettier --write (no-semi, single quotes, 2-space, 100 cols)
pnpm format:check       # Prettier --check (CI gate)
pnpm check              # svelte-check (type-checks src + test under the SvelteKit tsconfig)
pnpm pack               # build dist/ via prepack (sync → svelte-package → build:css → publint), make tarball
pnpm build:css          # compile src/styles/theme.scss → dist/theme.css (Dart Sass)
pnpm storybook          # Storybook dev server (port 6006): component pages + axis toolbar
pnpm build-storybook    # static Storybook build → storybook-static/ (gitignored)
pnpm release            # release helper: validates bump/branch, drafts changelog stub, prints git-flow steps
pnpm gen:palette        # regenerate the root-slot palette region of _tokens.scss (--print previews + contrast report)
```

Storybook config lives in `.storybook/` (`main.ts`, `preview.ts`); stories live in `src/stories/`
(**never** `src/lib/` — `svelte-package` would publish them). Stories use Svelte CSF
(`*.stories.svelte`); the preview exposes both design axes as toolbar globals applied to `<html>`.
CI builds it (`pnpm build-storybook`) so a broken story can't merge. **Deploys to Vercel** as its own project alongside the docs site — the repo-root
`vercel.json` branches its `buildCommand` on a `VERCEL_DEPLOY_TARGET=storybook` env var (agile
`DS-0056`); see `documentation/CLAUDE.md` → _Storybook deployment_ for the dashboard setup and the
`VITE_STORYBOOK_URL` docs-embed wiring.

Note: the old "known `$lib` alias error" in `pnpm check` is **fixed** (DS-0076) — the root
`tsconfig.json` no longer overrides `module`/`moduleResolution` to `NodeNext` (it inherits
`bundler` from `.svelte-kit/tsconfig.json`), and `test/types.d.ts` makes the `vitest-axe`
matcher types visible. `pnpm check` is clean (0 errors)
and CI enforces it as a blocking step.

## Adding / changing a component

1. Add `src/lib/components/Foo.svelte` — style it in a scoped `<style lang="scss">` using `--ss-*`
   tokens; `.ss-foo` for the root identity, plain unprefixed names for internals. Don't add
   component rules to global `theme.css`.
2. Export it from `src/lib/index.ts`.
3. Add a Vitest test under `test/unit/` (mirror an existing one; harness in `test/harness/` if needed).
4. `pnpm test` green; `pnpm pack` clean (publint).
5. Update the docs: the component's entry in `documentation/src/lib/docs.config.ts` (props/usage/
   description/notes) and `docs/tokens.md` / `docs/themes.md` for any new/changed tokens; keep
   `pnpm docs:test` green.
6. Update `agile/` + rebuild board.

## Git flow — ALL changes follow this

Branching model: **git-flow**.

- `main` — released code only; every commit is a published/taggable state.
- `develop` — integration branch; day-to-day work merges here.
- `feature/<slug>` — branch off `develop`, PR back into `develop`.
- `release/<x.y.z>` — branch off `develop` to stabilize a release, merge into `main` (tagged) **and** back into `develop`.
- `hotfix/<x.y.z>` — branch off `main` for urgent fixes, merge into `main` (tagged) **and** `develop`.

Rules:

- **No direct pushes to `main` or `develop`** — both are protected; merge only via PR with green CI.
- CI (`.github/workflows/ci.yml`) runs on every PR and on pushes to `main`/`develop`, as a single
  `test` job (the required branch-protection check): `pnpm lint` → `pnpm format:check` → `pnpm check` → `pnpm test:coverage` (coverage artifact) → `pnpm docs:test` → `pnpm pack` (release
  dry-run incl. publint) → `pnpm build-storybook`. Node 24 + pnpm pinned via
  `packageManager`/corepack; concurrency cancels superseded runs. A PR cannot merge until the `test` check passes.
- Conventional Commits for messages (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`…). End commit
  messages with the co-author trailer: `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Releasing

1. From `develop`: bump `version` in `package.json` (semver; until `1.0.0` minors may break),
   branch `release/<x.y.z>`.
2. Run `pnpm release` — it validates the bump against the last tag and the branch name, and
   drafts a CHANGELOG stub from conventional commits (`--write` inserts it under
   `## [Unreleased]`; polish it by hand).
3. PR `release/<x.y.z>` into `main`; merge when green (CI's `pnpm pack` is the release dry-run);
   tag `vX.Y.Z` + GitHub release.
4. `pnpm publish --access public --provenance --otp <code>` (npm 2FA; `--provenance` attaches a
   supply-chain attestation — requires the repo to be the linked npm package origin). `prepack`
   rebuilds `dist/`. Full trusted-publishing from CI (OIDC, no local token) is intentionally out
   of scope for now — publishing stays a manual, provenance-attested step.
5. Merge `main` back into `develop` (git-flow back-merge).
