---
id: DS-0118
type: story
title: "Icon — Storybook controls drive the full prop surface"
status: backlog
priority: low
tags: [icon, storybook, dx]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca contributor exploring `Icon` in Storybook, I want every control to visibly change the rendered
icon, so that the story is a faithful, interactive reference for the component's API rather than a dead
panel.

Current behaviour: `src/stories/Icon.stories.svelte` only wires `name` and `px`. Its `argTypes` declare just
those two, and the `template` render snippet only forwards `name` + `px`:
`<Icon name={args.name} px={args.px} />`. As a result every other meaningful Icon control —
`size`, `variant`, `spin`, `rotate`, `flip`, `strokeWidth`, `absoluteStroke`, and the a11y props
`title` / `decorative` — is absent from the controls panel, and even if added would do nothing because the
render snippet drops them. The controls panel does not reflect the component's real surface.

Desired behaviour: the Icon story exposes and *applies* the full meaningful prop surface so each documented
control visibly drives the rendered icon. Add `argTypes` (with appropriate control kinds) and forward the
matching props through the `template` snippet:
- `size` — select (`xs | sm | md | lg`); reflecting the [[DS-0109-icon-size-scale]] scale once landed.
- `variant` — radio/select (`outline | solid`).
- `spin` — boolean.
- `rotate` — select (`0 | 90 | 180 | 270`).
- `flip` — select (`undefined | horizontal | vertical`).
- `strokeWidth` — number; `absoluteStroke` — boolean.
- `title` — text and `decorative` — boolean, so the a11y wiring (role=img / aria-labelledby vs aria-hidden)
  can be demonstrated.

The gallery/named stories stay as they are; this is about the interactive Default/autodocs controls.

## Acceptance criteria
- [ ] `Icon.stories.svelte` declares `argTypes` for `name`, `px`, `size`, `variant`, `spin`, `rotate`,
      `flip`, `strokeWidth`, `absoluteStroke`, `title`, `decorative` with sensible control kinds
      (select/radio/boolean/number/text) and option lists matching the component's prop unions.
- [ ] The `template` render snippet forwards all of the above to `<Icon ... />`, so each control visibly
      changes the rendered output (size/px resize, variant toggles fill vs stroke, spin animates, rotate &
      flip transform, strokeWidth/absoluteStroke change stroke, title/decorative change the a11y wiring).
- [ ] `size` options reflect the [[DS-0109-icon-size-scale]] scale (`xs | sm | md | lg`) once that lands;
      until then mirror the component's current union — no speculative values.
- [ ] Story stays a11y-clean under `@storybook/addon-a11y` (the default render is decorative/aria-hidden
      unless a `title` is supplied via the control), targeting WCAG 2.2 AA.
- [ ] `pnpm build-storybook` succeeds (CI gate); existing named stories (Default/Activity/Settings/Terminal/
      Large/Small/Nav & social/Gallery) still render.
- [ ] Tests added/updated as applicable; `pnpm test` green.
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed) — the Icon docs page should list the same prop surface the story now drives.

## Notes
- Refinement research (cited):
  - **Storybook Svelte CSF** (`@storybook/addon-svelte-csf`) infers a story's `args` from the `component`
    (or the `render`) passed to `defineMeta`; `argTypes` you declare manually *override* the inferred ones,
    and control types (`select`, `radio`, `boolean`, `number`, `text`) are set per arg. The meta-level
    `render` references a default `{#snippet template(args)}` — props only appear in the rendered component if
    the snippet forwards them, which is exactly today's gap (the snippet forwards only `name`/`px`).
    (storybook.js.org — Svelte CSF addon; storybook.js.org/docs/svelte/api/argtypes.)
  - Practical pattern: keep a single `template(args)` snippet that spreads/forwards each declared arg to
    `<Icon>`, and declare matching `argTypes` so the Controls panel renders the right widget for each. Union
    props (`size`, `variant`, `rotate`, `flip`) map to `select`/`radio` with explicit `options`; booleans
    (`spin`, `absoluteStroke`, `decorative`) to `boolean`; `strokeWidth`/`px` to `number`; `title` to `text`.
- File refs: `src/stories/Icon.stories.svelte` (`defineMeta` `argTypes`/`args`, `template` snippet at the
  `<Icon ... />` call). Stories must stay in `src/stories/` (never `src/lib/`, per CLAUDE.md) so
  `svelte-package` won't publish them.
- Cross-links: no hard dependency, but the `size` control options should reflect
  [[DS-0109-icon-size-scale]] (`xs | sm | md | lg`) once that story lands.
