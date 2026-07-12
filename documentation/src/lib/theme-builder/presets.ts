/**
 * Theme Builder — presets.
 *
 * Two kinds share the button row:
 *   • seed presets — just an accent; the mono derivation turns it into both
 *     full 19-slot themes. Lime is the shipped default seed.
 *   • terminal presets — the library's `PRESET_THEMES` (Dracula, Gruvbox, …):
 *     complete upstream palettes loaded into the builder as slot overrides.
 *
 * The library module is imported by RELATIVE path, not the `dssoca` alias —
 * the docs Vitest suite runs in plain node with no alias (see types.ts).
 */

import { PRESET_THEMES, type PresetTheme } from '../../../../src/lib/presets'

export interface Preset {
  name: string
  accent: string
  /** Full terminal palette — absent on seed presets. */
  theme?: PresetTheme
}

export const PRESETS: Preset[] = [
  { name: 'Lime', accent: '#66ef73' },
  { name: 'Blue', accent: '#66aef7' },
  { name: 'Amber', accent: '#f7c766' },
  { name: 'Coral', accent: '#f76e66' },
  { name: 'Violet', accent: '#b98cff' },
  ...PRESET_THEMES.map((theme) => ({ name: theme.label, accent: theme.accent, theme })),
]
