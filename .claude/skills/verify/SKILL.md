---
name: verify
description: Build/launch/drive recipe for verifying dssoca changes end-to-end in the docs app (headless chromium on this WSL2 host).
---

# Verifying dssoca changes at runtime

## Surfaces

- **Library + docs site**: the docs app dogfoods `src/lib` source directly (no build step) —
  driving the docs app exercises library changes.
- Static build: `pnpm docs:build` then `pnpm docs:preview --port <port>` (serves
  `documentation/build/`; prerendered, deterministic). Dev server: `pnpm docs:dev`.
- Showcase app: `pnpm dev` (library-only changes).
- Storybook: `pnpm storybook` (port 6006).

## Headless browser on this host (WSL2, no system chrome)

No playwright install in the repo, but working pieces exist on the machine:

- Browsers: `~/.cache/ms-playwright/chromium_headless_shell-1223/` (pairs with
  playwright-core 1.55.0) and `-1228`.
- Driver: `pnpm add playwright-core@1.55.0` in a scratch dir, then
  `chromium.launch({ executablePath: <shell path> })`.
- **Missing system libs** (libnspr4, libnss3, X libs…) — reuse the extracted sets via
  `LD_LIBRARY_PATH=/tmp/claude-1001/-home-passoca-dev-passoca/5a1792f7-182c-475d-aa26-16895d465fad/scratchpad/libs/root/usr/lib:/tmp/claude-1001/-home-passoca-dev-passoca/7f545753-f2af-444b-bc44-386ae942c7eb/scratchpad/gifcap/libs/usr/lib`
  (if those tmp dirs are gone, re-extract the .debs/pkgs — dejavu + nss + X11 set).
- **Fontconfig is mandatory**: without it the renderer hard-crashes
  (`NOTREACHED remote_font_face_source.cc`) as soon as a page loads webfonts. Set
  `FONTCONFIG_FILE=/tmp/claude-1001/-home-passoca-dev-passoca/5a1792f7-182c-475d-aa26-16895d465fad/scratchpad/fonts/fonts.conf`
  (a two-line fontconfig pointing at a dir with DejaVu fonts + a cachedir works).

## Gotchas

- pnpm only — `npm` is not on PATH (exit 127).
- dssoca `SegmentedControl` renders **radios**, not buttons — locate with
  `getByRole('radio', { name: ... })`.
- Theme-builder anchors: preset row = `getByRole('group', { name: 'Theme presets' })`;
  slot grid = `getByRole('group', { name: 'Palette slots' })`, cells expose the hex in a
  `<code>` and overridden cells show an `edited` badge.
- "Try it on this page" writes the 19 `--ss-*` slot vars inline on `<html>` — assert with
  `getComputedStyle(document.documentElement).getPropertyValue('--ss-bg')`.
