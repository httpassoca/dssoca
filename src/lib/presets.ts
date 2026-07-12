/**
 * Preset terminal palettes (DS-0142).
 *
 * Ready-made 19-slot palettes ported from well-known terminal themes — the
 * palette architecture (DS-0125) means any terminal theme can be a website
 * theme. Apply one at runtime or emit it as CSS:
 *
 *   applyDesignConfig({ palette: presetPalette('dracula') })
 *   paletteToCss(presetPalette('gruvbox'))
 *
 * Fidelity policy: hue slots are upstream-verbatim; the neutral slots
 * (black / white / brightBlack / brightWhite) are role-mapped onto dssoca's
 * conventions (black = darkest ink, brightWhite = lightest surface/shine,
 * brightBlack = muted text) using the theme's own official colors. Slots that
 * failed the theme-builder's WCAG 2.2 AA checks were nudged along OKLCH
 * lightness only (hue/chroma untouched) and carry an `AA-fixed` comment with
 * the upstream value. See docs/themes.md → "Preset palettes".
 *
 * A preset only carries the modes its upstream actually defines (Nord has no
 * official light variant; Coffee is a light-only theme) — `presetPalette`
 * mirrors a single mode into both, so the theme toggle keeps the same colors.
 */

import type { Palette, ThemePalette } from './dssoca.config.js'

export type PresetName = 'dracula' | 'tokyo-night' | 'gruvbox' | 'nord' | 'solarized' | 'coffee'

export interface PresetTheme {
  /** Slug, e.g. `'tokyo-night'`. */
  name: PresetName
  /** Display name, e.g. `'Tokyo Night'`. */
  label: string
  /** Signature color — swatch/seed for pickers (mirrors the palette's accent slot). */
  accent: string
  /** Dark-mode slots — absent when the upstream theme has no dark variant. */
  dark?: ThemePalette
  /** Light-mode slots — absent when the upstream theme has no light variant. */
  light?: ThemePalette
}

