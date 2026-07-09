/**
 * Theme Builder — accent presets. Each one is just a seed; the mono derivation
 * turns it into both full 19-slot themes. Lime is the shipped default seed.
 */

export interface Preset {
  name: string
  accent: string
}

export const PRESETS: Preset[] = [
  { name: 'Lime', accent: '#66ef73' },
  { name: 'Blue', accent: '#66aef7' },
  { name: 'Amber', accent: '#f7c766' },
  { name: 'Coral', accent: '#f76e66' },
  { name: 'Violet', accent: '#b98cff' },
]
