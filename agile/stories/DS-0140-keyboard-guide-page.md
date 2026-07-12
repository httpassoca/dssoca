---
id: DS-0140
type: story
title: "Docs guide — Making your site keyboard-friendly with dssoca"
status: backlog
priority: high
tags: [documentation, a11y, keyboard]
depends_on: [DS-0136, DS-0137, DS-0138]
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want one guide page that explains how to make my site keyboard-friendly —
what the components already do, how to register shortcuts, and how to stay WCAG 2.2 AA
compliant — so keyboard support is a checklist, not research.

New guide page `documentation/src/routes/keyboard/+page.svx` (mdsvex, the `color-theory` page is
the template — Prose layout, **legacy mode: no runes in demo code**), NAV guide-group entry
`{ label: 'Keyboard', href: '/keyboard', icon: … }`. This page is the canonical home of the
registry API reference from [[DS-0136-shortcut-registry]] (there is no component-docs page for a
`.svelte.ts` module).

Outline:

1. **What you get for free** — table of built-in per-component keyboard behavior (Modal
   trap/Esc, Menu roving + Esc, SegmentedControl/Accordion/Topbar arrows, Tooltip Esc, native
   Select, Topbar skip link) and the `:focus-visible` convention (SC 2.4.7 — never
   `outline: none`).
2. **The baseline before shortcuts** — SC 2.1.1: shortcuts augment, never replace; skip
   link/landmarks for non-Topbar shells (SC 2.4.1); `scroll-padding` under a sticky Topbar
   (SC 2.4.11).
3. **Registering shortcuts** — `shortcuts.add()` vs `{@attach shortcut(...)}`; combo grammar
   table; `mod`; alternatives; `scope: 'focus'`; input guarding and `allowInInputs`; the
   `defaultPrevented` composition rule; conflict policy.
4. **Staying WCAG 2.1.4-compliant** — what a character-key shortcut is; the three lawful
   outcomes mapped to the API (`setEnabled` / `remap` / `scope:'focus'`); wiring `characterKeys`
   to a settings `Switch`; the 6-line localStorage `getOverrides`/`applyOverrides` recipe; SR
   browse-mode caveat (prefer `mod+` combos for anything important); reserved-combo blocklist.
5. **Discovery** — mount `<ShortcutsHelp />`; the **visible trigger** pattern (button bound to
   `open`); `<Kbd>` in buttons/menus/tooltips; `ariaKeyshortcuts()` on the owning control
   (announce only what's implemented; stays truthful under remaps).
6. **Audit checklist** — condensed, printable list an auditor could run.

## Acceptance criteria

- [ ] `/keyboard` page live with the six sections above; content describes only what exists
      (house rule: no speculative APIs).
- [ ] NAV entry added; guide-hrefs `arrayContaining` assertion updated; `pnpm docs:test` green;
      docs build/prerender + `pnpm check` green.
- [ ] Registry API reference (exports, `ShortcutOptions`, grammar, matcher skip chain, overrides)
      embedded and complete.
- [ ] Component pages (`kbd.ts`, `shortcuts-help.ts`, `topbar.ts`, `search-palette.ts`) link to
      the guide. Agile board rebuilt.
