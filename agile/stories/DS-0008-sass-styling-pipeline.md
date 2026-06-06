---
id: DS-0008
type: story
title: "Sass-based styling pipeline"
status: todo
priority: high
tags: [styling, sass, build, refactor]
depends_on: []
parent: null
epic: null
created: 2026-06-06
updated: 2026-06-06
---

## Description
As the design-system maintainer, I author the global styling in **Sass** instead of
hand-written CSS — split into partials, with nesting and mixins for the repeated rule patterns —
while keeping the published `dssoca/theme.css` output and the `--ss-*` token + `data-theme`/
`data-density` cascade model exactly as they are today. This also enables `<style lang="scss">`
in components so the follow-up scoped-styles work (DS-0009) can use Sass from the start.

Foundational and **non-breaking**: the compiled CSS is functionally identical, so nothing
changes for consumers. Sequenced first so DS-0009 writes scoped SCSS directly rather than
rewriting every component twice (CSS then SCSS).

## Acceptance criteria
- [ ] `sass` added as a devDependency; `vitePreprocess()` enabled via the `preprocess` field in `svelte.config.js` (uses the already-installed `@sveltejs/vite-plugin-svelte`)
- [ ] `src/lib/theme.css` reauthored as Sass partials under `src/styles/` (outside `src/lib`, so `svelte-package` never publishes them): `_tokens.scss`, `_base.scss`, `_layout.scss`, `_components.scss`, and a `theme.scss` entry that `@use`-s them
- [ ] `--ss-*` tokens remain **explicit CSS custom properties** (not Sass `$variables`, not generated from maps); Sass is used only for structure (partials/nesting/mixins). All four axis combinations (dark/light × comfy/compact) still recolor/rescale identically
- [ ] Zero border-radius and the `--ss-*` / `.ss-*` prefixes preserved (house rules)
- [ ] `prepack` compiles `src/styles/theme.scss` → `dist/theme.css` via a **Dart Sass CLI** step run *after* `svelte-package`; the `./theme.css` → `./dist/theme.css` export is unchanged
- [ ] Component `<style lang="scss">` compiles through `svelte-package` once the preprocessor is set — no extra config (svelte-package preprocesses `.svelte`; only standalone `.scss` needs the separate CLI step)
- [ ] Dev/showcase/Storybook imports updated to the `.scss` entry (Vite compiles on the fly): `src/routes/+page.svelte`, `.storybook/preview.ts`
- [ ] `pnpm pack` tarball contains `dist/theme.css` and **no** `.scss`; `pnpm test` green (121); `pnpm dev` + `pnpm build-storybook` render identically to before
- [ ] `version` bumped to **0.2.1** (patch — non-breaking); agile updated + `node agile/build.mjs`

## Notes
- **Why a separate CLI step:** `svelte-package@2.5.8` only preprocesses `.svelte`/`.ts`/`.js`
  and copies everything else verbatim (`node_modules/@sveltejs/package/src/index.js:258,285`),
  so a standalone `theme.scss` would ship un-compiled. The Dart Sass CLI step produces the
  published `dist/theme.css`.
- Keep token blocks hand-written/explicit (they are the documented source of truth in
  `docs/tokens.md`); don't DRY them into Sass maps/loops at the cost of readability.
- `_components.scss` is a staging home for the current `.ss-*` component rules — DS-0009 lifts
  each block out into its component, leaving this partial empty/removed. See [[DS-0009-scoped-component-styles]].
- Follows the same "source lives outside the published `src/lib`" pattern used for `src/stories/`
  in [[DS-0007-storybook-component-explorer]].
