---
id: DS-0013
type: story
title: "Accessibility pass (WCAG 2.2 AA, Tier 2)"
status: done
priority: high
tags: [a11y, quality, testing]
depends_on: []
parent: null
epic: null
created: 2026-06-07
updated: 2026-06-07
---

## Description
As a consumer, I want the components to meet **WCAG 2.2 AA** so the design system is usable with a
keyboard and assistive tech. This is a "Tier 2" pass: fix the concrete per-component gaps, add the
system-wide wins (reduced motion, a failing contrast token), and wire automated a11y testing —
without the riskier structural rewrites (converting `role="button"` divs to native buttons and a
blocking CI gate are deferred to a possible Tier 3). Non-breaking.

## Acceptance criteria
- [x] **Keyboard:** `role="button"` `<div>`s (`Sidebar`, `ServiceCard`) handle **Space and Enter** (with `preventDefault`); `aria-current="page"` on the active sidebar item + topbar tab. Topbar's `⌘K`/shortcut number are decorative (no action) → marked `aria-hidden` rather than faked as interactive; user-email left as plain text. (Converting these to real, actioned controls is deferred.)
- [x] **Live regions:** `Toaster` uses a stable `role="status"` container with `role="alert"` for the `error` kind; resolve the `role="region"` + `aria-live` + `<output>` nesting so messages announce once
- [x] **Icons / decorative:** `Icon` is `aria-hidden` by default with an optional `title`/label for standalone use; `aria-hidden` on decorative bits (Badge/Sidebar status dots, Sparkline bars, MetricTile delta arrows, EmptyState emoji)
- [x] **Forms:** `Input` requires or auto-generates an `id` when a label is present (so `for`/`id` always links) and supports `aria-describedby` / `aria-invalid`
- [x] **Semantics:** Card / EmptyState titles use heading semantics (or a configurable level); expand the `deg` badge label to "degraded" (or add a `title`)
- [x] **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses `--ss-dur-*` in `_tokens.scss`, and Toaster's `fly` transition is guarded via Svelte 5 `prefersReducedMotion`
- [x] **Contrast:** darken `--ss-fg-faint` (#6f6f6f → ~#8a8a8a) so it clears 4.5:1 AA on bg and bg-elev (it currently fails at 3.8:1 / 3.3:1)
- [x] **Tooling:** added `vitest-axe` (`toHaveNoViolations`, wired in `test/setup.ts`) with a `test/unit/a11y.test.ts` axe suite over the key components; added `@storybook/addon-a11y`. Svelte compiler a11y warnings surface in the dev/Storybook build. CI a11y gate is **soft** (axe tests run but a dedicated blocking gate is deferred to Tier 3)
- [x] Target **WCAG 2.2 AA**; non-breaking; `pnpm test` green; `pnpm pack` clean; agile + board rebuilt

## Notes
- Audit findings (current state): native `<button>` in Button/Toaster-dismiss, global
  `:focus-visible`, labelled Input, Toaster live region already exist — good baseline. Gaps are
  the Space key on div-buttons, no reduced-motion anywhere, the failing `--ss-fg-faint` contrast,
  and no automated a11y tests.
- `vitest-axe` runs in jsdom and **cannot check color contrast** (no layout) — it catches
  structural/ARIA issues; `@storybook/addon-a11y` runs axe in a real browser for contrast/full rules.
- **Deferred to Tier 3** (not this story): converting `role="button"` divs to native `<button>`,
  a proper Topbar `tablist` keyboard pattern, and making a11y a blocking CI gate.
- Darkening `--ss-fg-faint` is a small visual change — flag for design review.
- Independent of the others, but best done after [[DS-0012-config-driven-size-system]] so the a11y
  pass covers the final component shapes; documented by [[DS-0010-custom-docs-site]].
- Research: WCAG 2.2, WAI-ARIA APG keyboard/button, Sara Soueidan on ARIA live regions,
  `prefers-reduced-motion` (MDN/web.dev), `vitest-axe`, `@storybook/addon-a11y`.

## Follow-up — light-theme contrast (2026-06-07)
The **light** theme previously only overrode surfaces + foreground, so the neon dark-mode brand /
status / code colours bled through onto a near-white page and failed contrast. Fixed in
`_tokens.scss`:
- `--ss-bg` softened to `#f0f0f0` (was `#fefefe`); `--ss-line(-strong)` strengthened.
- Foregrounds retuned for AA on `#f0f0f0` + `#ffffff` (`--ss-fg-muted`/`--ss-fg-faint`).
- Light-mode overrides added for the **brand** (`--ss-primary` → deep green `#157f3b`,
  white `--ss-fg-on-primary`), **status**, **lime**, and **code** (`--ss-code-*`) palettes.
- New theme-aware `--ss-hover` + `--ss-primary-hover` tokens replace hardcoded `rgba(255,255,255,…)`
  / `#7df089` hovers (Button, Sidebar, Topbar, `_layout` table) that were invisible/over-bright on
  light surfaces.
