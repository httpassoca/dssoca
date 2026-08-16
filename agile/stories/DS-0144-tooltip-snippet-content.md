---
id: DS-0144
type: story
title: "Tooltip — rendered template content (`text: string | Snippet`)"
status: done
priority: low
tags: [ui, components, tooltip, a11y, api]
depends_on: []
parent: null
epic: null
created: 2026-08-16
updated: 2026-08-16
---

## Description

As a consumer of dssoca, I want to put a small rendered template inside a `Tooltip` — a `Kbd`
chip next to a label, a `<code>` path, an emphasised word, a second line of dim detail — instead
of being limited to one flat string. Today `Tooltip` takes `text: string` and renders it as a text
node (`src/lib/components/Tooltip.svelte:63`), so any markup has to be faked with the trigger or
dropped.

**Decision (locked with the user):** widen the existing prop rather than adding a second one —
`text: string | Snippet`. A string renders as today; a snippet is `{@render}`ed into the tip. No
new prop, no dual source of truth for the accessible description, and the `aria-describedby`
contract stays exactly as it is (the description is whatever the tip element contains).

**Scope guard — non-interactive content only.** The tip keeps `pointer-events: none` and stays
`hidden` while closed, so nothing inside it can be hovered, clicked or focused. That is the
WAI-ARIA tooltip pattern: interactive rich content (links, buttons, a close affordance) belongs to
a *toggletip*/popover, a separate component and a separate story — not to `role="tooltip"`.

**Content model.** The tip is a `<span>` inside an inline-block `<span>` wrapper, so a snippet
must stay **phrasing content** (`span`, `code`, `strong`, `em`, `kbd`, `br`, `Kbd`, `Icon`…). Block
elements would be invalid nesting under the wrapper. The tip gets `display: block` so wrapped
lines and `<br>` lay out sensibly inside the `max-content` / `--ss-tooltip-max-w` box; documented
as a constraint rather than enforced at runtime.

### Prior art

- **MUI Tooltip** (`title: ReactNode`) and **Ant Design Tooltip** (`title: ReactNode`) — same
  shape as this decision: one prop, string or markup.
- **Radix Tooltip** — `Tooltip.Content` takes arbitrary children, but the maintainers explicitly
  decline interactive content ([primitives#985](https://github.com/radix-ui/primitives/issues/985)),
  pointing at `HoverCard`/`Popover` instead.
- **Carbon** splits the two: `Tooltip` for a hint, **Toggletip** for rich/interactive content
  (click-triggered, stays open, Esc to dismiss).
- **HashiCorp Helios** ships a dedicated *Rich Tooltip*; **Inclusive Components**
  (*Tooltips & Toggletips*) argues interactive content never belongs in a tooltip.
  → Consensus: rich **markup** yes, rich **interaction** no. This story takes the markup half.
- **Svelte 5**: snippets are functions, so the union narrows at runtime with
  `typeof text === 'function'` and renders via `{@render text()}`; `import type { Snippet } from 'svelte'`.

Non-breaking: every existing `text="…"` call site keeps working.

## Tasks

- [x] `Tooltip.svelte`: `text: string | Snippet`; branch in the tip via a `tipSnippet` `$derived`
      (`typeof text === 'function'`) → `{@render}`, keeping the `aria-describedby`/`hidden`/Escape
      wiring untouched
- [x] Tip styling: `display: block` (keeps `width: max-content` + the `--ss-tooltip-max-w` cap, and
      trims the template's own leading/trailing whitespace); placements unchanged
- [x] Verified SSR: a throwaway node-environment `svelte/server` render of the harness emits both
      the string tip and the snippet markup (`<strong>`/`<code>`) with `hidden` — identical to the
      client output, so hydration has nothing to reconcile. No lifecycle/platform code on this path.
- [x] Confirmed the `pointer-events: none` / `hidden` guard is untouched — snippet content sits in
      the same tip element, so nothing inside it is focusable or hoverable
- [x] Tests (`test/unit/Tooltip.svelte.test.ts` + `rich` flag on `TooltipHarness`): string path
      regression, snippet markup renders, snippet content is the accessible description via
      `aria-describedby`, hidden/unannounced while closed, Escape dismisses, `vitest-axe` clean
- [x] Storybook (`src/stories/Tooltip.stories.svelte`): _Rich content_ story (a `rich` arg swaps in
      a `<strong>` + `<code>` + `Kbd` snippet tip)
- [x] Docs (`documentation/src/lib/component-docs/tooltip.ts`): `text` typed `string | Snippet`,
      snippet `usage` example, and notes covering phrasing-content-only, no-interactive-content
      (toggletip pointer) and the `--ss-tooltip-max-w` override
- [x] Agile: status → done, `node build.mjs`

## Acceptance criteria

- `<Tooltip text="…">` behaves exactly as before (no visual or a11y change).
- `<Tooltip text={snippet}>` renders the markup in the tip; the trigger's `aria-describedby`
  resolves to it while open, and the tip is absent from the a11y tree while closed.
- Placement (top/bottom/left/right), the reduced-motion path, and the size axis all hold for
  snippet content.
- Docs state the non-interactive / phrasing-content constraint; no interactive element is reachable
  inside a tip.
- `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:test`,
  `pnpm build-storybook`, `pnpm pack` green.

## Notes

- Follow-up candidate (not this story): a **Toggletip/Popover** component for click-triggered,
  interactive rich content — the pattern Carbon/Radix/Helios point to. Worth its own story if a
  consumer needs links or buttons in a hint.
- Related: [[DS-0098-tooltip-implementation]] (original implementation),
  [[DS-0137-kbd-component]] (the most likely thing to embed in a rich tip).
