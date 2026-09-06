---
id: DS-0148
type: story
title: "Plain HTML & CSS consumption — dssoca/vanilla.css + dssoca/vanilla.js"
status: done
priority: high
tags: [packaging, css, vanilla, docs, a11y]
depends_on: [DS-0089, DS-0009]
parent: null
epic: null
created: 2026-09-04
updated: 2026-09-04
---

## Description

As someone building a **static site or a quick demo** without Svelte, I want to use the dssoca
components and look from plain HTML, CSS and a little JS. Today the token layer
(`theme.css` / `tokens.css`, [[DS-0089-tokens-only-entry]]) is framework-free, but **no shipped
stylesheet contains a single component rule** — since [[DS-0009-scoped-component-styles]] all
~4,600 lines of component SCSS live in the 41 components' scoped `<style>` blocks and
`svelte-package` copies them as raw `.svelte` files. `DESIGN.md` explicitly says hand-rolling
`class="ss-btn"` stopped working in 0.3.0.

Decisions (locked in the planning interview): a **CSS class layer + dependency-free vanilla JS**
(custom elements rejected — they ship the Svelte runtime + d3 and aren't "pure HTML"); the CSS is
**generated from the components' own style blocks** (never hand-written); the **markup contract is
the exact DOM the Svelte components render** (zero component changes); CSS for all 41 components,
JS for a curated set; one ESM module that auto-wires by delegation; additive stylesheet (loads after
`theme.css`); `@scope` donut isolation; ships as additive minor 0.17.0.

## Tasks

- [x] `src/lib/icons.ts` / `src/lib/spinner-frames.ts` / `src/lib/toast-core.ts` — share the glyph
  table, spinner frames and toast timer with framework-free code; `.svelte` modules re-export
  (public API unchanged). Rename the three unprefixed `@keyframes` to `ss-*`.
- [x] `scripts/lib/vanilla-css.mjs` + `scripts/build-vanilla.mjs` — zero-dep extractor: reads the
  compiled `<style>` blocks from `dist/components/`, wraps each component in
  `@scope (.ss-root) to (<every other root>)` (root-led selectors get a zero-specificity
  `:where(:scope)` prefix so they match the root), hoists `@keyframes` (throws on non-`ss-` names),
  root-anchors the four `:global()` rules, appends CSS-only Spinner keyframes + toast motion. Wired
  into `prepack`; exported as `dssoca/vanilla.css`.
- [x] `src/lib/vanilla/` (TS, no runes, relative `.js` imports) — Modal, Accordion, Menu, Tooltip,
  Switch, SegmentedControl, fields (Input clear, NumberField steppers, Textarea autosize), toast
  store + API, icon hydration, `mount()`, `install()` on import. Exported as `dssoca/vanilla.js`
  (`sideEffects` lists the entry).
- [x] `.ss-table` layout class deprecated in `_layout.scss` (removal: [[DS-0149-remove-layout-ss-table]]).
- [x] Docs: `HtmlExample` on every `ComponentDoc` (41 entries); `+page.server.ts` server-renders
  the real component (`svelte/server` + `createRawSnippet`), strips hashes/hydration markers, adds
  the vanilla hooks, pretty-prints; `ComponentPage` HTML section; `/vanilla` guide; NAV + search;
  installation pointer; docs vitest gains the Svelte plugin + aliases.
- [x] Tests: `vanilla-css.test.ts` (Sass-compiles src at test time; manifest drift, scope shape, no
  hashes/`:global`, keyframes, the 4 globals, Table specificity vs theme.css, determinism, spinner
  appendix), `vanilla-behaviors.test.ts` (copies the REAL Svelte render, drives it through the
  vanilla layer, axe), `vanilla-toast.test.ts`, `vanilla-purity.test.ts`,
  `documentation/test/html-examples.test.ts`.
- [x] README / `DESIGN.md` / `CLAUDE.md` / `documentation/CLAUDE.md` policy text; CHANGELOG 0.17.0.

## Acceptance criteria

- [x] `dssoca/vanilla.css` and `dssoca/vanilla.js` are published entries; `pnpm pack` (publint) clean.
- [x] `vanilla.css` is generated from the components' style blocks in `prepack`; every component has
  a donut `@scope` block; no `svelte-` hash or `:global(` survives; keyframes are top-level and
  `ss-`-prefixed; output is deterministic.
- [x] A page loading `theme.css` + `vanilla.css` + the module renders the docs snippets with the
  Modal, Accordion, Menu, Tooltip, Switch, SegmentedControl, Input, NumberField, Textarea and toast
  behaviours working, from static HTML — verified in headless Chromium.
- [x] The vanilla module never imports Svelte or a `.svelte` file and loads in Node without a DOM.
- [x] Every component page shows a generated HTML snippet containing its root class; `pnpm docs:test`
  enforces it.
- [x] Existing Svelte behaviour, `theme.css` and `tokens.css` output unchanged (byte-identical).
- [x] `pnpm lint`, `format:check`, `check`, `test`, `docs:test`, `pack`, `build-storybook` green.
- [x] Documentation updated (docs `/vanilla` guide + per-component HTML sections, README, DESIGN.md,
  CLAUDE.md, CHANGELOG).

## Notes

- **Prior art.** Bootstrap's `data-bs-*` attribute API is the model for the JS contract (delegated,
  markup-driven, no init call); Pico CSS / Open Props for the "one class-based stylesheet"
  consumption; Shoelace / Web Awesome custom elements were the rejected alternative (a parallel
  markup contract and a shipped runtime).
- **Why `@scope`.** Internals are unprefixed by house rule, so a flat sheet would leak a Card's
  `.label` into a nested Button. Svelte's hash adds a uniform +1 class per selector, so removing it
  keeps intra-component ordering. Two things the headless-Chromium smoke taught us (Chrome 149):
  selectors inside `@scope` are implicitly root-*descendant* selectors, so `.ss-btn { }` in
  `@scope (.ss-btn)` never styles the root — the generator prefixes root-led selectors with
  `:where(:scope)` (zero specificity); and a root that matches its own `to()` limit is excluded,
  so a component's own roots are never in its limit list (nested same-component instances share
  rules, exactly as under Svelte's per-component hash). Hard floor:
  Chrome/Edge 118+, Safari 17.4+, Firefox 2026+ (Baseline per MDN); documented, no fallback.
- **Not ported (documented):** Tooltip collision engine, Toaster swipe-to-dismiss, charts,
  SearchPalette, LogStream, Image lightbox, FileDrop behaviours. Vanilla-only additive attributes:
  `data-ss-*` hooks, Spinner `data-variant`, Segmented `data-value`.
- **Follow-ups:** live HTML playground page on the docs site (not filed yet);
  [[DS-0149-remove-layout-ss-table]] for the 0.18.0 removal.
