/**
 * Builds dist/vanilla.css (DS-0148) from the components svelte-package just emitted.
 *
 * Runs in `prepack` AFTER `svelte-package` (which compiles each component's SCSS into a plain
 * CSS `<style>` block under dist/components/) and reads those blocks — so the vanilla sheet is
 * derived from the exact same source as the Svelte components and can never drift.
 *
 *   pnpm build:vanilla
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildVanillaCss, extractStyleBlock, ROOT_CLASSES } from './lib/vanilla-css.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const componentsDir = join(dist, 'components')

const { SPINNER_VARIANTS } = await import(join(dist, 'spinner-frames.js'))
const { dssocaConfig } = await import(join(dist, 'dssoca.config.js'))

const components = {}
for (const file of readdirSync(componentsDir)) {
  if (!file.endsWith('.svelte')) continue
  const name = file.slice(0, -'.svelte'.length)
  const source = readFileSync(join(componentsDir, file), 'utf8')
  if (/<style\s[^>]*lang=/.test(source)) throw new Error(`build-vanilla: ${file} is not compiled`)
  const css = extractStyleBlock(source)
  if (css === null) {
    if (name in ROOT_CLASSES) throw new Error(`build-vanilla: ${file} has no <style> block`)
    continue
  }
  components[name] = css
}

const css = buildVanillaCss(components, {
  spinnerVariants: SPINNER_VARIANTS,
  defaultSpinnerVariant: dssocaConfig.spinner.default,
})

const out = join(dist, 'vanilla.css')
writeFileSync(out, css)
console.log(
  `build-vanilla: wrote ${out} (${Object.keys(components).length} components, ${css.length} bytes)`,
)
