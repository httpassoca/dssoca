import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Chart from '$lib/components/Chart.svelte'
import type { ChartSeries } from '$lib/components/Chart.svelte'

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

  it('renders focusable point markers', () => {
    const { container } = render(Chart, { series: twoSeries })
    const points = container.querySelectorAll('.ss-chart circle.point')
    expect(points.length).toBe(6)
    expect(points[0]).toHaveAttribute('tabindex', '0')
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

  it('makes each bar focusable with an aria-label', () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    const bar = container.querySelector('.ss-chart rect.bar')!
    expect(bar).toHaveAttribute('tabindex', '0')
    expect(bar.getAttribute('aria-label')).toContain('Requests')
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

  it('has no axe violations (bar)', async () => {
    const { container } = render(Chart, { series: twoSeries, variant: 'bar' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(Chart, { series: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
