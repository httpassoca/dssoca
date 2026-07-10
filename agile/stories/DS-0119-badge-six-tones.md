---
id: DS-0119
type: story
title: "Redefine Badge to six semantic tones"
status: done
priority: high
tags: [badge, api, breaking, theming]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a `dssoca` consumer, I want `Badge` to expose a small, conventional set of semantic tones — instead of the current homelab-flavoured status names (`up` / `deg` / `down` / `maint` / `info` / `neutral`) — so the component speaks the same tone language as mature design systems and reads outside a service-status context.

Redefine the `tone` prop to exactly **six** values:

| New tone   | Meaning                                  | Replaces / maps from                |
| ---------- | ---------------------------------------- | ----------------------------------- |
| `brand`    | primary-accent emphasis (new/featured)   | **new** tone, taking the `maint` slot |
| `neutral`  | non-status category label (baseline)     | `neutral`                           |
| `positive` | success / healthy state                  | `up`                                |
| `caution`  | warning / degraded / needs attention     | `deg`                               |
| `critical` | error / danger / failed                  | `down`                              |
| `info`     | informational / neutral notice           | `info`                              |

This is a **BREAKING** change: both the public `tone` value union and the per-tone token names change (`--ss-badge-up-*` → `--ss-badge-positive-*`, `--ss-badge-deg-*` → `--ss-badge-caution-*`, `--ss-badge-down-*` → `--ss-badge-critical-*`, `--ss-badge-maint-*` → `--ss-badge-brand-*`, `--ss-badge-info-*` and `--ss-badge-neutral-*` retained). The current `maint` tone has no semantic successor and is dropped in favour of `brand`.

Recommend changing the default `tone` from `info` to **`neutral`**: a tone-less badge is most often a plain category label, and `neutral` is the safest non-status baseline (it asserts no status meaning by colour alone).

## Acceptance criteria
- [x] `Badge` `tone` prop accepts exactly: `brand` | `neutral` | `positive` | `caution` | `critical` | `info` (TypeScript union updated; default is `neutral`).
- [x] Each tone renders theme-aware background, border, and foreground via `--ss-badge-<tone>-bg` / `--ss-badge-<tone>-border` and an explicit foreground colour, in both `data-theme="dark"` and `data-theme="light"`.
- [x] Old token names (`--ss-badge-up-*`, `--ss-badge-deg-*`, `--ss-badge-down-*`, `--ss-badge-maint-*`) are renamed to the new tones; no orphaned old tokens remain in `src/styles/_tokens.scss` (both theme blocks).
- [x] Foreground-on-fill colour contrast meets WCAG 2.2 AA (>= 4.5:1 for the badge text against its tone background) for all six tones in both themes; verify and record the measured ratios.
- [x] Scoped SCSS in `Badge.svelte` keys off the new tone class names (`.brand`, `.neutral`, `.positive`, `.caution`, `.critical`, `.info`); zero border-radius preserved.
- [x] CHANGELOG note describing the breaking tone rename + migration map (old → new value names and old → new token names) is drafted under `## [Unreleased]`.
- [x] `pnpm test` green; Badge unit test updated to assert the six new tone class names + default, with `vitest-axe` covering each tone for a clean a11y tree.
- [x] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Part of epic [[DS-0107]] (Badge refinement).
- Source: `src/lib/components/Badge.svelte` (tone union at line 5, default at line 40, `.up`/`.deg`/`.down`/`.maint`/`.info`/`.neutral` rules from line 98); tokens in `src/styles/_tokens.scss` (`--ss-badge-up-bg` etc. at lines ~89-100 dark, ~182-193 light).
- **Tone-taxonomy research** — the six-tone set is deliberately aligned to mature systems:
  - **Shopify Polaris Badge** uses `info`, `success`, `warning`, `critical`, `attention`, `new`, `magic` (plus `*-strong` variants). Our `positive`/`caution`/`critical`/`info` map directly onto Polaris `success`/`warning`/`critical`/`info`; Polaris `new` is the precedent for a dedicated promotional tone, which we express as `brand`. (https://polaris-react.shopify.com/components/feedback-indicators/badge)
  - **Atlassian Lozenge** appearances are `default`, `success`, `removed`, `inprogress`, `new`, `moved`. `default`→`neutral`, `success`→`positive`, `removed` (error/declined/failed)→`critical`, and `new` again backs a `brand`-style emphasis tone. (https://atlassian.design/components/lozenge)
  - **IBM Carbon Tag** is colour-named (`red`/`green`/`blue`/`gray`/`high-contrast`…) rather than semantic; we intentionally prefer semantic names over Carbon's palette names so tone meaning survives a theme reskin, but Carbon confirms the small fixed set + theme-tracked light/dark fills approach. (https://carbondesignsystem.com/components/tag/style/)
  - **GitHub Primer Label** is a purely visual, non-interactive wrapper — reinforces keeping Badge tones semantic and presentation-only. (https://primer.style/components/label/)
  - Naming choice: `caution`/`critical` (over `warning`/`danger`) follow the calmer, less alarmist register Polaris/Atlassian use, while `positive`/`neutral`/`info` are the broadly-shared common denominators; `brand` is the dssoca name for the accent/promotional tone that Polaris (`new`) and Atlassian (`new`) both carry.
- Coordinate with [[DS-0120]] (dismiss removal) and [[DS-0121]] (vertical padding) if those land in the same release so the breaking surface is documented once.
