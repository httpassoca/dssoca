/**
 * dssoca palette math — the single source of truth for the monochromatic
 * 16-slot terminal palette (DS color rework, 0.12.0).
 *
 * Pure, dependency-free ESM. Used by:
 *   • scripts/generate-palette.mjs — regenerates the root-slot region of
 *     src/styles/_tokens.scss (committed output; never runs at consumer runtime)
 *   • test/unit/palette-generator.test.ts — pins the derivation invariants
 *   • documentation/ theme builder — the docs app derives custom palettes with
 *     the exact same math (aliased as $palette), so builder output and the
 *     shipped defaults can never drift.
 *
 * Color space: OKLCH (Björn Ottosson's OKLab, LCh form). l is 0..1, c ≥ 0,
 * h in degrees 0..360. Out-of-gamut colors are clamped by reducing chroma.
 */

// ------------------------------------------------------------
//  sRGB <-> OKLCH
// ------------------------------------------------------------

const srgbToLinear = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
const linearToSrgb = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)

/** '#rrggbb' or '#rgb' → [r,g,b] in 0..255, or null when malformed. */
export function parseHex(hex) {
  const m = String(hex).trim().replace(/^#/, '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(m)) return null
  const full = m.length === 3 ? [...m].map((c) => c + c).join('') : m
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

export function rgbToHex([r, g, b]) {
  const to = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return '#' + to(r) + to(g) + to(b)
}

/** [r,g,b] 0..255 → { l, c, h } (OKLCH). */
export function rgbToOklch([r8, g8, b8]) {
  const r = srgbToLinear(r8 / 255)
  const g = srgbToLinear(g8 / 255)
  const b = srgbToLinear(b8 / 255)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const c = Math.sqrt(A * A + B * B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h }
}

export const hexToOklch = (hex) => {
  const rgb = parseHex(hex)
  return rgb ? rgbToOklch(rgb) : null
}

/** { l, c, h } → [r,g,b] in 0..255 float (NOT rounded, may be out of 0..255). */
function oklchToRgbRaw({ l: L, c, h }) {
  const hr = (h * Math.PI) / 180
  const A = c * Math.cos(hr)
  const B = c * Math.sin(hr)
  const l_ = L + 0.3963377774 * A + 0.2158037573 * B
  const m_ = L - 0.1055613458 * A - 0.0638541728 * B
  const s_ = L - 0.0894841775 * A - 1.291485548 * B
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return [r, g, b].map((v) => linearToSrgb(v) * 255)
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.0001 && v <= 255.0001)

/**
 * Clamp into the sRGB gamut by reducing chroma (hue + lightness preserved) —
 * binary search down from the requested c until the color is displayable.
 */
export function clampToSrgbGamut(c) {
  const color = {
    l: Math.max(0, Math.min(1, c.l)),
    c: Math.max(0, c.c),
    h: ((c.h % 360) + 360) % 360,
  }
  if (inGamut(oklchToRgbRaw(color))) return color
  let lo = 0
  let hi = color.c
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToRgbRaw({ ...color, c: mid }))) lo = mid
    else hi = mid
  }
  return { ...color, c: lo }
}

/** { l, c, h } → '#rrggbb' (gamut-clamped first). */
export function oklchToHex(c) {
  return rgbToHex(oklchToRgbRaw(clampToSrgbGamut(c)))
}

// ------------------------------------------------------------
//  WCAG contrast + hue helpers
// ------------------------------------------------------------

function relativeLuminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => srgbToLinear(v / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio between two hex colors (≥ 1, order-independent). */
export function contrastHex(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Circular interpolation from hue a toward hue b along the shortest arc. */
export function mixHueDeg(a, b, t) {
  const d = ((b - a + 540) % 360) - 180
  return (((a + d * t) % 360) + 360) % 360
}

/** Smallest angular distance between two hues (0..180). */
export const hueDistDeg = (a, b) => Math.abs(((a - b + 540) % 360) - 180)

/** OKLab-space mix of two OKLCH colors (u = share of `a`, like color-mix). */
export function mixOklab(a, b, u) {
  const toLab = ({ l, c, h }) => {
    const hr = (h * Math.PI) / 180
    return { L: l, A: c * Math.cos(hr), B: c * Math.sin(hr) }
  }
  const x = toLab(a)
  const y = toLab(b)
  const L = x.L * u + y.L * (1 - u)
  const A = x.A * u + y.A * (1 - u)
  const B = x.B * u + y.B * (1 - u)
  const c = Math.sqrt(A * A + B * B)
  let h = (Math.atan2(B, A) * 180) / Math.PI
  if (h < 0) h += 360
  return { l: L, c, h }
}

// ------------------------------------------------------------
//  Slot vocabulary
// ------------------------------------------------------------

/** Canonical slot order — matches PALETTE_SLOTS in src/lib/dssoca.config.ts. */
export const SLOT_ORDER = [
  'bg',
  'fg',
  'accent',
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
]

/** camelCase slot → its CSS custom property ('brightBlack' → '--ss-bright-black'). */
export const slotToCssVar = (slot) => '--ss-' + slot.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

// ------------------------------------------------------------
//  Derivation — the mono rules
// ------------------------------------------------------------

/**
 * ANSI anchor hues, translated to OKLCH hue space. The 6 accent slots start
 * here and get leaned toward the seed's hue by `tint` (mono rule: the neutrals
 * live fully in the seed hue; the functional hues only *lean*).
 */
export const ANSI_ANCHORS = { red: 25, yellow: 95, green: 142, cyan: 195, blue: 264, magenta: 328 }

/**
 * Per-slot lean damping. Red and yellow are the semantic load-bearers
 * (failures / warnings) and drift into orange / chartreuse fastest under the
 * global tint, so they take only a fraction of it — they must still read as
 * "red" and "yellow" at a glance.
 */
const LEAN_WEIGHT = { red: 0.2, yellow: 0.2 }

/** Hard floor on red↔green hue separation — below this, git diffs die. */
export const RED_GREEN_MIN_DEG = 45
/** Floor on separation between any two adjacent hue slots. */
export const ADJACENT_MIN_DEG = 25

/** The shipped default seed — today's brand green, byte-for-byte. */
export const DEFAULT_SEED = '#66ef73'

/**
 * Brand pins — exact slot values for the SHIPPED default seed (and for anyone
 * deriving from it in the theme builder). The dark page background is the
 * original dssoca near-black #100f10: identity beats the tint rule for this
 * one surface. Pins are applied before contrast solving, so every AA loop
 * runs against the pinned values. Custom accents derive fully by recipe.
 */
export const BRAND_PINS = { dark: { bg: '#100f10' }, light: {} }

const HUE_SLOTS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']
const bright = (k) => 'bright' + k[0].toUpperCase() + k.slice(1)

/**
 * Neutral recipes: OKLCH lightness targets + chroma as a multiplier of the
 * seed's chroma, capped. bg carries the strongest tint; whites the faintest
 * (mono rule 1: never pure black or white — always a trace of the hue).
 */
const NEUTRALS = {
  dark: {
    bg: { l: 0.17, mul: 0.25, cap: 0.02 },
    fg: { l: 0.9, mul: 0.06, cap: 0.01 },
    black: { l: 0.22, mul: 0.2, cap: 0.018 },
    brightBlack: { l: 0.47, mul: 0.12, cap: 0.02 },
    white: { l: 0.93, mul: 0.05, cap: 0.008 },
    brightWhite: { l: 0.99, mul: 0.03, cap: 0.005 },
  },
  light: {
    bg: { l: 0.955, mul: 0.25, cap: 0.012 },
    fg: { l: 0.25, mul: 0.06, cap: 0.01 },
    black: { l: 0.2, mul: 0.15, cap: 0.02 },
    brightBlack: { l: 0.45, mul: 0.12, cap: 0.018 },
    white: { l: 0.88, mul: 0.05, cap: 0.008 },
    brightWhite: { l: 0.99, mul: 0.03, cap: 0.005 },
  },
}

/** Hue-slot chroma: near-neutral/functional — the accent stays the one vivid color. */
const HUE_CHROMA = { normal: { mul: 0.55, cap: 0.11 }, bright: { mul: 0.62, cap: 0.13 } }

/**
 * Hue-slot lightness starts. The AA loop then walks L *away from the bg*
 * until ≥ 4.5:1 on both bg and bg-elev. On light, "bright" means *darker*
 * (more emphatic on a light page), and yellow gets an extra head start down —
 * it has the highest luminance per unit L, every real light theme darkens it.
 */
const HUE_L = {
  dark: { normal: 0.72, bright: 0.8, step: +0.005 },
  light: { normal: 0.55, bright: 0.48, step: -0.005, yellowDrop: 0.05 },
}

const AA = 4.5

/** Walk `color`'s lightness by `step` until it clears `ratio` against every bg. */
function solveContrast(color, bgs, ratio, step) {
  let c = clampToSrgbGamut(color)
  let guard = 0
  while (bgs.some((bg) => contrastHex(oklchToHex(c), bg) < ratio) && guard++ < 200) {
    const l = c.l + step
    if (l <= 0.02 || l >= 0.99) break
    c = clampToSrgbGamut({ ...c, l })
  }
  return c
}

/**
 * Derive the full mono palette (both themes) from a seed accent.
 *
 * @param {object} opts
 * @param {string} opts.accent        seed hex — becomes the dark accent verbatim
 * @param {number} [opts.tint=0.35]   0..1 lean of the 6 ANSI hues toward the seed hue
 * @param {number} [opts.neutralChroma=1] scale on the neutral tint strength (0 = grayscale)
 * @returns {{ dark: Record<string,string>, light: Record<string,string> }} hex per slot
 */
export function derivePalette({ accent, tint = 0.35, neutralChroma = 1 } = {}) {
  const seed = hexToOklch(accent)
  if (!seed) throw new Error(`derivePalette: invalid accent hex "${accent}"`)
  const Ha = seed.h
  const Ca = seed.c

  // --- hue plan (shared by both themes): anchors leaned toward the seed ---
  const leans = {}
  for (const key of HUE_SLOTS) {
    const arc = ((Ha - ANSI_ANCHORS[key] + 540) % 360) - 180
    leans[key] = Math.max(-45, Math.min(45, tint * (LEAN_WEIGHT[key] ?? 1) * arc))
  }
  const hueOf = (key) => (((ANSI_ANCHORS[key] + leans[key]) % 360) + 360) % 360

  // Diff-ability guard: red and green must stay far apart. Green never moves
  // (it lives in the seed's own hue family); back red's lean off instead.
  let guard = 0
  while (hueDistDeg(hueOf('red'), hueOf('green')) < RED_GREEN_MIN_DEG && guard++ < 100) {
    leans.red *= 0.9
    if (Math.abs(leans.red) < 0.5) break
  }
  // Adjacent separation: any two hue slots closer than ADJACENT_MIN_DEG have
  // the offender's lean reduced (never green's).
  guard = 0
  let collided = true
  while (collided && guard++ < 200) {
    collided = false
    for (const a of HUE_SLOTS) {
      for (const b of HUE_SLOTS) {
        if (a >= b) continue
        if (hueDistDeg(hueOf(a), hueOf(b)) < ADJACENT_MIN_DEG) {
          const victim =
            a === 'green' ? b : b === 'green' ? a : Math.abs(leans[a]) > Math.abs(leans[b]) ? a : b
          if (Math.abs(leans[victim]) < 0.5) continue
          leans[victim] *= 0.85
          collided = true
        }
      }
    }
  }

  const themes = {}
  for (const mode of ['dark', 'light']) {
    const out = {}

    // --- neutrals: fully in the seed hue ---
    for (const [slot, r] of Object.entries(NEUTRALS[mode])) {
      const c = Math.min(r.mul * Ca, r.cap) * neutralChroma
      out[slot] = oklchToHex(clampToSrgbGamut({ l: r.l, c, h: Ha }))
    }

    // Brand pins for the shipped seed — applied BEFORE any contrast solving so
    // the AA loops run against the pinned values (see BRAND_PINS).
    if (accent === DEFAULT_SEED) Object.assign(out, BRAND_PINS[mode])

    // bg-elev mirrors the semantic layer: dark mixes bg 88% toward bright-white
    // (color-mix in oklab); light uses bright-white directly. Text slots must
    // hold AA on it too — it is the card/panel surface.
    const bgElev =
      mode === 'dark'
        ? oklchToHex(mixOklab(hexToOklch(out.bg), hexToOklch(out.brightWhite), 0.88))
        : out.brightWhite
    const bgs = [out.bg, bgElev]

    // bright-black is a TEXT tone (code comments, faint chrome) — AA-solve it
    // away from the bg like the hue slots (DS-0013 keeps faint text ≥ 4.5:1).
    out.brightBlack = oklchToHex(
      solveContrast(hexToOklch(out.brightBlack), bgs, AA, mode === 'dark' ? +0.005 : -0.005),
    )

    // --- accent ---
    if (mode === 'dark') {
      out.accent = rgbToHex(parseHex(accent)) // verbatim — zero brand change
    } else {
      // Same hue, deeper: solve L down until it holds AA both as text on the
      // light bg AND under a bright-white label (the #147c3a double constraint).
      let a = clampToSrgbGamut({ l: 0.6, c: Math.min(0.65 * Ca, 0.16), h: Ha })
      let g2 = 0
      while (
        (contrastHex(oklchToHex(a), out.bg) < AA ||
          contrastHex(out.brightWhite, oklchToHex(a)) < AA) &&
        g2++ < 200
      ) {
        a = clampToSrgbGamut({ ...a, l: a.l - 0.005 })
        if (a.l <= 0.05) break
      }
      out.accent = oklchToHex(a)
    }

    // --- hue slots + brights: AA-solved lightness on bg and bg-elev ---
    const { step } = HUE_L[mode]
    for (const key of HUE_SLOTS) {
      const h = hueOf(key)
      const drop = mode === 'light' && key === 'yellow' ? HUE_L.light.yellowDrop : 0
      const normal = {
        l: HUE_L[mode].normal - drop * Math.sign(-step),
        c: Math.min(HUE_CHROMA.normal.mul * Ca, HUE_CHROMA.normal.cap),
        h,
      }
      const brightC = {
        l: HUE_L[mode].bright - drop * Math.sign(-step),
        c: Math.min(HUE_CHROMA.bright.mul * Ca, HUE_CHROMA.bright.cap),
        h,
      }
      out[key] = oklchToHex(solveContrast(normal, bgs, AA, step))
      out[bright(key)] = oklchToHex(solveContrast(brightC, bgs, AA, step))
    }

    themes[mode] = out
  }

  return themes
}

// ------------------------------------------------------------
//  Emit — the generated region of _tokens.scss
// ------------------------------------------------------------

export const GEN_BEGIN = '// >>> generated:palette'
export const GEN_END = '// <<< generated:palette'

// Prettier-stable number formatting (no trailing zeros) so the committed
// region survives `pnpm format` byte-for-byte — the drift-guard test depends
// on emit(recipe) === committed text.
const num = (v, digits) => String(parseFloat(v.toFixed(digits)))

const fmtOklch = (hex) => {
  const { l, c, h } = hexToOklch(hex)
  return `oklch(${num(l * 100, 2)}% ${num(c, 4)} ${num(h, 2)})`
}

/**
 * Emit the Layer A (root slots) region for _tokens.scss: both theme blocks,
 * each slot as a literal oklch() with its hex equivalent in a trailing comment.
 */
export function emitTokensRegion(palette, { seed } = {}) {
  const block = (selector, mode) => {
    const decls = SLOT_ORDER.map(
      (slot) =>
        `  ${slotToCssVar(slot)}: ${fmtOklch(palette[mode][slot])}; /* ${palette[mode][slot]} */`,
    ).join('\n')
    return `${selector} {\n  /* Native form controls + scrollbars follow the theme (DS-0069). */\n  color-scheme: ${mode};\n\n${decls}\n}`
  }
  return [
    `${GEN_BEGIN} — seed ${seed ?? palette.dark.accent}. Regenerate with \`pnpm gen:palette\`; do not edit by hand.`,
    block(`:root,\n[data-theme='dark']`, 'dark'),
    '',
    block(`[data-theme='light']`, 'light'),
    GEN_END,
  ].join('\n')
}
