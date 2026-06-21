---
id: DS-0117
type: story
title: "Accordion header label overflow prop (wrap | truncate)"
status: done
priority: low
tags: [accordion, api]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a consumer of the Accordion, I want to control how a long header label behaves when it exceeds the available width in `src/lib/components/Accordion.svelte`, because today the `<span class="title">` always wraps to multiple lines (`flex: 1 1 auto; min-width: 0`) with no way to keep headers to a single line. I want a new `overflow: 'truncate' | 'wrap'` prop (default `'wrap'`) where `wrap` preserves today's multi-line behaviour and `truncate` renders the label on a single line with an ellipsis.

## Acceptance criteria
- [x] New prop `overflow?: 'truncate' | 'wrap'` on the Accordion `Props` interface, defaulting to `'wrap'`.
- [x] `wrap` (default) reproduces today's exact behaviour: the label wraps across lines, no API/visual change for existing consumers.
- [x] `truncate` constrains the title to a single line with an ellipsis: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` on `.title` (the required `min-width: 0` is already present on the flex title).
- [x] The mode is applied to the `.title` element only (default header markup); when a custom `header` snippet is supplied, document that the consumer owns its own overflow handling.
- [x] The prop is bindable-free (plain prop), typed, and the default keeps current rendering; both modes verified at sm/md/lg.
- [x] Truncation never clips the chevron/indicator or the hint — the flex layout (`title` flex:1 1 auto, others flex:0 0 auto) keeps them visible.
- [x] Zero border-radius preserved; scoped SCSS with `--ss-*` tokens; Svelte 5 runes for the prop.
- [x] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Refinement research: Polaris exposes a boolean `truncate` on its `Text` component for single-line ellipsis truncation, and a numeric `lineClamp` on `Paragraph`/`Heading` for multi-line clamping — confirming the two distinct shapes (single-line ellipsis vs N-line clamp). This story scopes to the single-line `truncate` vs `wrap` toggle, which is the common header case; a future `lineClamp` could extend it. The CSS for single-line truncation is the standard trio `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` and crucially requires `min-width: 0` on the flex child (already set on `.title`) so the flex item can shrink below its content width. Polaris also notes a truncated label should ideally pair with a tooltip showing the full text (their open issue #11165) — out of scope here but worth a doc note. Sources: https://polaris-react.shopify.com/components/typography/text , https://shopify.dev/docs/api/app-home/polaris-web-components/typography-and-content/paragraph , https://github.com/Shopify/polaris-react/issues/11165
- Low priority / additive: no behaviour change unless the consumer opts into `truncate`. Independent of DS-0115 and DS-0116.
