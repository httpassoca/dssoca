/**
 * Regenerates the root-slot palette region of src/styles/_tokens.scss from the
 * recipe in scripts/lib/palette.mjs (DS color rework). The output is committed —
 * hand-audit happens by tuning the recipe constants and re-running, never by
 * editing the generated values.
 *
 *   pnpm gen:palette            rewrite the marked region in place
 *   pnpm gen:palette --print    print the region + a contrast report, touch nothing
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  derivePalette,
  emitTokensRegion,
  contrastHex,
  hexToOklch,
  hueDistDeg,
  SLOT_ORDER,
  GEN_BEGIN,
  GEN_END,
  DEFAULT_SEED,
} from './lib/palette.mjs'

const SEED = DEFAULT_SEED

const palette = derivePalette({ accent: SEED })
const region = emitTokensRegion(palette, { seed: SEED })

if (process.argv.includes('--print')) {
  console.log(region)
  console.log('\n--- contrast report (vs bg) ---')
  for (const mode of ['dark', 'light']) {
    console.log(`\n[${mode}] bg=${palette[mode].bg}`)
    for (const slot of SLOT_ORDER) {
      if (slot === 'bg') continue
      const hex = palette[mode][slot]
      const { l, c, h } = hexToOklch(hex)
      console.log(
        `  ${slot.padEnd(14)} ${hex}  L=${(l * 100).toFixed(0).padStart(3)} C=${c.toFixed(3)} H=${h.toFixed(0).padStart(3)}  ${contrastHex(hex, palette[mode].bg).toFixed(2)}:1`,
      )
    }
    console.log(
      `  red↔green hue distance: ${hueDistDeg(hexToOklch(palette[mode].red).h, hexToOklch(palette[mode].green).h).toFixed(0)}°`,
    )
  }
  process.exit(0)
}

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles', '_tokens.scss')
const src = readFileSync(file, 'utf8')
const begin = src.indexOf(GEN_BEGIN)
const end = src.indexOf(GEN_END)
if (begin === -1 || end === -1) {
  console.error(
    `generate-palette: markers not found in ${file} — expected "${GEN_BEGIN}" … "${GEN_END}"`,
  )
  process.exit(1)
}
const next = src.slice(0, begin) + region + src.slice(end + GEN_END.length)
if (next === src) {
  console.log('gen:palette — already up to date')
} else {
  writeFileSync(file, next)
  console.log('gen:palette — regenerated palette region in src/styles/_tokens.scss')
}
