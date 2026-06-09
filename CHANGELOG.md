# Changelog

All notable changes to **dssoca** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Until `1.0.0`, minor versions
may include breaking changes (flagged **BREAKING**).

## [Unreleased]

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

[Unreleased]: https://github.com/httpassoca/dssoca/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/httpassoca/dssoca/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/httpassoca/dssoca/releases/tag/v0.1.0
