import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Chart from '$lib/components/Chart.svelte'
import { CHART_DASH_CYCLE, type ChartSeries } from '$lib/components/Chart.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const twoSeries: ChartSeries[] = [
  {
    label: 'Requests',
    data: [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 15 },
    ],
  },
  {
    label: 'Errors',
    data: [
      { x: 0, y: 2 },
      { x: 1, y: 5 },
      { x: 2, y: 3 },
    ],
  },
]

describe('Chart — line variant', () => {
  it('renders one line path per series', () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(container.querySelectorAll('.ss-chart path.line')).toHaveLength(2)
  })

  it('marks the root as data-variant="line" by default', () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(container.querySelector('.ss-chart')).toHaveAttribute('data-variant', 'line')
  })

  it('renders point markers as role="img" with a single roving tab stop', () => {
    const { container } = render(Chart, { series: twoSeries })
    const points = container.querySelectorAll('.ss-chart circle.point')
    expect(points.length).toBe(6)
    points.forEach((p) => expect(p).toHaveAttribute('role', 'img'))
    expect(points[0]).toHaveAttribute('tabindex', '0')
    expect(container.querySelectorAll('.ss-chart [tabindex="0"]')).toHaveLength(1)
    expect(container.querySelectorAll('.ss-chart circle.point[tabindex="-1"]')).toHaveLength(5)
  })
})

describe('Chart — area variant', () => {
  it('renders an area path per series', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'area' })
    expect(container.querySelectorAll('.ss-chart path.area')).toHaveLength(2)
    // area still draws a line on top
    expect(container.querySelectorAll('.ss-chart path.line')).toHaveLength(2)
  })
})

describe('Chart — bar variant', () => {
  it('renders one bar rect per series per category', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    // 3 categories x 2 series = 6 bars
    expect(container.querySelectorAll('.ss-chart rect.bar')).toHaveLength(6)
  })

  it('makes bars role="img" with an aria-label and one roving tab stop', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    const bars = container.querySelectorAll('.ss-chart rect.bar')
    expect(bars[0]).toHaveAttribute('tabindex', '0')
    expect(bars[0]).toHaveAttribute('role', 'img')
    expect(bars[0].getAttribute('aria-label')).toContain('Requests')
    expect(container.querySelectorAll('.ss-chart [tabindex="0"]')).toHaveLength(1)
  })

  it('moves focus between bars with the arrow keys', async () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    const bars = container.querySelectorAll<SVGRectElement>('.ss-chart rect.bar')
    bars[0].focus()
    await fireEvent.keyDown(bars[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(bars[1])
    expect(bars[1]).toHaveAttribute('tabindex', '0')
    expect(bars[0]).toHaveAttribute('tabindex', '-1')
  })
})

describe('Chart — keyboard', () => {
  it('moves focus between points with arrows, Home and End', async () => {
    const { container } = render(Chart, { series: twoSeries })
    const points = container.querySelectorAll<SVGCircleElement>('.ss-chart circle.point')
    points[0].focus()
    await fireEvent.keyDown(points[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(points[1])
    await fireEvent.keyDown(points[1], { key: 'End' })
    expect(document.activeElement).toBe(points[5])
    expect(points[5]).toHaveAttribute('tabindex', '0')
    expect(points[0]).toHaveAttribute('tabindex', '-1')
    await fireEvent.keyDown(points[5], { key: 'Home' })
    expect(document.activeElement).toBe(points[0])
  })

  it('prevents default scrolling on navigation keys only', async () => {
    const { container } = render(Chart, { series: twoSeries })
    const point = container.querySelector<SVGCircleElement>('.ss-chart circle.point')!
    point.focus()
    const nav = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    point.dispatchEvent(nav)
    expect(nav.defaultPrevented).toBe(true)
    const other = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
    point.dispatchEvent(other)
    expect(other.defaultPrevented).toBe(false)
  })
})

describe('Chart — non-colour series encoding', () => {
  it('draws series 0 solid and later series dashed by default (line)', () => {
    const { container } = render(Chart, { series: twoSeries })
    const lines = container.querySelectorAll('.ss-chart path.line')
    expect(lines[0].hasAttribute('stroke-dasharray')).toBe(false)
    expect(lines[1]).toHaveAttribute('stroke-dasharray', CHART_DASH_CYCLE[1])
  })

  it('dashes area-variant lines too', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'area' })
    const lines = container.querySelectorAll('.ss-chart path.line')
    expect(lines[1]).toHaveAttribute('stroke-dasharray', CHART_DASH_CYCLE[1])
  })

  it('gives every series a distinct pattern up to the cycle length', () => {
    const many: ChartSeries[] = CHART_DASH_CYCLE.map((_, i) => ({
      label: `s${i}`,
      data: [
        { x: 0, y: i },
        { x: 1, y: i + 1 },
      ],
    }))
    const { container } = render(Chart, { series: many })
    const dashes = [...container.querySelectorAll('.ss-chart path.line')].map(
      (l) => l.getAttribute('stroke-dasharray') ?? '',
    )
    expect(new Set(dashes).size).toBe(CHART_DASH_CYCLE.length)
  })

  it('draws every line solid when dashes=false', () => {
    const { container } = render(Chart, { series: twoSeries, dashes: false })
    const lines = container.querySelectorAll('.ss-chart path.line[stroke-dasharray]')
    expect(lines).toHaveLength(0)
  })

  it('legend swatches show the same dash pattern as their line', () => {
    const { container } = render(Chart, { series: twoSeries })
    const lines = container.querySelectorAll('.ss-chart path.line')
    const keys = container.querySelectorAll('.ss-chart .legend .swatch-line line')
    expect(keys).toHaveLength(2)
    keys.forEach((k, i) =>
      expect(k.getAttribute('stroke-dasharray')).toBe(lines[i].getAttribute('stroke-dasharray')),
    )
  })

  it('keeps block swatches for bars', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    expect(container.querySelectorAll('.ss-chart .legend .swatch')).toHaveLength(2)
    expect(container.querySelector('.ss-chart .legend .swatch-line')).toBeNull()
  })

  it('renders no end-labels by default', () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(container.querySelector('.ss-chart .end-label')).toBeNull()
  })

  it('renders one direct end-label per series with endLabels', () => {
    const { container } = render(Chart, { series: twoSeries, endLabels: true })
    const labels = [...container.querySelectorAll('.ss-chart text.end-label')]
    expect(labels.map((l) => l.textContent).sort()).toEqual(['Errors', 'Requests'])
    labels.forEach((l) => expect(l).toHaveAttribute('aria-hidden', 'true'))
  })

  it('keeps end-labels apart when the series end at the same value', () => {
    const tied: ChartSeries[] = [
      { label: 'A', data: [{ x: 0, y: 5 }] },
      { label: 'B', data: [{ x: 0, y: 5 }] },
    ]
    const { container } = render(Chart, { series: tied, endLabels: true })
    const ys = [...container.querySelectorAll('.ss-chart text.end-label')].map((l) =>
      Number(l.getAttribute('y')),
    )
    expect(Math.abs(ys[0] - ys[1])).toBeGreaterThanOrEqual(12)
  })
})

