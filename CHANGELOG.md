# Changelog

All notable changes to **dssoca** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Until `1.0.0`, minor versions
may include breaking changes (flagged **BREAKING**).

## [Unreleased]

## [0.11.0] — geossoca stats-dashboard charts — 2026-06-15

Four data-viz primitives (`DS-0102` epic) the _geossoca_ performance dashboard needs, built in the
design system so any consumer benefits. Each is token-driven, keyboard-accessible (focusable data,
hover/focus tooltip, screen-reader summary, em-dash empty state), and reuses the existing `Chart`
runtime dependencies (`d3-scale` / `d3-shape` / `d3-array`) — no new dependencies. All read the
`size` axis via `resolveComponentSize`, and ship with a Storybook story, Vitest + axe tests, and a
docs page.

### Added

- **`ScatterPlot`** (`DS-0103`): two-axis scatter with optional quadrant reference lines
  (`xRef` / `yRef` + `quadrantLabels`) and sqrt-scaled bubble sizing. Axes use the padded data
  extent (not forced to zero); points carry direct labels. Drives the "skill vs consistency" and
  "win-rate vs avg-score" comparisons.
- **`BoxPlot`** (`DS-0104`): box-and-whisker distribution (Tukey whiskers) with an optional
  beeswarm overlay of every value (deterministic jitter, SSR-stable). Compares each player's score
  spread — a short box reads as a steady player.
- **`BumpChart`** (`DS-0105`): ranking-over-stages chart — finishing rank (1 at the top) across an
  ordered sequence, with direct series labels at the line ends. Shows who led across a session's
  games.
- **`Heatmap`** (`DS-0106`): value-intensity matrix with row/column headers; cell opacity encodes
  value over `var(--ss-primary)`, `null` cells stay blank (e.g. the diagonal). Renders the 4×4
  head-to-head win grid.

## [0.10.0] — geossoca component gaps — 2026-06-15

Eleven new components (`DS-0090` epic), built to fill the gaps a new consumer — the _geossoca_
score-tracker app — needs. Each ships with a Storybook story, Vitest + axe tests, and a docs page,
and reads the `size` axis via `resolveComponentSize`.

### Added

- **`Chart`** (`DS-0091`): D3-backed multi-series chart — `line` / `area` / grouped `bar`, with
  axes, a legend, and keyboard-accessible hover/focus tooltips. Accepts `number | string | Date`
  x-values (band / linear / time scales).
- **`Table`** (`DS-0092`): typed column defs (align, numeric, `format`, cell snippet), client-side
  sortable headers (`aria-sort`), and an empty-state slot.
- **`Select`** (`DS-0093`): styled native `<select>` reusing the Input field chrome; flat options
  or `<optgroup>`s, label / hint / error wiring.
- **`Modal`** (`DS-0094`): native `<dialog>` — focus trap, `Esc` / backdrop close, title + footer
  snippets, and a `danger` styling hint.
- **`DateField`** (`DS-0095`): styled native `<input type="date">` with `min` / `max`, on the
  shared field chrome.
- **`FileDrop`** (`DS-0096`): drag-and-drop file picker with click-to-browse, `accept` filtering,
  and selected-file display; keyboard operable.
- **`NumberField`** (`DS-0097`): numeric input with stepper buttons, `min` / `max` / `step`
  clamping, and a monospace value.
- **`Tooltip`** (`DS-0098`): hover / focus tooltip (`role="tooltip"`, `aria-describedby`),
  reduced-motion safe.
- **`Avatar`** (`DS-0099`): square initials-or-image avatar with a deterministic palette colour
  hashed from the name.
- **`Pagination`** (`DS-0100`): windowed page controls (prev / next, ellipses, `aria-current`).
- **`Switch`** (`DS-0101`): accessible toggle (`role="switch"`) with a square track + thumb and
  keyboard support.

### Dependencies

- **First runtime dependencies.** `Chart` adds the modular `d3-scale`, `d3-shape`, and `d3-array`
  packages (tree-shakeable). Every other component remains dependency-free.

### Docs

