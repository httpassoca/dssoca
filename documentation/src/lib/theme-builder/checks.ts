/**
 * Theme Builder — the corrector panel's WCAG checks.
 *
 * The factory derivation (`deriveMonoPalette`) satisfies every check below by
 * construction; these exist for MANUAL slot overrides — edit a slot into a
 * failing state and the panel names the failure and offers a one-click fix.
 */

import {
  clampToSrgbGamut,
  contrastHex,
  hexToOklch,
  hueDistDeg,
  oklchToHex,
  RED_GREEN_MIN_DEG,
} from '../../../../scripts/lib/palette.mjs'
import type { Check, Palette, PaletteSlot, ThemePalette } from './types'

const HUE_SLOTS: PaletteSlot[] = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']

/**
 * Fix a contrast failure by walking `fg`'s OKLCH lightness AWAY from `bg`'s
 * lightness in 0.01 steps (hue/chroma untouched; each step gamut-clamped; max
 * 120 iterations) until the WCAG ratio clears `target`. Returns the last hex
 * reached — callers should re-check the ratio before advertising it as a fix.
 */
export function fixContrastL(bg: string, fg: string, target: number): string {
  const bgL = hexToOklch(bg).l
  const start = hexToOklch(fg)
  // Walk away from the bg's lightness; when they coincide, head for the far side.
  const dir =
    Math.abs(start.l - bgL) < 1e-3 ? (bgL >= 0.5 ? -0.01 : +0.01) : start.l > bgL ? +0.01 : -0.01
  let l = start.l
  let hex = oklchToHex(clampToSrgbGamut(start))
  for (let i = 0; i < 120 && contrastHex(hex, bg) < target; i++) {
    l = Math.min(0.995, Math.max(0.005, l + dir))
    hex = oklchToHex(clampToSrgbGamut({ l, c: start.c, h: start.h }))
  }
  return hex
}

/** A contrast check row; `fixedHex` only when the L-walk actually clears the target. */
function contrastCheck(
  theme: 'dark' | 'light',
  id: string,
  title: string,
  detail: string,
  bg: string,
  fg: string,
  target: number,
  fixSlot?: PaletteSlot,
): Check {
  const ratio = contrastHex(fg, bg)
  const ok = ratio >= target
  const check: Check = { id, theme, title, detail, ok, ratio, target }
  if (!ok && fixSlot) {
    const fixed = fixContrastL(bg, fg, target)
    if (contrastHex(fixed, bg) >= target) {
      check.fixSlot = fixSlot
      check.fixedHex = fixed
    }
  }
  return check
}

function checkTheme(theme: 'dark' | 'light', t: ThemePalette): Check[] {
  const checks: Check[] = [
    contrastCheck(
      theme,
      'fg-bg',
      'fg on bg',
      'Body text on the page background.',
      t.bg,
      t.fg,
      7,
      'fg',
    ),
    contrastCheck(
      theme,
      'bright-black-bg',
      'brightBlack on bg',
      'Faint text (comments, muted chrome) on the page background.',
      t.bg,
      t.brightBlack,
      4.5,
      'brightBlack',
    ),
    contrastCheck(
      theme,
      'accent-bg',
      'accent on bg',
      'The accent as UI chrome (borders, icons) on the page background.',
      t.bg,
      t.accent,
      3,
      'accent',
    ),
  ]

  // Label-on-accent: a filled accent surface (primary button) must carry a
  // readable label. Either bg or brightWhite may serve as the label color —
  // the best of the two has to clear 4.5. The fix moves the ACCENT away from
  // the better label's lightness.
  const bestLabel =
    contrastHex(t.bg, t.accent) >= contrastHex(t.brightWhite, t.accent) ? t.bg : t.brightWhite
  const label = contrastCheck(
    theme,
    'label-on-accent',
    'label on accent',
    'Button label (bg or brightWhite, whichever reads better) on an accent fill.',
    t.accent,
    bestLabel,
    4.5,
  )
  // The slot a fix may overwrite here is the ACCENT (the labels are fixed
  // anchors), so walk the accent's lightness away from the better label.
  if (!label.ok) {
    const fixed = fixContrastL(bestLabel, t.accent, 4.5)
    if (contrastHex(fixed, bestLabel) >= 4.5) {
      label.fixSlot = 'accent'
      label.fixedHex = fixed
    }
  }
  checks.push(label)

  for (const slot of HUE_SLOTS) {
    checks.push(
      contrastCheck(
        theme,
        `${slot}-bg`,
        `${slot} on bg`,
        `The ${slot} slot as UI/graphic color on the page background.`,
        t.bg,
        t[slot],
        3,
        slot,
      ),
    )
  }

  // Diff-ability: red and green must stay hue-separated or git diffs die.
  // Not auto-fixable slot-by-slot — lowering the tint re-separates them.
  const dist = hueDistDeg(hexToOklch(t.red).h, hexToOklch(t.green).h)
  checks.push({
    id: 'diff',
    theme,
    title: 'red ↔ green hue distance',
    detail:
      dist >= RED_GREEN_MIN_DEG
        ? `${dist.toFixed(0)}° apart (≥ ${RED_GREEN_MIN_DEG}° required).`
        : `Only ${dist.toFixed(0)}° apart (≥ ${RED_GREEN_MIN_DEG}° required) — lower the tint to re-separate them.`,
    ok: dist >= RED_GREEN_MIN_DEG,
  })

  return checks
}

/** Run every corrector check against both themes (dark first, then light). */
export function runChecks(palette: Palette): Check[] {
  return [...checkTheme('dark', palette.dark), ...checkTheme('light', palette.light)]
}