describe('Chart — legend', () => {
  it('renders one legend item per series', () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(container.querySelectorAll('.ss-chart .legend-item')).toHaveLength(2)
  })

  it('omits the legend when legend=false', () => {
    const { container } = render(Chart, { series: twoSeries, legend: false })
    expect(container.querySelector('.ss-chart .legend')).toBeNull()
  })
})

describe('Chart — empty state', () => {
  it('renders an em-dash placeholder for empty series', () => {
    const { container } = render(Chart, { series: [] })
    const empty = container.querySelector('.ss-chart .empty')
    expect(empty).not.toBeNull()
    expect(empty).toHaveTextContent('—')
    expect(container.querySelector('.ss-chart path.line')).toBeNull()
  })

  it('gives empty data an accessible "No data" name', () => {
    const { container } = render(Chart, { series: [] })
    expect(container.querySelector('.ss-chart')).toHaveAttribute('aria-label', 'No data')
  })
})

describe('Chart — tooltip', () => {
  it('reveals tooltip text on focusing a point', async () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(container.querySelector('.ss-chart .tooltip')).toBeNull()
    const point = container.querySelector('.ss-chart circle.point')!
    await fireEvent.focus(point)
    const tip = container.querySelector('.ss-chart .tooltip')
    expect(tip).not.toBeNull()
    expect(tip!.textContent).toContain('Requests')
  })

  it('hides the tooltip from AT (no role="status")', async () => {
    const { container } = render(Chart, { series: twoSeries })
    await fireEvent.focus(container.querySelector('.ss-chart circle.point')!)
    const tip = container.querySelector('.ss-chart .tooltip')!
    expect(tip).toHaveAttribute('aria-hidden', 'true')
    expect(tip).not.toHaveAttribute('role')
  })

  it('dismisses the tooltip on Escape (focus and hover)', async () => {
    const { container } = render(Chart, { series: twoSeries })
    const point = container.querySelector('.ss-chart circle.point')!
    await fireEvent.focus(point)
    await fireEvent.keyDown(point, { key: 'Escape' })
    expect(container.querySelector('.ss-chart .tooltip')).toBeNull()
    await fireEvent.mouseEnter(point)
    expect(container.querySelector('.ss-chart .tooltip')).not.toBeNull()
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.ss-chart .tooltip')).toBeNull()
  })

  it('hides the tooltip on blur', async () => {
    const { container } = render(Chart, { series: twoSeries })
    const point = container.querySelector('.ss-chart circle.point')!
    await fireEvent.focus(point)
    expect(container.querySelector('.ss-chart .tooltip')).not.toBeNull()
    await fireEvent.blur(point)
    expect(container.querySelector('.ss-chart .tooltip')).toBeNull()
  })
})

describe('Chart — accessibility', () => {
  it('exposes role="group" and an auto-generated aria-label', () => {
    const { container } = render(Chart, { series: twoSeries })
    const root = container.querySelector('.ss-chart')!
    expect(root).toHaveAttribute('role', 'group')
    const name = root.getAttribute('aria-label')!
    expect(name).toContain('Line chart')
    expect(name).toContain('Requests')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(Chart, { series: twoSeries, summary: 'CPU usage' })
    expect(container.querySelector('.ss-chart')).toHaveAttribute('aria-label', 'CPU usage')
  })

  it('has no axe violations (line)', async () => {
    const { container } = render(Chart, { series: twoSeries })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (area, end-labels)', async () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'area', endLabels: true })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (bar)', async () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(Chart, { series: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
