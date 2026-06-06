---
id: DS-0009
type: story
title: "Scoped component styles"
status: todo
priority: high
tags: [styling, refactor, breaking]
depends_on: [DS-0008]
parent: null
epic: null
created: 2026-06-06
updated: 2026-06-06
---

## Description
As the design-system maintainer, each component owns its styling in a scoped
`<style lang="scss">` block instead of relying on global `.ss-*` rules, so styles live next to
the markup they style and can't leak. The global stylesheet shrinks to what genuinely must be
global — `--ss-*` tokens, base/element styles, and app-shell/layout.

**Breaking** (→ `0.3.0`): the global `.ss-*` *component* rules are removed from the published
`theme.css`. Components still render correctly (they apply their own classes and consume tokens
via `var(--ss-*)`, which cascade through Svelte's scoped boundary). Only consumers who hand-wrote
raw `<button class="ss-btn">` against `theme.css` — instead of using the components — are
affected. Depends on [[DS-0008-sass-styling-pipeline]].

## Acceptance criteria
- [ ] Component-owned rules moved from the global `_components` partial into each component's `<style lang="scss">`: Badge, Button, Card, Input, LogStream, MetricTile, ServiceCard, Sparkline, Topbar, Sidebar; EmptyState + Toaster normalized to the same convention. Icon and PassocaMark (SVG utilities) need little/no change
- [ ] **Naming rule** applied: `ss-` is reserved for component identity / non-generic design-system classes. Component roots keep their `.ss-*` name (`.ss-btn`, `.ss-badge`, `.ss-panel`, `.ss-input`, `.ss-field`, `.ss-metric`, `.ss-svc`, `.ss-spark`, `.ss-logs`, `.ss-topbar`, `.ss-side`, `.ss-toast(er)`, `.ss-empty`); generic internal sub-elements use plain scoped names (`.dot`, `.title`, `.head`, `.body`, `.msg`, `.icon`, `.bar`…)
- [ ] `.ss-panel-head` / `.ss-panel-body` (the only ss-prefixed *sub-element* classes) renamed to local `.head` / `.body`; Card's ~4 test assertions updated. All other `.ss-*` root selectors unchanged, so the rest of the suite is untouched
- [ ] `theme.css` retains only: `--ss-*` tokens, base/element resets + `.hs-*` typography, app-shell/layout classes (`.ss-app`, `.ss-main`, `.ss-pageHead`, `.ss-metrics`, `.ss-grid-2`, `.ss-svc-grid`, `.ss-footer`), and generic utilities (`.ss-line`). The migrated component rules are deleted from the global CSS
- [ ] Components consume `--ss-*` via `var()` inside scoped blocks; all four axis combinations recolor/rescale correctly; zero border-radius preserved
- [ ] `:global()` used where a component styles projected `{@render children()}` / snippet content (scoped styles don't reach rendered children) — verify Card body and any similar cases
- [ ] Internal raw `.ss-` usages fixed: Toaster and Input stories use the real components; the bogus `.ss-btn--primary` class (never matched the real `.ss-btn.primary`) removed
- [ ] `DESIGN.md` + `CLAUDE.md` updated: replace the "components are thin wrappers over global `.ss-*` classes" framing with the scoped model + the `ss-`-for-identity naming rule + what stays global; reconcile `docs/themes.md` / `docs/tokens.md` if they reference the old model
- [ ] `pnpm test` green (only Card selectors changed); `pnpm pack` clean; showcase + Storybook render identically
- [ ] `version` bumped to **0.3.0** (breaking) with a short migration note (raw `.ss-*` component classes removed — use the components); agile updated + `node agile/build.mjs`

## Notes
- **Why tests barely move:** Svelte keeps the original class names in the DOM (adding a hash),
  so `querySelector('.ss-btn')` etc. still match as long as the class stays in markup. The only
  renames are the two `.ss-panel-*` sub-element classes.
- **Cascade is safe:** CSS custom properties inherit through Svelte's scoped-style boundary
  (no shadow DOM) — already proven by the existing `EmptyState.svelte` scoped block.
- Builds directly on [[DS-0008-sass-styling-pipeline]]: lift each block out of `_components.scss`
  into its component's `<style lang="scss">`, then delete the staging partial.
- Out of scope: renaming the legacy `.hs-*` typography prefix (stays global in base).
