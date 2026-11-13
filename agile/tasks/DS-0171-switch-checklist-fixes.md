---
id: DS-0171
type: task
title: "Switch: Front-End Checklist fixes"
status: done
priority: high
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fix the Front-End Checklist findings (issue #139) that name Switch.

### High · `focus-styles` (Switch section + Cross-cutting)

The track's only focus cue was `outline: none; box-shadow: 0 0 0 2px var(--ss-primary-soft)`,
about 1.5:1 (dark) / 1.2:1 (light), so keyboard focus was effectively invisible. **Fixed** by
deleting the `:focus-visible` override, so the global base ring (`outline: 2px solid
var(--ss-primary); outline-offset: 2px`, `_base.scss`) applies.

### Low · `logical-properties` (Cross-cutting)

The thumb used physical `top`/`left` and slid with `translateX(...)`, which kept it sliding
left-to-right under `dir="rtl"`. **Fixed**: the thumb uses `inset-block-start` /
`inset-inline-start`, and the on state moves `inset-inline-start` to
`calc(100% - thumb - pad)` (the containing block is the track's padding box, so this is the same
end position as before). The transition now animates `inset-inline-start` (still disabled under
`prefers-reduced-motion`). No direction detection is needed.

### Vanilla

`vanilla/switch.ts` only toggles `aria-checked` / `.on`; both fixes are pure CSS and reach
`vanilla.css` through the generator. No change needed.

### Tests

`test/unit/Switch.svelte.test.ts` gains source-level CSS contract tests (jsdom can't apply the
scoped cascade): the style block contains no `--ss-primary-soft` and no `outline: none`, and no
physical `left:`/`right:` or `translateX`, and uses `inset-inline-start`. Both fail against the
old source.
