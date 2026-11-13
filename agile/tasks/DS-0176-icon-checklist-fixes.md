---
id: DS-0176
type: task
title: "Icon: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Front-End Checklist findings for Icon (issue #139).

### Low · security (`{@html}` sink) — fixed

`paths` and `registerIcon` strings were injected raw. The escape hatch still works (no API
change); it now has a documented trust requirement and a light filter:

- `src/lib/icons.ts`: new `sanitizeIconMarkup()` strips `<script>` blocks, `<foreignObject>`
  blocks, stray `script`/`foreignObject` tags, `on*` event-handler attributes (also after a `/`
  separator) and `javascript:` `href`/`xlink:href` values, repeating until stable so split
  payloads can't reassemble. `resolveIcon()` returns sanitised markup, so registered glyphs, direct
  writes to the public `PATHS` record, and the vanilla `iconSvg`/`hydrateIcons` path are covered.
  Built-ins come back byte-identical; drawing markup (`<path>`, `<g>`, `<defs>`, `<style>`,
  `<use>`, `<text>`, every presentation attribute) is untouched.
- `Icon.svelte`: the `paths` prop goes through the same filter; the `svelte/no-at-html-tags`
  disable now sits on the actual `{@html}` line (it was misplaced above `<svg>` and the lint
  warning was firing).
- Trust requirement documented in the JSDoc of `registerIcon` and the `paths` prop, and in the
  docs page (`paths` prop desc + notes). The filter is described as defence in depth, not a
  security boundary.

### Tests

- `test/unit/Icon.svelte.test.ts` → "escape-hatch sanitiser": built-ins unchanged; legitimate
  markup (defs/style/gradient/g/use/text, a class containing "online", text "on = off")
  unchanged; script/foreignObject/on*/javascript: payloads stripped; `paths` prop and
  `registerIcon` (and direct `PATHS` writes) render without script vectors.
- `test/unit/vanilla-icon.test.ts` (new): `iconSvg` and `hydrateIcons` render sanitised
  registered markup.
