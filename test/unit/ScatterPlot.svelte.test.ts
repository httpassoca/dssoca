import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import ScatterPlot from '$lib/components/ScatterPlot.svelte'
import type { ScatterPoint } from '$lib/components/ScatterPlot.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const points: ScatterPoint[] = [
  { label: 'Ana', x: 2000, y: 7.5 },
  { label: 'Bruno', x: 600, y: 5.7 },
  { label: 'Caio', x: -300, y: 4.5 },
  { label: 'Duda', x: -2300, y: 2.4 },
]

describe('ScatterPlot — points', () => {
  it('renders one circle per point, each a named role="img"', () => {
    const { container } = render(ScatterPlot, { points })
    const dots = container.querySelectorAll('.ss-scatter circle.point')
    expect(dots).toHaveLength(4)
    for (const d of dots) expect(d).toHaveAttribute('role', 'img')
    expect(dots[0].getAttribute('aria-label')).toContain('Ana')
  })

  it('hides the visible point labels from AT (the circle already carries the name)', () => {
    const { container } = render(ScatterPlot, { points })
    for (const t of container.querySelectorAll('.ss-scatter .point-label'))
      expect(t).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws a label next to each point by default and hides them when showLabels=false', () => {
    const shown = render(ScatterPlot, { points })
    expect(shown.container.querySelectorAll('.ss-scatter .point-label')).toHaveLength(4)
    const hidden = render(ScatterPlot, { points, showLabels: false })
    expect(hidden.container.querySelectorAll('.ss-scatter .point-label')).toHaveLength(0)
  })

  it('skips non-finite points', () => {
    const { container } = render(ScatterPlot, {
      points: [...points, { label: 'Bad', x: NaN, y: 1 }],
    })
    expect(container.querySelectorAll('.ss-scatter circle.point')).toHaveLength(4)
  })
})

describe('ScatterPlot — quadrants', () => {
  it('draws reference lines for xRef and yRef', () => {
    const { container } = render(ScatterPlot, { points, xRef: 0, yRef: 5 })
    expect(container.querySelectorAll('.ss-scatter line.ref')).toHaveLength(2)
  })

  it('omits reference lines when not provided', () => {
    const { container } = render(ScatterPlot, { points })
    expect(container.querySelectorAll('.ss-scatter line.ref')).toHaveLength(0)
  })

  it('renders quadrant captions', () => {
    const { container } = render(ScatterPlot, {
      points,
      xRef: 0,
      yRef: 5,
      quadrantLabels: { tl: 'steady star', tr: 'spiky' },
    })
    const caps = [...container.querySelectorAll('.ss-scatter .quadrant')].map((n) => n.textContent)
    expect(caps).toContain('steady star')
    expect(caps).toContain('spiky')
  })
})

describe('ScatterPlot — keyboard (roving tabindex)', () => {
  const dotsOf = (c: HTMLElement) => [...c.querySelectorAll<SVGElement>('.ss-scatter circle.point')]

  it('is a single tab stop: first point tabindex 0, the rest -1', () => {
    const { container } = render(ScatterPlot, { points })
    expect(dotsOf(container).map((d) => d.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
    ])
  })

  it('arrow keys / Home / End move focus and the tab stop between points', async () => {
    const { container } = render(ScatterPlot, { points })
    const dots = dotsOf(container)
    dots[0].focus()
    await fireEvent.keyDown(dots[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(dots[1])
    expect(dots[1]).toHaveAttribute('tabindex', '0')
    expect(dots[0]).toHaveAttribute('tabindex', '-1')
    await fireEvent.keyDown(dots[1], { key: 'End' })
    expect(document.activeElement).toBe(dots[3])
    await fireEvent.keyDown(dots[3], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(dots[2])
    await fireEvent.keyDown(dots[2], { key: 'Home' })
    expect(document.activeElement).toBe(dots[0])
    await fireEvent.keyDown(dots[0], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(dots[0])
  })

  it('remembers the last focused point as the tab stop', async () => {
    const { container } = render(ScatterPlot, { points })
    const dots = dotsOf(container)
    await fireEvent.focus(dots[2])
    expect(dots[2]).toHaveAttribute('tabindex', '0')
    expect(dots[0]).toHaveAttribute('tabindex', '-1')
  })
})

describe('ScatterPlot — tooltip', () => {
  it('is aria-hidden and not a live region', async () => {
    const { container } = render(ScatterPlot, { points })
    await fireEvent.focus(container.querySelector('.ss-scatter circle.point')!)
    const tip = container.querySelector('.ss-scatter .tooltip')!
    expect(tip).toHaveAttribute('aria-hidden', 'true')
    expect(tip).not.toHaveAttribute('role')
  })

  it('hides on Escape (focus and hover)', async () => {
    const { container } = render(ScatterPlot, { points })
    const dot = container.querySelector('.ss-scatter circle.point')!
    await fireEvent.focus(dot)
    await fireEvent.keyDown(dot, { key: 'Escape' })
    expect(container.querySelector('.ss-scatter .tooltip')).toBeNull()
    await fireEvent.mouseEnter(dot)
    expect(container.querySelector('.ss-scatter .tooltip')).not.toBeNull()
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.ss-scatter .tooltip')).toBeNull()
  })

  it('reveals tooltip text on focusing a point and hides it on blur', async () => {
    const { container } = render(ScatterPlot, { points })
    expect(container.querySelector('.ss-scatter .tooltip')).toBeNull()
    const dot = container.querySelector('.ss-scatter circle.point')!
    await fireEvent.focus(dot)
    expect(container.querySelector('.ss-scatter .tooltip')!.textContent).toContain('Ana')
    await fireEvent.blur(dot)
    expect(container.querySelector('.ss-scatter .tooltip')).toBeNull()
  })
})

describe('ScatterPlot — empty state', () => {
  it('renders an em-dash placeholder and a "No data" name', () => {
    const { container } = render(ScatterPlot, { points: [] })
    expect(container.querySelector('.ss-scatter .empty')).toHaveTextContent('—')
    expect(container.querySelector('.ss-scatter')).toHaveAttribute('aria-label', 'No data')
    expect(container.querySelector('.ss-scatter circle.point')).toBeNull()
  })
})

describe('ScatterPlot — accessibility', () => {
  it('exposes role="group" and an auto-generated aria-label', () => {
    const { container } = render(ScatterPlot, { points })
    const root = container.querySelector('.ss-scatter')!
    expect(root).toHaveAttribute('role', 'group')
    expect(root.getAttribute('aria-label')).toContain('Scatter plot')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(ScatterPlot, { points, summary: 'Skill vs consistency' })
    expect(container.querySelector('.ss-scatter')).toHaveAttribute(
      'aria-label',
      'Skill vs consistency',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(ScatterPlot, { points, xRef: 0, yRef: 5 })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(ScatterPlot, { points: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
