---
id: DS-0110
type: story
title: "Rule — all icons render through the shared Icon component; interactive icons get a wrapper"
status: done
priority: high
tags: [icon, consistency, a11y, refactor]
depends_on: [DS-0109]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca maintainer, I want a single, enforced rule that **every icon a component draws is rendered
through the shared `Icon` (`ss-icon`) component** — never a bespoke CSS-border shape or ad-hoc inline
SVG — and that **any interactive icon is wrapped in a real control element (a `div`/`button` hit-area
wrapper), never made the clickable element itself**. This guarantees one icon primitive (consistent
stroke, the named size scale from [[DS-0109-icon-size-scale]], a11y attributes) and accessible,
adequately-sized hit targets for icon affordances.

**Why now:** the codebase has drifted into multiple icon mechanisms. This story establishes the rule
and converts the offenders.

**Audit — offenders to convert / classify (verify against the tree):**
- **Accordion chevron** — currently a *bespoke CSS-border triangle* shape, not `Icon`. Convert it: add
  a `chevron` glyph to `Icon`'s `BUILTIN_PATHS` (Icon today has `arrow` but **no** `chevron`) and
  render the chevron via `<Icon name="chevron" …>`, sized to the resolved icon scale and rotated for
  open/closed state. The header is the interactive element (a `<button>`), so the chevron sits *inside*
  that button as a decorative (`aria-hidden`) visual — it must not itself be the click target. Exact
  alignment/rotation polish is owned by [[DS-0116-accordion-chevron-alignment]]; this story delivers the
  glyph + the "render via Icon" conversion it depends on.
- **Button loading indicator** — currently a bespoke CSS spinner. This is **intentionally not an
  `Icon`**: it is a Spinner concern, handled by [[DS-0108-config-default-spinner-variant]] /
  [[DS-0113-button-loading-spinner-variant]] (a text-frame `Spinner`, not an SVG glyph). Document it as
  a deliberate non-icon and leave it to the Spinner stories — do not force it through `Icon`.
- **Badge dot** — currently a styled `<span>` (a colored status dot), **intentionally not an `Icon`**:
  it is a decorative shape token, not a glyph. Document it as a deliberate non-icon; leave as a span.
- **Confirm already-compliant:** `BottomNav` already renders glyphs through `Icon` — keep as the
  reference pattern. Sweep the rest of `src/lib/components/` for any other inline `<svg>` / CSS-shape
  icons (Menu/Topbar/Pagination/Select chevrons, close "×" affordances, etc.) and either convert them
  to `Icon` glyphs (adding the missing glyph) or explicitly justify them as non-icons in the notes.

**Add missing glyphs:** at minimum `chevron` (for Accordion and any caret/expander affordance). Add any
other glyph a converted offender needs (e.g. a `close`/`x` if a bespoke close shape is found), using the
existing `BUILTIN_PATHS` pattern in `Icon.svelte`.

**Interactive-icon wrapper rule:** an icon that *does something* (toggle, dismiss, navigate) must be the
child of a real interactive element — a `<button>` (preferred) or an explicitly roled/focusable `div`
hit-area wrapper — with the icon marked `aria-hidden` and the control carrying the accessible name
(`aria-label`) and focus/keyboard behaviour. No bare clickable `<svg>`/`Icon`. Capture this as the
written rule plus apply it to every interactive icon found in the audit.

**depends_on [[DS-0109-icon-size-scale]]:** converted icons pin to the named icon scale (xs/sm/md/lg)
rather than magic px, so this must land after the scale exists.

## Acceptance criteria
- [x] Written rule added to docs: (1) all component-drawn icons render through the shared `Icon`
      (`ss-icon`) component — no bespoke CSS-shape or ad-hoc inline `<svg>` icons; (2) interactive icons
      are wrapped in a real control (`<button>` or roled/focusable `div` hit-area), never a bare
      clickable icon.
- [x] `Icon` gains a `chevron` glyph (and any other glyph a converted offender requires) in
      `BUILTIN_PATHS`, following the existing path-map pattern; `IconName` union updated.
