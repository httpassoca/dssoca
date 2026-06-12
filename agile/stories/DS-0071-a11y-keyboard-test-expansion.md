---
id: DS-0071
type: story
title: "A11y & keyboard test expansion — per-component axe + interaction tests"
status: done
priority: high
tags: [tests, a11y, keyboard]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a user relying on keyboard/AT, every interactive component is verifiably accessible.
`test/unit/a11y.test.ts` covers ~10 components broadly, but Card, EmptyState, Sparkline
and LogStream have no axe assertions, and keyboard interaction is mostly untested.

## Acceptance criteria
- [x] At least one `vitest-axe` assertion per component previously lacking one (Card ×3,
  EmptyState ×3, Sparkline ×3, LogStream ×3; extra variants for Accordion ×2 and
  BottomNav ×2) → `test/unit/a11y-coverage.svelte.test.ts` (suite-standard axe options;
  new file because the per-component test files were being edited in parallel).
- [x] Keyboard tests: Badge dismiss button (Enter/Space + aria-label), Button (Enter/Space,
  loading guard, disabled tab-order removal), Input (Tab/Shift+Tab order, clearable
  button keyboard access + focus return), Link button-variant (Enter), LogStream filter
  buttons (toggle + toolbar reachability) → `test/unit/keyboard.svelte.test.ts`.
  jsdom has no native key→click pipeline or Tab traversal, so tests pin the
  component-side platform contract (native button/anchor, focusable, named,
  un-prevented activation key, handler behavior).
- [x] Toast timer tests hardened: `vi.useRealTimers()` guaranteed via a file-wide
  `afterEach` (inline trailing calls removed — they never ran on assertion failure)
  (`test/unit/toast.svelte.test.ts`).
- [x] `pnpm test` green; target WCAG 2.2 AA.

## Notes
- No docs surface — pure test work.
- **Descoped:** the optional shared `<BindingHarness>` refactor (dedupe bind:value +
  output across `test/harness/`, ~470 → ~200 LOC) — it touches existing harness files
  owned by parallel agents this release; revisit after 0.9.0 lands.
- Written against the 0.9.0 checked-out component code; assertions avoid full attribute
  snapshots so the in-flight additive changes (`disabled` on Link/SegmentedControl/
  BottomNav, `ariaLabel` on Topbar/EmptyState) won't break them.
