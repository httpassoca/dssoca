import { describe, it, expect } from 'vitest'
import { dssocaConfig, SPINNER_VARIANT_NAMES, PALETTE_SLOTS } from '$lib/dssoca.config'
import { defaultDesignConfig } from '$lib/config'
import { SPINNER_VARIANTS } from '$lib/components/Spinner.svelte'

describe('dssocaConfig manifest', () => {
  it('declares the theme and size axes with values + defaults', () => {
    expect(dssocaConfig.theme.values).toEqual(['dark', 'light'])
    expect(dssocaConfig.theme.default).toBe('dark')
    expect(dssocaConfig.size.values).toEqual(['sm', 'md', 'lg'])
    expect(dssocaConfig.size.default).toBe('md')
  })

  it('declares the spinner axis (DS-0108) with boxBounce2 default', () => {
    expect(dssocaConfig.spinner.values).toEqual(SPINNER_VARIANT_NAMES)
    expect(dssocaConfig.spinner.default).toBe('boxBounce2')
  })

  it('spinner axis names are the single source of truth for SPINNER_VARIANTS keys', () => {
    // The frame-data object in Spinner.svelte must be keyed exactly by the
    // manifest's variant names — no drift in either direction.
    expect(Object.keys(SPINNER_VARIANTS).sort()).toEqual([...SPINNER_VARIANT_NAMES].sort())
  })

  it("every axis's default is one of its allowed values", () => {
    for (const [name, axis] of Object.entries(dssocaConfig)) {
      expect(axis.values, `${name}.default ∈ ${name}.values`).toContain(axis.default)
    }
  })

  it('is the single source of truth: defaultDesignConfig derives from the manifest', () => {
    expect(defaultDesignConfig).toEqual({
      theme: dssocaConfig.theme.default,
      sizeVariant: dssocaConfig.size.default,
      componentsSize: {},
      spinnerVariant: dssocaConfig.spinner.default,
      palette: null,
    })
  })
})

describe('PALETTE_SLOTS (color rework)', () => {
  it('pins the 19 slots — bg/fg/accent + the 16 ANSI colors, in canonical order', () => {
    expect(PALETTE_SLOTS).toEqual([
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
    ])
  })
})
