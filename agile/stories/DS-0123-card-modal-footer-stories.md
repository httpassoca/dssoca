---
id: DS-0123
type: story
title: "Storybook: Card & Modal footer-region action examples"
status: backlog
priority: low
tags: [storybook, card, modal, docs]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a consumer evaluating the design system, I want clear Storybook examples of the Card and Modal `footer` snippet regions holding realistic action buttons, so I can see the intended footer-action pattern at a glance. Both components already expose a `footer` snippet (`src/lib/components/Card.svelte`, `src/lib/components/Modal.svelte`), but the showcase coverage is thin: `src/stories/Card.stories.svelte`'s `FullRegions` story only drops a single `Badge` into the footer, and `src/stories/Modal.stories.svelte` shows a Cancel/Confirm footer in the shared template but has no dedicated, labelled footer story. This story adds/extends a11y-clean stories that demonstrate footer action buttons (a Card with footer action buttons; a Modal with a footer holding cancel/confirm actions). There is no standalone Footer component — the user's "footer" request resolves to these Card/Modal footer examples.

## Acceptance criteria
- [ ] `src/stories/Card.stories.svelte` gains (or upgrades) a story demonstrating the `footer` snippet with realistic action buttons (e.g. a secondary + primary `Button` action row), not just a single badge.
- [ ] `src/stories/Modal.stories.svelte` gains a dedicated, named story explicitly demonstrating the `footer` snippet holding cancel/confirm actions (distinct from the default template), so the footer pattern reads as first-class rather than incidental.
- [ ] Buttons reuse the existing `Button` component and its variants (e.g. `ghost`/secondary for dismiss, default/primary for confirm); no bespoke footer styling that bypasses `--ss-*` tokens.
- [ ] Stories are accessibility-clean: the Storybook a11y addon reports no violations; any icon-only/ambiguous control has an accessible name; the Modal footer keeps a valid dialog labelling (`title` → `aria-labelledby`, or `aria-label`).
- [ ] Stories live in `src/stories/` (never `src/lib/`), authored as Svelte CSF (`*.stories.svelte`) consistent with the existing files.
- [ ] CI `pnpm build-storybook` stays green; zero border-radius and `.ss-*` / `--ss-*` conventions respected in any inline demo markup.
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI). Note: footers are showcase-only here — no component API change — so the unit-test surface may be unchanged; keep the suite green.
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed) — ensure the Card/Modal pages note the `footer` snippet usage.

## Notes
- Refinement research: footer action rows are the standard "commit/dismiss" surface in mature systems. Material 3 dialogs align text/action buttons to the **trailing edge**, with the affirmative button trailing the dismissive one (right side in LTR), for simple dialogs. Polaris `Card` exposes explicit footer actions with a `footerActionAlignment` prop — and notably defaults footer actions to **left** alignment, with primary/secondary action distinction, showing the two valid conventions (trailing-aligned in dialogs/modals, often left-aligned in cards). For these stories: model the **Modal** footer as a trailing cancel→confirm pair (matching dialog convention) and the **Card** footer as an action row using primary + secondary `Button` variants, so consumers see both idioms. Cite the alignment choice in the docs note. Sources: https://m3.material.io/components/dialogs/guidelines , https://m3.material.io/components/buttons/guidelines , https://github.com/Shopify/polaris-react/pull/2075 , https://polarisviewcomponents.org/lookbook/inspect/card/card_with_footer_actions
- The Modal default template already wires a `footer` Cancel/Confirm pair; this story makes it an explicit, discoverable story (and ensures the Card mirror exists) rather than leaving footer usage implicit. Low priority / docs-and-showcase only.