- Per-component pages, the `/components` overview live previews, the category map, the nav, and the
  landing-field curation all updated for the eleven new components.

## [0.9.0] — adoption gaps & tooling hardening — 2026-06-12

Everything the passoca migration revealed as missing (`DS-0079` epic), plus the quality-scan
tooling pass (`DS-0066` epic).

### Added

- **New components** (`DS-0083`–`DS-0086`): `Heading` (display recipe via tokens), `Container`
  (page-width wrapper), `Textarea` (Input's multiline twin with autosize), and `Spinner` —
  10 squared cli-spinners (MIT) text-frame variants, cycling via `$effect`, static under
  reduced motion.
- **`Topbar`** (`DS-0080`–`DS-0082`): link tabs (`{id,label,href}` → real `<a>` with
  `aria-current`; `string[]` still works), optional chrome (`services`/`clock` props, ⌘K chip
  only with `onCommand`), and a responsive scrolling tab strip.
- **`Icon`** (`DS-0087`): 7 new built-in glyphs — `home`, `briefcase`, `folder`, `github`,
  `linkedin`, `language`, `color-swatch`.
- **`Menu`** (`DS-0088`): per-item leading visuals — snippet / swatch / emoji with documented
  precedence.
- **`dssoca/tokens.css`** (`DS-0089`): tokens-only stylesheet entry; `theme.css` output stays
  byte-identical.
- **API additions** (`DS-0078`): `disabled` on `Link` and component-wide on `SegmentedControl`
  and per-item on `BottomNav`; `ariaLabel` on `Topbar` and `EmptyState`. Naming + disabled-state
  conventions written into `DESIGN.md`.
- **Tests** (`DS-0070`/`DS-0071`): +127 tests — parameterized sm/md/lg coverage for every
  component, a size-cascade integration suite, theme-application tests, per-component axe
  coverage, keyboard interaction tests; v8 coverage configured with thresholds
  (lines 89 / statements 88 / functions 90 / branches 76).
- **Tooling — lint** (`DS-0075`): ESLint (flat config: `eslint-plugin-svelte` +
  `typescript-eslint` + `eslint-config-prettier`) and Prettier (`prettier-plugin-svelte`) with
  `lint` / `format` / `format:check` scripts; rule severities tuned to the current tree as an
  adoptable baseline.
- **Tooling — CI** (`DS-0075`): CI now also runs lint, `format:check`, svelte-check (blocking —
  `pnpm check` is clean), the docs suite (`pnpm docs:test`), a Storybook build, and collects v8
  test coverage (uploaded as an artifact).
- **Tooling — release** (`DS-0077`): `scripts/release.mjs` (`pnpm release`) validates the
  version bump against the last tag, checks the git-flow `release/<x.y.z>` branch, drafts a
  changelog stub from conventional commits, and prints the tag/publish/back-merge steps —
  publishing now documents `--provenance`.

### Fixed

- **SSR safety** (`DS-0067`): `window`/`document` listeners in `Topbar`/`Menu` are
  environment-guarded; `Menu`'s outside-click handler null-checks its elements; `Accordion`
  ids derive from `$props.id()` (SSR-stable) instead of `Math.random()`.
- **Image lightbox** (`DS-0078`): the focus trap now excludes disabled focusables and
  `tabindex="-1"` elements (the backdrop no longer participates).
- **BottomNav badge**: hardcoded `#001b04` text → `var(--ss-fg-on-primary)` (`DS-0069`).
- Repo-wide Prettier formatting applied; whole-tree `pnpm check` is clean (0 errors).

### Changed

- **Tokenized chrome** (`DS-0068`): BottomNav badge metrics (`--ss-bottom-nav-badge-*`) and
  LogStream viewport/column metrics (`--ss-log-min-h/max-h/t-w/lvl-w`) are size-aware tokens
  (md = the former px, visually unchanged); ServiceCard/Sidebar/Topbar gaps read spacing
  tokens; Toaster's fly duration reads `--ss-dur-fast`; Sparkline's height fallback reads
  `--ss-icon`.
- **Theming** (`DS-0069`): light `--ss-primary` darkened `#157f3b` → `#147c3a` for WCAG 2.2 AA
  (4.46:1 → 4.64:1); new per-theme `--ss-code-overlay`; explicit light selection overrides;
  `color-scheme` set per theme (ships in `tokens.css` too).
- **Storybook** (`DS-0074`): every component prop exercisable via controls across 18 stories,
  intro/overview MDX page, story-level a11y error params on interactive components.
- **Docs** (`DS-0072`/`DS-0073`): full `--ss-*` token inventory documented (176 tokens),
  `.hs-*` typography classes marked deprecated, README lists all 23 components + full type
  surface, toast API got a canonical reference, dead docs links fixed.
- **Packaging** (`DS-0077`): the root export gained a `"default": "./dist/index.js"` condition
  (after `svelte`), so non-Svelte-aware bundlers/tools can resolve `dssoca`; `publint` stays
  clean. `engines.node >= 24` declared.
- **svelte-check** (`DS-0076`): `pnpm check` is trustworthy again — the root `tsconfig.json`
  no longer overrides `module`/`moduleResolution` to `NodeNext` (inherits `bundler` from the
  generated SvelteKit config), fixing the false `$lib` alias errors, and `test/types.d.ts`
  augments vitest's `Assertion` with the `vitest-axe` matcher types (~55 false errors gone).

## [0.8.2] — components overview & landing field polish — 2026-06-09

Published library: a single `BottomNav` default-data fix; everything else is docs-site only.

### Fixed

- **`BottomNav`** (`DS-0065`): the default `services` item referenced an invalid icon name —
  `'flex'` → `'database'` — which was a type error in the shipped default items (lib + story + test).

### Changed

- **Components overview** (`/components`, docs): the category grids now use `minmax(0, 1fr)` tracks so
  every card is equal width — the `Topbar` preview no longer blows out its column past a third nor
  stretches vertically (it's pinned to the top of the stage at its real shell height). The page is a
  single full-width, left-aligned container (heading, lede, and grids share one edge, matching the
  Tokens page), and the `Image` preview shows a real photo capped to its 16∶9 frame instead of a flat
  gradient filling the card.
- **Landing field** (`DS-0064`, `DS-0065`, docs): each tile cycles independently via a per-tile
  `HubTile` (its own 0.5–2s timer) with a crossfade on value changes and a staggered fade+scale
  entrance; a full-screen radial scrim sits over the dimmed field (a hovered tile still pops); the
  `image` component is dropped from the field; and the field's sample data is fully typed.

## [0.8.1] — landing polish — 2026-06-09

Docs-site only (the published library is unchanged from `0.8.0`).

### Changed

- **Landing** (`DS-0063`): the `/` route is now a full-screen branded hero with **no docs
  shell** (top bar / sidebar hidden). The component "workstation" **fills the viewport** with a
  randomized, repeating pool (~5 tiles per row at 1920px), chrome components (sidebar / topbar /
  log-stream / bottom-nav) are **adapted to their cell**, the logo and `DSSOCA` sit **side by side**,
  the background is a `radial-gradient(circle, rgba(0,0,0,.83), rgba(0,0,0,.4))` behind the dimmed
  tiles (a hovered tile pops to full), the prop-cycle cadence is **0.5–2s**, the description carries a
  contrast `text-shadow`, and the field is **hidden on mobile**.

## [0.8.0] — docs experience, Storybook deploy & branding — 2026-06-09

### Added

- **Landing redesign** (`DS-0060`): the docs homepage is now a centred brand hero (inline mark +
  `DSSOCA` + description + two CTAs) over a full-viewport "workstation" — a tiled field of every
  component, dimmed, where each card lifts to full opacity on hover and continuously cycles its own
  props on independent random 1–4s timers (no layout shift; frozen under `prefers-reduced-motion`).
- **Components overview page** at `/components` (`DS-0062`): every component grouped by category in a
  three-per-line grid of linked, live-preview cards. The "Browse components" CTA points here.
- **Storybook deploys to Vercel** (`DS-0056`) as its own project, via a `VERCEL_DEPLOY_TARGET`
  env-var branch in the shared repo-root `vercel.json` (the docs build path is unchanged).
- Alphabetical ordering of the components in the docs sidebar (`DS-0061`).

### Changed

- **Branding** (`DS-0057`): removed the author's personal name from product/branding/source surfaces.
  The brand logo is renamed `passoca-logo.svg` → `dssoca-logo.svg`, and sample/default data uses a
  neutral `admin` instead of a first name — including the published **`Topbar` default `user`**
  (now `admin@hub.home`) and the `LogStream` demo line. Legal attribution (LICENSE / `author`) and
  the GitHub URLs are intentionally retained.
- **`Sidebar`** (`DS-0058`): the rail now fills its host container's height (`min-height: 100%`), so
  its border/background span the full screen/column instead of stopping at the last item.

### Fixed

- **`Button`** (`DS-0059`): a disabled button no longer brightens or shows the brand glow on hover —
  every hover affordance is gated behind `:not(:disabled)`.

## [Unreleased — earlier]

### Added

- **Documentation site** (`DS-0010`): a SvelteKit + mdsvex docs app under `documentation/` that
  dogfoods dssoca for its own chrome, with an Introduction, Installation, Theming & config, a live
  Tokens gallery rendered from the real `--ss-*` variables, and a page per component that embeds the
  live Storybook story inline. Local-only (run with `pnpm docs:dev`); not shipped in the npm tarball.
- `CHANGELOG.md`, `CONTRIBUTING.md`, and README status badges.

### Removed

- The hub-dashboard showcase route (`src/routes/+page.svelte`) — the documentation site and
  Storybook are now the live previews.

## [0.4.x] — accessibility — 2026-06-07

### Added

- **WCAG 2.2 AA accessibility pass** (`DS-0013`): keyboard support, live regions for toasts,
  reduced-motion handling, and contrast-corrected `--ss-fg-faint` tokens. A11y is covered by
  `vitest-axe` (unit) and `@storybook/addon-a11y` (Storybook).

## [0.4.0] — size system & config manifest — 2026-06-07

### Changed

- **BREAKING** (`DS-0012`): the **size** axis replaces the former **density** axis. The attribute is
  now `data-size-variant` with values `sm` · `md` · `lg` (was `data-density` / `comfy` · `compact`);
  the config field `density` is now `sizeVariant`. Every size-sensitive value is a token so one flip
  rescales the whole chrome.

### Added

- `dssoca.config.ts` manifest (`DS-0011`), exported as `dssocaConfig` — the single source of truth
  for the axes, their values, and defaults; `config.ts` derives its types and defaults from it.

## [0.3.0] — styling pipeline — 2026-06-06

### Changed

- **BREAKING** (`DS-0009`): component styles are now **scoped** inside each component's
  `<style lang="scss">`; the global `theme.css` carries only tokens, base/element styles, and
  app-shell layout.

### Added

- Sass styling pipeline (`DS-0008`): the global stylesheet is authored as `@use` partials in
  `src/styles/` and compiled to `dist/theme.css` by a Dart Sass CLI step in `prepack`.
- Storybook component explorer (`DS-0007`): a story page per component with a theme + size toolbar.

## [0.2.0] — 2026-06-06

### Changed

- **BREAKING**: renamed the CSS custom-property prefix from `--hs-*` to `--ss-*` and the
  component/layout class prefix from `hub-` to `ss-` (`DS-0005`).

## [0.1.0] — 2026-06-06

### Added

- Initial release: a themeable, token-driven Svelte 5 design system (`DS-0001`), the reusable
  component set (`DS-0002`), toast notifications (`DS-0003`), and empty/error-state affordances
  (`DS-0004`).

[Unreleased]: https://github.com/httpassoca/dssoca/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/httpassoca/dssoca/compare/v0.8.2...v0.9.0
[0.2.0]: https://github.com/httpassoca/dssoca/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/httpassoca/dssoca/releases/tag/v0.1.0