export const PRESET_THEMES: readonly PresetTheme[] = [
  {
    // Dracula — https://spec.draculatheme.com (ANSI mapping); light mode is
    // the official Alucard Classic variant.
    name: 'dracula',
    label: 'Dracula',
    accent: '#bd93f9',
    dark: {
      bg: '#282a36',
      fg: '#f8f8f2',
      accent: '#bd93f9',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#7f90c4', // AA-fixed from #6272a4
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff',
    },
    light: {
      bg: '#fffbeb',
      fg: '#1f1f1f',
      accent: '#644ac9',
      black: '#1f1f1f',
      red: '#cb3a2a',
      green: '#14710a',
      yellow: '#846e15',
      blue: '#644ac9',
      magenta: '#a3144d',
      cyan: '#036a96',
      white: '#cfcfde', // Alucard selection — soft light neutral
      brightBlack: '#6c664b', // Alucard comment
      brightRed: '#d74c3d',
      brightGreen: '#198d0c',
      brightYellow: '#9e841a',
      brightBlue: '#7862d0',
      brightMagenta: '#bf185a',
      brightCyan: '#047fb4',
      brightWhite: '#ffffff', // no Alucard neutral is lighter than bg
    },
  },
  {
    // Tokyo Night — folke/tokyonight.nvim terminal extras, Night + Day.
    name: 'tokyo-night',
    label: 'Tokyo Night',
    accent: '#7aa2f7',
    dark: {
      bg: '#1a1b26',
      fg: '#c0caf5',
      accent: '#7aa2f7',
      black: '#15161e',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#bb9af7',
      cyan: '#7dcfff',
      white: '#a9b1d6',
      brightBlack: '#7c84a7', // AA-fixed from #414868
      brightRed: '#ff899d',
      brightGreen: '#9fe044',
      brightYellow: '#faba4a',
      brightBlue: '#8db0ff',
      brightMagenta: '#c7a9ff',
      brightCyan: '#a4daff',
      brightWhite: '#c0caf5',
    },
    light: {
      bg: '#e1e2e7',
      fg: '#1a3f9b', // AA-fixed from #3760bf (Day keeps its blue-ink identity)
      accent: '#0e64ce', // AA-fixed from #2e7de9
      black: '#1a3f9b', // AA-fixed from #3760bf — Day has no near-black neutral
      red: '#f52a65',
      green: '#587539',
      yellow: '#8c6c3e',
      blue: '#2e7de9',
      magenta: '#9854f1',
      cyan: '#007197',
      white: '#b4b5b9',
      brightBlack: '#50609d', // AA-fixed from #6172b0
      brightRed: '#ff4774',
      brightGreen: '#5c8524',
      brightYellow: '#a27629',
      brightBlue: '#358aff',
      brightMagenta: '#a463ff',
      brightCyan: '#007ea8',
      brightWhite: '#e9e9ec',
    },
  },
  {
    // Gruvbox — morhetz/gruvbox. black uses the official dark0_hard so code
    // blocks stay distinct from bg; light neutrals come from the light scale
    // (dark0 ink, light2, light0_hard).
    name: 'gruvbox',
    label: 'Gruvbox',
    accent: '#fe8019',
    dark: {
      bg: '#282828',
      fg: '#ebdbb2',
      accent: '#fe8019',
      black: '#1d2021',
      red: '#d73128', // AA-fixed from #cc241d
      green: '#98971a',
      yellow: '#d79921',
      blue: '#458588',
      magenta: '#b16286',
      cyan: '#689d6a',
      white: '#a89984',
      brightBlack: '#9b8c7d', // AA-fixed from #928374
      brightRed: '#fb4934',
      brightGreen: '#b8bb26',
      brightYellow: '#fabd2f',
      brightBlue: '#83a598',
      brightMagenta: '#d3869b',
      brightCyan: '#8ec07c',
      brightWhite: '#ebdbb2',
    },
    light: {
      bg: '#fbf1c7',
      fg: '#3c3836',
      accent: '#af3a03', // official light-mode (faded) orange
      black: '#282828',
      red: '#cc241d',
      green: '#8f8e03', // AA-fixed from #98971a
      yellow: '#b67f00', // AA-fixed from #d79921
      blue: '#458588',
      magenta: '#b16286',
      cyan: '#629764', // AA-fixed from #689d6a
      white: '#d5c4a1',
      brightBlack: '#77695a', // AA-fixed from #928374
      brightRed: '#9d0006',
      brightGreen: '#79740e',
      brightYellow: '#b57614',
      brightBlue: '#076678',
      brightMagenta: '#8f3f71',
      brightCyan: '#427b58',
      brightWhite: '#f9f5d7',
    },
  },
  {
    // Nord — nordtheme.com terminal spec. Dark only: Nord has no official
    // light variant. Accent = nord8, the docs' "primary UI" color.
    name: 'nord',
    label: 'Nord',
    accent: '#88c0d0',
    dark: {
      bg: '#2e3440',
      fg: '#d8dee9',
      accent: '#88c0d0',
      black: '#3b4252',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      magenta: '#b48ead',
      cyan: '#88c0d0',
      white: '#e5e9f0',
      brightBlack: '#919cb3', // AA-fixed from #4c566a
      brightRed: '#bf616a',
      brightGreen: '#a3be8c',
      brightYellow: '#ebcb8b',
      brightBlue: '#81a1c1',
      brightMagenta: '#b48ead',
      brightCyan: '#8fbcbb',
      brightWhite: '#eceff4',
    },
  },
  {
    // Solarized — Ethan Schoonover's official ANSI mapping. brightBlack is
    // role-mapped to base01/base1 (the designated secondary-content tones; the
    // ANSI mapping's own brightBlack equals the bg). The base-tone bright hues
    // stay upstream-verbatim — dssoca's semantic layer never reads them.
    name: 'solarized',
    label: 'Solarized',
    accent: '#3294dc', // AA-fixed from #268bd2 (mirrors the dark accent slot)
    dark: {
      bg: '#002b36',
      fg: '#a5b6b8', // AA-fixed from #839496
      accent: '#3294dc', // AA-fixed from #268bd2
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5',
      brightBlack: '#7b9299', // AA-fixed from #586e75 (base01)
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#fdf6e3',
    },
    light: {
      bg: '#fdf6e3',
      fg: '#42575e', // AA-fixed from #586e75
      accent: '#097cc1', // AA-fixed from #268bd2
      black: '#073642',
      red: '#dc322f',
      green: '#829600', // AA-fixed from #859900
      yellow: '#b18600', // AA-fixed from #b58900
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#259e95', // AA-fixed from #2aa198
      white: '#eee8d5',
      brightBlack: '#647171', // AA-fixed from #93a1a1 (base1)
      brightRed: '#cb4b16',
      brightGreen: '#586e75',
      brightYellow: '#657b83',
      brightBlue: '#839496',
      brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1',
      brightWhite: '#ffffff', // no Solarized neutral is lighter than base3
    },
  },
  {
    // Coffee — the author's site theme (custom; no upstream). Light only:
    // warm ANSI hues derived from the site's brown accent with the mono
    // palette math, anchored to the site's cream bg / black text.
    name: 'coffee',
    label: 'Coffee',
    accent: '#6a461e',
    light: {
      bg: '#f9dec9',
      fg: '#000000',
      accent: '#6a461e',
      black: '#1a1511',
      red: '#856662',
      green: '#6c7055',
      yellow: '#6b6349',
      blue: '#746780',
      magenta: '#84656d',
      cyan: '#5b735f',
      white: '#d9d7d5',
      brightBlack: '#595450',
      brightRed: '#75544f',
      brightGreen: '#5c6143',
      brightYellow: '#585032',
      brightBlue: '#655772',
      brightMagenta: '#74535b',
      brightCyan: '#4b6550',
      brightWhite: '#fdfbfa',
    },
  },
]

/**
 * Resolve a preset (by object or slug) to a full `Palette` for
 * `applyDesignConfig({ palette })` / `paletteToCss()`. Single-mode presets
 * mirror their one theme into both, so flipping `data-theme` keeps the same
 * colors. Throws on an unknown slug.
 */
export function presetPalette(preset: PresetTheme | PresetName): Palette {
  const resolved =
    typeof preset === 'string' ? PRESET_THEMES.find((p) => p.name === preset) : preset
  if (!resolved) throw new Error(`dssoca: unknown preset theme '${String(preset)}'`)
  const dark = resolved.dark ?? resolved.light
  const light = resolved.light ?? resolved.dark
  if (!dark || !light) throw new Error(`dssoca: preset '${resolved.name}' has no palette`)
  return { dark: { ...dark }, light: { ...light } }
}
