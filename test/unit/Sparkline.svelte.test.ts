import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Sparkline from '$lib/components/Sparkline.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('Sparkline — bars (default variant)', () => {
  it('renders one bar per data point', () => {
    const { container } = render(Sparkline, { data: [1, 2, 3, 4] })
    expect(container.querySelectorAll('.ss-spark i')).toHaveLength(4)
  })

  it('marks the root as data-variant="bars" by default', () => {
    const { container } = render(Sparkline, { data: [1, 2] })
    expect(container.querySelector('.ss-spark')).toHaveAttribute('data-variant', 'bars')
  })

  it('uses the default primary colour when trend is none', () => {
    const { container } = render(Sparkline, { data: [1, 2] })
    const bar = container.querySelector<HTMLElement>('.ss-spark i')!
    expect(bar.style.background).toBe('var(--ss-primary)')
  })

  it('applies a custom colour', () => {
    const { container } = render(Sparkline, { data: [1, 2], color: 'red' })
    const bar = container.querySelector<HTMLElement>('.ss-spark i')!
    expect(bar.style.background).toBe('red')
  })

  it('keeps every bar aria-hidden (decorative)', () => {
    const { container } = render(Sparkline, { data: [1, 2, 3] })
    for (const bar of container.querySelectorAll('.ss-spark i')) {
      expect(bar).toHaveAttribute('aria-hidden', 'true')
    }
  })
})

describe('Sparkline — min/max normalisation', () => {
  it('scales across the real [min,max] range, not just max', () => {
    // near-flat series: old max-only scaling flattened these; min-norm spreads them.
    const { container } = render(Sparkline, { data: [48, 50, 52] })
    const bars = container.querySelectorAll<HTMLElement>('.ss-spark i')
    expect(bars[0].style.height).toBe('8%') // norm(48)=0 -> floor 8%
    expect(bars[2].style.height).toBe('100%') // norm(52)=1
  })

  it('pins a flat series (min===max) to a mid-line', () => {
    const { container } = render(Sparkline, { data: [5, 5, 5] })
    const bars = container.querySelectorAll<HTMLElement>('.ss-spark i')
    for (const b of bars) expect(b.style.height).toBe('50%')
  })

  it('honours explicit min/max props to fix the scale', () => {
    const { container } = render(Sparkline, { data: [0, 50, 100], min: 0, max: 100 })
    const bars = container.querySelectorAll<HTMLElement>('.ss-spark i')
    expect(bars[1].style.height).toBe('50%')
    expect(bars[2].style.height).toBe('100%')
  })
})

describe('Sparkline — trend colouring', () => {
  it('defaults to no trend colour (uses the colour prop)', () => {
    const { container } = render(Sparkline, { data: [1, 5], trend: 'none' })
    expect(container.querySelector<HTMLElement>('.ss-spark i')!.style.background).toBe(
      'var(--ss-primary)',
    )
  })

  it('auto-derives an upward trend to the success colour', () => {
    const { container } = render(Sparkline, { data: [1, 2, 9], trend: 'auto' })
    expect(container.querySelector<HTMLElement>('.ss-spark i')!.style.background).toBe(
      'var(--ss-success)',
    )
  })

  it('auto-derives a downward trend to the danger colour', () => {
    const { container } = render(Sparkline, { data: [9, 4, 1], trend: 'auto' })
    expect(container.querySelector<HTMLElement>('.ss-spark i')!.style.background).toBe(
      'var(--ss-danger)',
    )
  })

  it('auto-derives a flat trend to the muted colour', () => {
    const { container } = render(Sparkline, { data: [5, 7, 5], trend: 'auto' })
    expect(container.querySelector<HTMLElement>('.ss-spark i')!.style.background).toBe(
      'var(--ss-fg-muted)',
    )
  })

  it('honours an explicit trend direction', () => {
    const { container } = render(Sparkline, { data: [9, 4, 1], trend: 'up' })
    expect(container.querySelector<HTMLElement>('.ss-spark i')!.style.background).toBe(
      'var(--ss-success)',
    )
  })
})

