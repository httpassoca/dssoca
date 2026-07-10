---
id: DS-0120
type: story
title: "Remove Badge dismissable behaviour"
status: done
priority: high
tags: [badge, api, breaking, a11y]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a `dssoca` maintainer, I want to remove the dismissable behaviour from `Badge` — the `ondismiss` prop and the trailing `<button class="x">×</button>` dismiss control — so that `Badge` is strictly a non-interactive status/category indicator and doesn't blur into a removable-chip concern that belongs to a future Tag/Chip component.

Currently, when `ondismiss` is set, `Badge` renders a keyboard-focusable dismiss button whose accessible name is derived from `label` (`Remove ${label}`). This makes a "status indicator" double as an interactive control, which is a category error: a Badge communicates state, it isn't actioned.

This is a **BREAKING** change: it removes public API (`ondismiss`) and the rendered button. Consumers who need a removable, interactive chip should not use `Badge` — that is out of scope for this component and would be served by a dedicated Tag/Chip primitive.

## Acceptance criteria
- [x] `ondismiss` prop removed from `Badge`'s `Props` interface and from the destructured `$props()`.
- [x] The trailing `<button class="x">` dismiss control and its `.x` scoped SCSS rule are removed; `Badge` renders **no interactive element** (no `<button>`, no focusable node) in any prop combination.
- [x] The `label`-names-the-dismiss-button coupling is removed; `label` is retained purely for the accessible name of non-text / dot-only / count-only badges so status isn't conveyed by colour alone (WCAG 1.4.1).
- [x] `label` / `role` / `aria-label` semantics for label-less badges (`role="img"`) and live badges (`role="status"`, `aria-live="polite"`) are unchanged.
- [x] CHANGELOG note flags the removed `ondismiss` API and directs consumers needing removable chips to a Tag/Chip component (not `Badge`), drafted under `## [Unreleased]`.
- [x] `pnpm test` green; Badge unit test drops the dismiss-button assertions and adds a regression check that no interactive/focusable element is rendered; `vitest-axe` clean for dot-only, count-only, and labelled badges.
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Part of epic [[DS-0107]] (Badge refinement).
- Source: `src/lib/components/Badge.svelte` — `ondismiss` prop (lines 33-34, 47), the `{#if ondismiss}` `<button class="x">` block (lines 76-83), and the `.x` SCSS rule (lines 142-158).
- **Research — Badge (non-interactive) vs Tag/Chip (dismissable):** the separation is the consistent pattern across mature systems, which justifies pulling dismiss out of Badge:
  - **Shopify Polaris Badge** is a non-interactive status/label indicator — no remove affordance; removal is not part of the Badge contract. (https://polaris-react.shopify.com/components/feedback-indicators/badge)
  - **GitHub Primer** draws the line explicitly: **Label** is "only a styled visual wrapper" (non-interactive), whereas the **Token** component is "almost always interactive" and the remove button lives there, not on Label. (https://primer.style/components/label/, https://primer.style/components/token/)
  - **IBM Carbon** splits read-only `Tag` from the interactive **DismissibleTag** / selectable / operational tag variants — dismiss is an explicit, separate, interactive variant rather than a flag on the base status tag. (https://carbondesignsystem.com/components/tag/style/)
  - This confirms `Badge` should stay presentational; a removable chip is a distinct, interactive component (future Tag/Chip) with its own focus-management and `aria-label` concerns.
- Pairs with [[DS-0119]] (tone redefinition) and [[DS-0121]] (vertical padding) — sequence the breaking Badge changes into one release where possible.
