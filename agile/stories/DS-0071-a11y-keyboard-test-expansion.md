---
id: DS-0071
type: story
title: "A11y & keyboard test expansion — per-component axe + interaction tests"
status: todo
priority: high
tags: [tests, a11y, keyboard]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a user relying on keyboard/AT, every interactive component is verifiably accessible.
`test/unit/a11y.test.ts` covers ~10 components broadly, but Card, EmptyState, Sparkline
and LogStream have no axe assertions, and keyboard interaction is mostly untested.

## Acceptance criteria
- [ ] At least one `vitest-axe` assertion per component in its own test file (notably Card,
  EmptyState, Sparkline, LogStream; more variants for Accordion and BottomNav).
- [ ] Keyboard tests: Badge dismiss button (Enter/Space + aria-label), Button (Enter/Space),
  Input (Tab/Shift+Tab, clearable button keyboard access), Link button-variant (Enter),
  LogStream filter buttons.
- [ ] Toast timer tests hardened: `vi.useRealTimers()` guaranteed via afterEach/try-finally
  (`test/unit/toast.svelte.test.ts`).
- [ ] `pnpm test` green; target WCAG 2.2 AA.

## Notes
- No docs surface — pure test work.
- Optional refactor while in there: shared `<BindingHarness>` to dedupe the bind:value +
  output pattern repeated across `test/harness/` (~470 → ~200 LOC).
