/**
 * Spinner frame data (DS-0148).
 *
 * Lives outside `Spinner.svelte` so the vanilla CSS generator can emit `steps()` keyframes
 * from the exact same frames the Svelte component ticks through. `Spinner.svelte` re-exports
 * it, so existing imports from the component path keep working.
 */
import type { SpinnerVariant } from './dssoca.config.js'

/**
 * Text-frame spinner variants. Frames + intervals are embedded verbatim from
 * sindresorhus/cli-spinners (MIT — https://github.com/sindresorhus/cli-spinners),
 * curated for the squared/blocky glyphs that fit the DS's zero-radius look.
 * No runtime fetch, no dependency — just data.
 *
 * The *variant names* are owned by `dssoca.config.ts` (`SpinnerVariant`,
 * derived from the `spinner` manifest axis — DS-0108); this object holds the
 * frame data and is pinned to that union via `satisfies Record<SpinnerVariant,
 * …>`, so the two cannot drift.
 */
export interface SpinnerFrames {
  /** Milliseconds between frames (cli-spinners' recommended cadence). */
  interval: number
  /** The glyph sequence, cycled in order. */
  frames: readonly string[]
}

export const SPINNER_VARIANTS = {
  boxBounce2: { interval: 100, frames: ['▌', '▀', '▐', '▄'] },
  boxBounce: { interval: 120, frames: ['▖', '▘', '▝', '▗'] },
  squareCorners: { interval: 180, frames: ['◰', '◳', '◲', '◱'] },
  toggle2: { interval: 80, frames: ['▫', '▪'] },
  toggle3: { interval: 120, frames: ['□', '■'] },
  toggle4: { interval: 100, frames: ['■', '□', '▪', '▫'] },
  pipe: { interval: 100, frames: ['┤', '┘', '┴', '└', '├', '┌', '┬', '┐'] },
  line: { interval: 130, frames: ['-', '\\', '|', '/'] },
  growVertical: { interval: 120, frames: ['▁', '▃', '▄', '▅', '▆', '▇', '▆', '▅', '▄', '▃'] },
  growHorizontal: {
    interval: 120,
    frames: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '▊', '▋', '▌', '▍', '▎'],
  },
} as const satisfies Record<SpinnerVariant, SpinnerFrames>
