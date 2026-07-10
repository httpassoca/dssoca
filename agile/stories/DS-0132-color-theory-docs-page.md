---
id: DS-0132
type: story
title: "Docs — Color theory guide page"
status: done
priority: high
tags: [documentation, colors, content]
depends_on: [DS-0126]
parent: null
epic: DS-0125
created: 2026-07-10
updated: 2026-07-10
---

## Description

As a dssoca consumer, I want a narrative guide explaining the philosophy of the color system — why
it is monochromatic, why the dark background is the accent's complement, why sixteen terminal
slots, why OKLCH — and how the slots flow into the semantic tokens and components, so I can use
the palette with intent instead of by imitation.

New `/color-theory` prose page (`documentation/src/routes/color-theory/+page.svx`), placed in the
guide nav between Theming & config and Tokens. Includes a live 19-slot color strip (inline HTML,
theme-reactive), the slot→semantic→component flow table with worked component examples, the
DARK_BG_RULE / lean constants, the audit story, and "the four rules".

## Acceptance criteria

- [x] Page content researched (color-theory lineage: Chevreul → impressionist complementary
      shadows → Itten/Albers → Solarized → OKLCH; ANSI conventions; WCAG rationale) and
      adversarially fact-checked against both the sources and the code — all must-fix findings
      (Itten contrast ordering; overclaimed "components never read slots") corrected.
- [x] NAV entry between /theming and /tokens (`icon: 'note'`); guide-nav test extended.
- [x] Cross-link from the theming page; links to /tokens and /theme-builder.
- [x] Renders correctly prerendered (live strip, table, code fences, no brace leakage — verified
      against the built HTML).
- [x] `pnpm docs:test` (73), docs check + build green.

## Notes

- Content honesty rule: reserved slots (white, bright hues) are described as reserved; terminal
  exports described as planned (DS-0131), not existing.
