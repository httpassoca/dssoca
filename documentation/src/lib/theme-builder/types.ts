/**
 * Theme Builder — local structural types.
 *
 * These mirror the dssoca palette types (`PaletteSlot` / `ThemePalette` /
 * `Palette` from `dssoca`) **structurally** so the pure theme-builder modules
 * (derive / checks / export / presets) never import `'dssoca'` — the docs
 * Vitest suite runs in a plain node environment with no `dssoca` alias. The
 * UI components (which run under Vite/SvelteKit) are free to import the real
 * thing; both sides agree because the shapes are identical.
 */

import { SLOT_ORDER, slotToCssVar } from '../../../../scripts/lib/palette.mjs'

/** The 19 root palette slots — camelCase, canonical order (mirrors PALETTE_SLOTS). */
export type PaletteSlot =
  | 'bg'
  | 'fg'
  | 'accent'
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite'

/** Canonical slot list, reusing the palette-math source of truth. */
export const SLOTS = SLOT_ORDER as readonly PaletteSlot[]

/** camelCase slot → its CSS custom property ('brightBlack' → '--ss-bright-black'). */
export const SLOT_TO_CSS_VAR = Object.fromEntries(
  SLOTS.map((slot) => [slot, slotToCssVar(slot)]),
) as Record<PaletteSlot, string>

/** Hex value per slot, for one theme. */
export type ThemePalette = Record<PaletteSlot, string>

/** Both themes' slot values — same shape as dssoca's `Palette`. */
export interface Palette {
  dark: ThemePalette
  light: ThemePalette
}

/** The builder's derivation inputs. `tint` / `neutralChroma` are 0..1 fractions. */
export interface BuilderOptions {
  /** Seed hex — becomes the dark accent verbatim. */
  accent: string
  /** 0..1 lean of the 6 ANSI hues toward the seed hue. */
  tint: number
  /** 0..1 scale on the neutral tint strength (0 = grayscale neutrals). */
  neutralChroma: number
}

/** Per-theme manual slot overrides, applied on top of the derived palette. */
export interface SlotOverrides {
  dark?: Partial<Record<PaletteSlot, string>>
  light?: Partial<Record<PaletteSlot, string>>
}

/** One corrector-panel row — a WCAG (or hue-separation) check result. */
export interface Check {
  id: string
  theme: 'dark' | 'light'
  title: string
  detail: string
  ok: boolean
  /** Measured WCAG contrast ratio, when the check is contrast-based. */
  ratio?: number
  /** Required ratio for a pass, when the check is contrast-based. */
  target?: number
  /** Slot a one-click fix would overwrite. */
  fixSlot?: PaletteSlot
  /** Corrected hex for `fixSlot` — present only when a fix exists and clears the target. */
  fixedHex?: string
}
