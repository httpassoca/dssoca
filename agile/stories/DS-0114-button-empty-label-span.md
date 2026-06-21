---
id: DS-0114
type: story
title: "Button — no empty label span should render when there are no children"
status: backlog
priority: low
tags: [button, layout, a11y]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want a loading/icon-only `Button` with no text to render no empty label
box, so that the loading spinner sits perfectly centred and there's no stray 0×0 element offsetting
the content.

Reported symptom: an empty `<span class="label">` appears to render even with no children,
producing a zero-size span next to the loading spinner and pushing it off-centre.

Investigation note — the true root cause must be confirmed across **both** files:

1. `src/lib/components/Button.svelte` — `.label` is **already** guarded by `{#if children}`
   (`{#if children}<span class="label">{@render children()}</span>{/if}`), so on the component alone
   no empty label should render. This must be verified, not assumed.
2. `src/stories/Button.stories.svelte` — the shared `template` snippet **always** renders content:
   for non-`iconOnly` it emits `{args.label}` as the child (default `args.label: 'Button'`), and the
   `Loading` story passes `label: 'Deploy'`. So the "empty span" likely comes from the story always
   passing a child (the label text is still in the DOM, just visually competing with the spinner),
   not from the component leaving an empty `.label`. The story is the probable source of the
   off-centring people see in Storybook.

Desired behaviour: confirm and lock in that no empty `.label` box exists when there are no children
(component contract), and that the loading state is perfectly centred for both the no-children case
and the label case — the spinner is the visual centre when there is no text. Adjust the Storybook
`template`/`Loading` story if it is the thing forcing a label into a loading button, so the
showcase reflects the real centred behaviour.

## Acceptance criteria
- [ ] When `Button` is rendered with no `children`, **no** `.label` element exists in the DOM
      (assert absence, not just emptiness).
- [ ] Loading spinner is centred in the button for both the no-children/icon-only case and the
      with-label case (no stray 0×0 box offsetting it).
- [ ] Root cause is identified in writing as living in Button.svelte and/or the Storybook template;
      the actual offender is fixed (no speculative change to the innocent file).
- [ ] No border-radius override; internals stay plain unprefixed scoped names; `--ss-*` tokens only
      for any spacing.
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI changes) — including a test that
      asserts no `.label` node when `children` is absent.
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed).

## Notes
- Refinement research:
  - **Polaris** hides (or removes) the label when `loading` so the spinner is the visual centre and
    nothing competes with it; the guidance is explicitly to drop the text from layout while loading.
    (polaris-react — Button; the a11y discussion in Shopify/polaris#1212 on conveying button status.)
  - **MUI `LoadingButton`** keeps the label in the DOM but `visibility: hidden` so the spinner
    overlays a centred, reserved box — a different trade-off (preserve width) vs. dssoca's
    remove-when-empty contract. Worth a one-line note in the docs on why dssoca chooses
    render-nothing for the no-children case.
  - **Carbon/Radix** treat an icon-only control as having no text node and rely on `aria-label`
    instead of an empty text span — matches Button's `iconOnly` → `aria-label` path here.
  - Conclusion: the component's `{#if children}` guard is correct; the fix (if any) is in the
    Storybook `template`/`Loading` story that always injects a label, plus a regression test pinning
    the no-empty-`.label` contract.
- File refs: `src/lib/components/Button.svelte` (`{#if children}<span class="label">…`),
  `src/stories/Button.stories.svelte` (`template` snippet `{args.label}`, `Loading` story args).
- Cross-links: [[DS-0112-button-icon-height]], [[DS-0113-button-loading-spinner-variant]].
