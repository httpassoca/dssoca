---
id: DS-0131
type: story
title: "Theme Builder — terminal format exports (Windows Terminal, Alacritty, Kitty, Xresources)"
status: todo
priority: low
tags: [documentation, theming, feature, terminal]
depends_on: [DS-0129]
parent: null
epic: DS-0125
created: 2026-07-09
updated: 2026-07-09
---

## Description

As a terminal user, I want the Theme Builder to export the generated 16-slot palette in real
terminal-emulator formats, so one palette drives both my UI and my shell. The palette IS an ANSI
scheme by construction — the exporters are pure string emitters appended to the existing
`EXPORT_FORMATS` registry (`documentation/src/lib/theme-builder/export.ts`).

## Acceptance criteria

- [ ] Four new registry entries: Windows Terminal (JSON scheme), Alacritty (`alacritty.toml`
      colors blocks), Kitty (`kitty.conf` color0–15 + fg/bg), Xresources (`*.colorN`).
- [ ] Slot mapping documented (magenta ↔ "purple" in Windows Terminal naming; accent noted as a
      non-ANSI extra — exporters emit the 16 + fg/bg only, plus cursor/selection from fg /
      bright-black like the mono-design reference).
- [ ] Export snapshot tests per format; `pnpm docs:test` green.
- [ ] The ExportPanel footnote about "coming later" removed.
