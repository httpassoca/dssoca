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
- **Missing system libs** (nss/nspr, at-spi2, X11 libs, libgbm, libxkbcommon, alsa, libXi) — this
  is Arch but `pacman -Sw` needs root, so fetch by hand into the scratchpad (`$S`):
  1. `curl -sL https://geo.mirror.pkgbuild.com/{core,extra}/os/x86_64/{core,extra}.db`, `bsdtar -x`
     each into `$S/db/<repo>/`, read `%FILENAME%` from `db/*/<pkg>-[0-9]*/desc`.
  2. Packages: `nspr nss at-spi2-core libx11 libxi libxcomposite libxdamage libxext libxfixes
libxrandr libxrender libxcb libxkbcommon alsa-lib mesa libdrm fontconfig freetype2 ttf-dejavu
libxau libxdmcp wayland libglvnd libxshmfence libxxf86vm libelf llvm-libs lm_sensors libunwind
zstd libpciaccess` — curl each `.pkg.tar.zst`, `bsdtar -xf … -C $S/root --exclude .BUILDINFO
--exclude .MTREE --exclude .PKGINFO` (use `bash -c`, zsh won't word-split the list).
  3. `LD_LIBRARY_PATH=$S/root/usr/lib ldd <shell> | grep "not found"` must be empty.
- **Fontconfig is mandatory**: without it the renderer hard-crashes
  (`NOTREACHED remote_font_face_source.cc`) as soon as a page loads webfonts. Write
  `$S/fonts/fonts.conf` = `<fontconfig><dir>$S/root/usr/share/fonts</dir><cachedir>$S/fonts/cache</cachedir></fontconfig>`
  and set `FONTCONFIG_FILE` to it.
- Package-name gotchas: `atk` ships inside `at-spi2-core`, `graphite2` is `graphite`, brotli libs
  come from `brotli` — asking the db for those names prints MISSING and is harmless. Also add
  `glib2 dbus libffi pcre2 expat libpng harfbuzz` (nss/atk pull them in).
- Verified 2026-09-18: `chromium_headless_shell-1243` + `playwright-core@1.63.0` works with the
  recipe above (the `-1228` folder may no longer exist — `ls ~/.cache/ms-playwright/`).
- Stop a background `vite preview`/storybook by port, never by pattern:
  `kill $(ss -ltnp | grep ':<port>' | grep -o 'pid=[0-9]*' | cut -d= -f2)` — `pkill -f`/`pgrep -f`
  match the calling shell and kill the session (exit 144).
- Launch: `chromium.launch({ executablePath: '~/.cache/ms-playwright/chromium_headless_shell-<rev>/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--no-sandbox'] })`
  with `playwright-core@latest` in a scratch dir. Storybook: `pnpm storybook --ci --port 6006 &`,
  then `iframe.html?id=<story-id>&viewMode=story&args=prop:value`. Stop it with `kill <pid>`,
  not `pkill -f storybook` (that matches the calling shell too).
- `page.setViewportSize` fires a synthetic mouse-leave that closes hover tooltips — use `focus()`
  to keep a tooltip open across a resize.

## Gotchas

- **jsdom cannot catch these — always run the browser pass for interactive components** (found
  on TierList, DS-0159): pointer capture dies when the captured node is re-created or
  re-inserted (a keyed `{#each}` across blocks, or `insertBefore` on the same node) — listen on
  `window`/`document` for the rest of a drag; Chrome blurs a focused node that leaves the
  document even briefly, so "cancel on blur" must be decided a macrotask later and the node
  re-focused after Svelte's flush. Drive real gestures with `page.mouse` (down → small move →
  move → up) and `page.keyboard.press`; scroll the target into view / use a tall viewport, or the
  pointer lands on `<html>`.

- pnpm only — `npm` is not on PATH (exit 127).
- dssoca `SegmentedControl` renders **radios**, not buttons — locate with
  `getByRole('radio', { name: ... })`.
- Theme-builder anchors: preset row = `getByRole('group', { name: 'Theme presets' })`;
  slot grid = `getByRole('group', { name: 'Palette slots' })`, cells expose the hex in a
  `<code>` and overridden cells show an `edited` badge.
- "Try it on this page" writes the 19 `--ss-*` slot vars inline on `<html>` — assert with
  `getComputedStyle(document.documentElement).getPropertyValue('--ss-bg')`.
