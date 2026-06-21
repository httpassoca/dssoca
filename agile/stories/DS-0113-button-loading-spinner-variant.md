---
id: DS-0113
type: story
title: "Button — reuse the shared Spinner and let loading pick its variant"
status: backlog
priority: high
tags: [button, api, breaking]
depends_on: [DS-0108]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want `Button`'s loading state to use the shared `Spinner` component and let
me choose which spinner variant shows, so that loading indicators are consistent across the design
system and a button can match the rest of an app's spinner style.

Current behaviour: `src/lib/components/Button.svelte` reimplements a **bespoke inline spinner** —
`<span class="spinner">` styled with a `2px` `currentColor` border and an `ss-btn-spin` rotation
keyframe — entirely separate from `src/lib/components/Spinner.svelte` (the curated cli-spinners
text-glyph component with 10 `variant`s and sm/md/lg sizing). The `loading` prop is a bare
`boolean`. This duplicates animation/reduced-motion logic and means the button can never share the
app's spinner look.

Desired behaviour: the button renders the shared `Spinner` for its loading affordance (inheriting
its frames, reduced-motion handling, and size resolution), and the `loading` prop is widened so the
caller can select the spinner **variant**:

- `loading?: boolean | SpinnerVariant`
- `loading={true}` (or any truthy variant) shows the spinner; `loading={false}` is off.
- When `loading={true}`, the variant is the **configurable default** from
  [[DS-0108-config-default-spinner-variant]] (so the whole DS shares one default), not a hardcoded
  one.
- A `SpinnerVariant` value (e.g. `loading="boxBounce2"`) overrides the default for that button.

This is **BREAKING** at the type level (the prop type changes from `boolean` to
`boolean | SpinnerVariant`) and visually (the spinner glyph changes from the spinning ring to a
cli-spinners glyph). Existing `loading` / `loading={true}` / `loading={false}` call sites keep
working; only the rendered spinner and the prop's type surface change. Document the migration.

Accessibility must be preserved: button stays focusable while loading, `aria-busy="true"`,
`aria-disabled` for soft-disable, the accessible name still resolves via
`loadingLabel ?? aria-label`, and the spinner itself remains decorative-within-the-button (its
`role="status"` is suppressed/`aria-hidden` so the button's own name is the single announcement —
avoid a double live-region).

## Acceptance criteria
- [ ] Button renders the shared `Spinner` component (no bespoke `.spinner` markup, no `ss-btn-spin`
      keyframe) for its loading state.
- [ ] `loading` accepts `boolean | SpinnerVariant`; `true` resolves to the configurable default from
      [[DS-0108-config-default-spinner-variant]]; a `SpinnerVariant` string overrides it; `false`
      renders nothing.
- [ ] The spinner inherits the button's size tier (sm/md/lg) and reduced-motion behaviour from
      `Spinner`.
- [ ] Loading preserves a11y: focusable, `aria-busy`, accessible name via `loadingLabel`, no
      duplicate live-region announcement; clicks/submit still blocked while loading.
- [ ] Button height stays stable between idle and loading (coordinate with
      [[DS-0112-button-icon-height]]).
- [ ] BREAKING change is flagged in the changelog with a migration note; the bespoke spinner removal
      is called out.
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed).

## Notes
- Refinement research:
  - **Shopify Polaris** `Button` `loading` "replaces button text with a spinner"; it renders its own
    `Spinner` with `role="status"`/`aria-label="Loading"` and hides the label so the size stays
    stable — i.e. loading reuses the shared Spinner, it doesn't reinvent one. (polaris-react —
    Button; Spinner.) dssoca should likewise reuse `Spinner.svelte`.
  - **MUI `LoadingButton`** (now folded into `Button`) exposes `loadingIndicator` (default a
    `CircularProgress`) and `loadingPosition`; the indicator is a real shared component, and the
    label is hidden (not removed) so width is preserved. Our `boolean | SpinnerVariant` is the
    token-driven analogue of `loadingIndicator`. (mui.com — Button.)
  - **Svelte 5**: keep the prop a discriminated union typed in `Props`; derive
    `resolvedVariant = $derived(loading === true ? defaultSpinnerVariant : loading)` and render
    `<Spinner variant={resolvedVariant} aria-hidden …/>` only when `loading` is truthy. No new
    runtime state needed.
- File refs: `src/lib/components/Button.svelte` (`loading` prop, `.spinner` / `@keyframes
  ss-btn-spin` to remove, `accessibleName` derivation), `src/lib/components/Spinner.svelte`
  (`SpinnerVariant`, `SPINNER_VARIANTS`). Depends on [[DS-0108-config-default-spinner-variant]] for
  the shared default.
- Cross-links: [[DS-0108-config-default-spinner-variant]], [[DS-0112-button-icon-height]],
  [[DS-0110-icons-via-icon-component]].
