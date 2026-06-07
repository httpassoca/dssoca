# Changelog

All notable changes to **dssoca** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Until `1.0.0`, minor versions
may include breaking changes (flagged **BREAKING**).

## [Unreleased]

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
