---
id: DS-0111
type: story
title: "Architecture — components dictate coordinated inner sizes (icons + text + spacing move together)"
status: done
priority: high
tags: [sizing, consistency, architecture]
depends_on: [DS-0109, DS-0110]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want a component at a given size to drive its **nested icons, text, and spacing
to the matching step** so that, e.g., a `sm` Accordion renders `sm` icons + `sm` text + tightened
spacing as one coherent unit — instead of relying on an accidental CSS cascade that happens to land
right. This story establishes the **rule and the repeatable mechanism**, then applies it across all
size-aware components (not a one-off).

**Problem today:** components carry `data-size-variant` on their root (via `resolveComponentSize`) and
nested `--ss-*` tokens rescale *implicitly* through the cascade — but components do **not** explicitly
hand their resolved size to nested components. So a nested `Icon`/`Spinner` only happens to look right if
the cascade reaches it; nothing guarantees coordination, and inner spacing isn't reliably stepped with
size. Accordion already defines local micro-tokens (`--ss-acc-*`) per `[data-size-variant]`, proving the
pattern works but is currently ad hoc and per-component.

**The convention to define (documented + repeatable):**
1. **Resolve once, at the root.** A component resolves its effective size with
   `resolveComponentSize(name, size)` and applies it as `data-size-variant` on its root (already the
   pattern). This is the single size decision for the whole subtree.