- [x] Accordion chevron converted from the CSS-border shape to `<Icon name="chevron">`, sized to the
      resolved icon scale, marked `aria-hidden`, sitting inside the header `<button>` (not itself
      interactive). Visual/rotation polish deferred to [[DS-0116-accordion-chevron-alignment]].
- [x] Audit completed: no component in `src/lib/components/` renders an ad-hoc CSS-shape or inline-SVG
      icon except the explicitly documented non-icons (Button loading = Spinner; Badge dot = styled
      span) — those two are recorded as intentional non-icons.
- [x] Every interactive icon found sits inside a wrapping control with the accessible name on the
      control, `aria-hidden` on the icon, and correct focus/keyboard behaviour (native `<button>`
      preferred over a roled `div`).
- [x] House rules respected: zero border-radius, `--ss-*` / `.ss-*` naming, scoped SCSS, Svelte 5 runes.
- [x] A11y preserved/improved: vitest-axe passes on changed components; accessible names and hit areas
      verified for converted interactive icons; WCAG 2.2 AA (incl. target-size guidance) considered.
- [x] Tests added/updated covering the new `chevron` glyph, the Accordion-via-Icon render, and the
      wrapper/`aria-hidden`/accessible-name structure of converted interactive icons; `pnpm test` green
      (vitest-axe where UI changed).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed) — Icon page lists the new glyph(s); Accordion page notes the chevron is
      now an Icon; a "house rule: icons via Icon, interactive icons get a wrapper" note is recorded.

## Notes
- Refinement research (cited):
  - **Single Icon primitive:** design systems converge on one icon component so size, stroke, and a11y
    are centralized rather than re-implemented per consumer — Carbon, Material, and MUI all expose icons
    through a single `Icon`/`SvgIcon` primitive. This is why the Accordion's CSS-border chevron is an
    anti-pattern: it bypasses the scale and stroke rules that [[DS-0109-icon-size-scale]] establishes.
    (mui.com — Icon component; carbondesignsystem.com — Icons.)
  - **Decorative vs functional SVG a11y:** decorative icons must be hidden from AT with
    `aria-hidden="true"`; a functional icon must carry an accessible name — and there is *no reliable
    way* to use a bare SVG as the sole accessible name of a control. So an interactive icon needs a real
    control wrapping it, with the name on the control. (sarasoueidan.com — Accessible icon buttons; MDN
    — ARIA button role.)
  - **Use a native button, wrap the icon:** WAI-ARIA APG and MDN recommend native `<button>` over
    `role="button"` (free keyboard/focus semantics); MUI's `IconButton` is exactly "a button that wraps
    an icon" with `aria-label` on the button and the glyph decorative — the model adopted here for every
    interactive icon. (w3.org/WAI APG — Button pattern; mui.com — IconButton.)
  - **Target size:** WCAG 2.2 AA adds the 2.5.8 Target Size (Minimum) success criterion (24×24 CSS px
    minimum unless exceptions apply) — another reason the interactive element is a sized wrapper, not the
    raw glyph box, so the hit area can meet the minimum independent of icon px.
  - Non-icon classifications: a text-frame Spinner (Button loading) and a colored status dot (Badge) are
    not glyphs and shouldn't be forced through `Icon`; documenting them prevents future "convert
    everything" churn.
- File refs: `src/lib/components/Icon.svelte` (`BUILTIN_PATHS`, `IconName`); `Accordion.svelte`
  (CSS-border chevron → Icon); `BottomNav.svelte` (reference pattern); sweep `Menu`/`Topbar`/`Pagination`/
  `Select`/`Modal` close affordances; `Button.svelte` + `Badge.svelte` (documented non-icons);
  `documentation/src/lib/docs.config.ts` (Icon + Accordion pages).
- Cross-links: depends on [[DS-0109-icon-size-scale]]; feeds [[DS-0116-accordion-chevron-alignment]]
  (chevron glyph + alignment) and the umbrella [[DS-0111-coordinated-inner-sizes]] (converted icons must
  take their size from the parent component); sibling of [[DS-0108-config-default-spinner-variant]] under
  epic DS-0107.