describe('Sparkline — empty and single-point inputs', () => {
  it('renders an em-dash placeholder for empty data (no bars)', () => {
    const { container } = render(Sparkline, { data: [] })
    expect(container.querySelectorAll('.ss-spark i')).toHaveLength(0)
    const empty = container.querySelector('.ss-spark .empty')
    expect(empty).not.toBeNull()
    expect(empty).toHaveTextContent('—')
  })

  it('gives empty data an accessible "No data" name', () => {
    const { container } = render(Sparkline, { data: [] })
    expect(container.querySelector('.ss-spark')).toHaveAttribute('aria-label', 'No data')
  })

  it('renders a single value as one centred bar', () => {
    const { container } = render(Sparkline, { data: [42] })
    const bars = container.querySelectorAll('.ss-spark i.single')
    expect(bars).toHaveLength(1)
  })
})

describe('Sparkline — line / area variants', () => {
  it('renders an svg polyline for the line variant', () => {
    const { container } = render(Sparkline, { data: [1, 4, 2, 8], variant: 'line' })
    expect(container.querySelector('.ss-spark[data-variant="line"]')).not.toBeNull()
    expect(container.querySelector('.ss-spark i')).toBeNull()
    const line = container.querySelector('svg polyline.line')
    expect(line).not.toBeNull()
    expect(line!.getAttribute('points')!.split(' ')).toHaveLength(4)
  })

  it('renders a filled path under the curve for the area variant', () => {
    const { container } = render(Sparkline, { data: [1, 4, 2, 8], variant: 'area' })
    const area = container.querySelector('svg path.area')
    expect(area).not.toBeNull()
    // closed path: starts at the baseline and ends with Z
    const d = area!.getAttribute('d')!
    expect(d.startsWith('M')).toBe(true)
    expect(d.trimEnd().endsWith('Z')).toBe(true)
    // area still has a line on top
    expect(container.querySelector('svg polyline.line')).not.toBeNull()
  })

  it('renders a marker for a single-point line/area', () => {
    const { container } = render(Sparkline, { data: [5], variant: 'line' })
    expect(container.querySelector('svg circle.marker')).not.toBeNull()
    expect(container.querySelector('svg polyline.line')).toBeNull()
  })

  it('keeps the svg aria-hidden (the root carries the name)', () => {
    const { container } = render(Sparkline, { data: [1, 2, 3], variant: 'line' })
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Sparkline — fluid / width', () => {
  it('adds the fluid modifier class when fluid is set', () => {
    const { container } = render(Sparkline, { data: [1, 2], fluid: true })
    expect(container.querySelector('.ss-spark')).toHaveClass('fluid')
  })

  it('applies an explicit width', () => {
    const { container } = render(Sparkline, { data: [1, 2], width: '120px' })
    expect(container.querySelector<HTMLElement>('.ss-spark')!.style.width).toBe('120px')
  })
})

describe('Sparkline — accessible summary', () => {
  it('exposes an auto-generated trend summary as the accessible name', () => {
    const { container } = render(Sparkline, { data: [10, 20, 30] })
    const name = container.querySelector('.ss-spark')!.getAttribute('aria-label')!
    expect(name).toContain('rising')
    expect(name).toContain('10')
    expect(name).toContain('30')
    expect(name).toContain('3 points')
  })

  it('formats summary values with valueFormat', () => {
    const { container } = render(Sparkline, {
      data: [10, 30],
      valueFormat: (v: number) => `${v}%`,
    })
    expect(container.querySelector('.ss-spark')!.getAttribute('aria-label')).toContain('10%')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(Sparkline, { data: [1, 2, 3], summary: 'CPU last hour' })
    expect(container.querySelector('.ss-spark')).toHaveAttribute('aria-label', 'CPU last hour')
  })

  it('lets an explicit label override everything', () => {
    const { container } = render(Sparkline, { data: [1, 2, 3], label: 'My chart' })
    expect(container.querySelector('.ss-spark')).toHaveAttribute('aria-label', 'My chart')
  })

  it('has no axe violations (bars)', async () => {
    const { container } = render(Sparkline, { data: [1, 4, 2, 8] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (line)', async () => {
    const { container } = render(Sparkline, { data: [1, 4, 2, 8], variant: 'line' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(Sparkline, { data: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