2. **Pass size down explicitly.** When the component renders a nested *component* (`Icon`, `Spinner`,
   nested `Badge`, etc.), it passes the resolved size down explicitly — e.g.
   `<Icon size={resolved} …>` (Icon's local `xs|sm|md|lg` scale from [[DS-0109-icon-size-scale]]) —
   rather than trusting the cascade. Define a documented mapping where the global axis and Icon's local
   scale differ (e.g. component `sm` → Icon `sm`), and the convention for choosing the icon step
   relative to the component (icons generally sit one optical step below the text box).
3. **Step spacing in lockstep.** Inner padding/gap use size-stepped `--ss-*` spacing tokens (or
   component-local `--ss-<name>-*` micro-tokens defined per `[data-size-variant]`, like Accordion's
   `--ss-acc-*`) so spacing tightens/loosens with size — never hardcoded px. Standardize the
   micro-token naming so every component follows Accordion's shape rather than inventing its own.
4. **Don't break layout harmony.** Coordinated steps must preserve alignment and optical balance
   (heights, baselines) across sm/md/lg — this couples to [[DS-0112-button-icon-height]] (the control
   owns its line-box so a taller icon doesn't grow it) and [[DS-0121-badge-remove-vertical-padding]]
   (badge inner proportions align to the same convention).

**Scope:** produce the written convention and apply it to **all** size-aware components in
`COMPONENT_NAMES` that nest icons/text/spacing — at minimum the representative set (Accordion, Button,
Badge, Menu, BottomNav, Input/Select affixes) updated to pass size down explicitly and use stepped
spacing tokens. The umbrella is this story; [[DS-0112-button-icon-height]] and
[[DS-0121-badge-remove-vertical-padding]] are specific alignments under it.

**depends_on [[DS-0109-icon-size-scale]]** (the named icon scale that components pass down) **and
[[DS-0110-icons-via-icon-component]]** (icons must be real `Icon` components before a parent can hand
them a `size`).

## Acceptance criteria
- [x] A written, repeatable convention is documented (docs site + a design note): resolve size once at
      the root via `resolveComponentSize`, pass it explicitly to nested `Icon`/`Spinner`/etc., and use
      size-stepped `--ss-*` (or standardized `--ss-<name>-*`) spacing tokens — covering ALL size-aware
      components, not a single example.
- [x] A documented size-mapping convention exists for cases where the component's global axis and the
      nested Icon local scale (`xs|sm|md|lg`) differ, including the rule for picking the icon step
      relative to the component's text box.
- [x] At least the representative components (Accordion, Button, Badge, Menu, BottomNav, and one
      Input/Select affix) are updated to pass their resolved size down explicitly to nested components
      and to use stepped spacing tokens (no hardcoded inner px) — and component-local micro-token naming
      is standardized (following Accordion's `--ss-acc-*` shape).
- [x] sm / md / lg of each updated component keep harmonious internal proportions (icon : text : spacing
      coordinated; alignment/baselines preserved) — demonstrated via a test/visual proof (snapshot or
      Storybook size-matrix) at all three steps.
- [x] House rules respected: zero border-radius, `--ss-*` / `.ss-*` naming, scoped SCSS, Svelte 5 runes,
      new chrome reads size tokens (never hardcoded px so it rescales).
- [x] A11y preserved: vitest-axe passes on updated components; size coordination does not reduce target
      sizes below WCAG 2.2 AA target-size guidance or break focus order.
- [x] Tests added/updated proving size propagates (a nested `Icon`/`Spinner` receives the component's
      resolved size) and that spacing steps with size; `pnpm test` green (vitest-axe where UI changed).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed) — the coordinated-inner-sizes convention is written up, the standardized
      micro-token naming is in docs/tokens.md, and each updated component page reflects its size
      behaviour.

## Notes
- Refinement research (cited):
  - **Material density:** Material applies higher density by reducing spacing and/or component size in
    coordinated steps, and treats density as a deliberate, component-aware adjustment rather than an
    accidental scale-down — i.e. a component decides its inner spacing for a density, the inner bits
    don't drift independently. This is the model for "the component dictates its inner sizes."
    (m2.material.io — Applying density; m3.material.io — Design tokens.)
  - **Carbon size tokens:** Carbon ships explicit size *tokens/steps* (e.g. field sizes sm/md/lg/xl) and
    pins icon sizes to its 16/20/24 scale so icons stay coordinated with the type and control step — the
    inner pieces are chosen per step, not left to the cascade. Our explicit `size` pass-down +
    stepped spacing mirrors this. (carbondesignsystem.com — size tokens / Icons.)
  - **MUI `size` prop threading:** MUI exposes a `size` prop and uses `theme.defaultProps` to set it
    globally; crucially compound components forward `size` to their children (e.g. a sized control hands
    its size to nested inputs/icons) rather than relying on inherited CSS — validating *explicit
    propagation* over implicit cascade. (mui.com — Density / default props.)
  - **Svelte 5 mechanism:** explicit pass-down is just props (`<Icon size={resolved}>`) — no context
    needed for parent→direct-child; `config.ts`'s `resolveComponentSize` already centralizes the
    decision. If deep/indirect propagation were needed, Svelte context (`setContext`/`getContext`, or a
    runed context module) would carry the resolved size down a subtree; noted as the escape hatch but not
    required for the representative components, which nest icons directly. (svelte.dev — Context.)
  - **Why not rely on the cascade:** the cascade rescales `--ss-*` tokens but gives no guarantee a nested
    *component* picks the right discrete step (Icon's local `xs|sm|md|lg`), and provides no coordination
    for spacing steps; explicit pass-down + stepped tokens makes the coordination intentional and
    testable. Takeaway adopted: keep the cascade for tokens, but make component→child *size* explicit.
- File refs: `src/lib/config.ts` (`resolveComponentSize`); `src/lib/components/Accordion.svelte`
  (`--ss-acc-*` micro-tokens = the reference pattern), `Button.svelte`, `Badge.svelte`, `Menu.svelte`,
  `BottomNav.svelte`, an Input/Select affix; `src/styles/_tokens.scss` (stepped spacing tokens);
  `docs/tokens.md`, `documentation/src/lib/docs.config.ts`.
- Cross-links: depends on [[DS-0109-icon-size-scale]] and [[DS-0110-icons-via-icon-component]]; umbrella
  for [[DS-0112-button-icon-height]] and [[DS-0121-badge-remove-vertical-padding]]; sibling of
  [[DS-0108-config-default-spinner-variant]] under epic DS-0107.
