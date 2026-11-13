import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import BumpChart from '$lib/components/BumpChart.svelte'
import type { BumpSeries } from '$lib/components/BumpChart.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const stages = ['G1', 'G2', 'G3', 'G4']
const series: BumpSeries[] = [
  { label: 'Ana', ranks: [1, 2, 1, 1] },
  { label: 'Bruno', ranks: [2, 1, 3, 2] },
  { label: 'Caio', ranks: [3, 4, 2, 3] },
  { label: 'Duda', ranks: [4, 3, 4, 4] },
]

describe('BumpChart — lines + nodes', () => {
  it('renders one line path per series', () => {
    const { container } = render(BumpChart, { series, stages })
    expect(container.querySelectorAll('.ss-bump path.line')).toHaveLength(4)
  })

  it('renders one focusable node per (series, stage)', () => {
    const { container } = render(BumpChart, { series, stages })
    const nodes = container.querySelectorAll('.ss-bump circle.node')
    expect(nodes).toHaveLength(series.length * stages.length)
    expect(nodes[0]).toHaveAttribute('tabindex', '0')
    expect(nodes[0].getAttribute('aria-label')).toContain('Ana')
  })

  it('skips nodes whose rank is non-finite but keeps the line', () => {
    const gappy: BumpSeries[] = [{ label: 'Eve', ranks: [1, NaN, 2, 1] }]
    const { container } = render(BumpChart, { series: gappy, stages })
    expect(container.querySelectorAll('.ss-bump circle.node')).toHaveLength(3)
    expect(container.querySelectorAll('.ss-bump path.line')).toHaveLength(1)
  })
})

describe('BumpChart — rank orientation', () => {
  it('draws rank 1 above rank 2 (smaller cy)', () => {
    const { container } = render(BumpChart, {
      series: [
        { label: 'Top', ranks: [1] },
        { label: 'Below', ranks: [2] },
      ],
      stages: ['G1'],
    })
    const nodes = [...container.querySelectorAll('.ss-bump circle.node')]
    const rank1 = nodes.find((n) => n.getAttribute('aria-label')!.includes('Top'))!
    const rank2 = nodes.find((n) => n.getAttribute('aria-label')!.includes('Below'))!
    expect(Number(rank1.getAttribute('cy'))).toBeLessThan(Number(rank2.getAttribute('cy')))
  })
})

describe('BumpChart — labels', () => {
  it('draws a series label at the last node by default and hides them when showLabels=false', () => {
    const shown = render(BumpChart, { series, stages })
    expect(shown.container.querySelectorAll('.ss-bump .series-label')).toHaveLength(4)
    const hidden = render(BumpChart, { series, stages, showLabels: false })
    expect(hidden.container.querySelectorAll('.ss-bump .series-label')).toHaveLength(0)
  })
})

describe('BumpChart — tooltip', () => {
  it('reveals tooltip text on focusing a node and hides it on blur', async () => {
    const { container } = render(BumpChart, { series, stages })
    expect(container.querySelector('.ss-bump .tooltip')).toBeNull()
    const node = container.querySelector('.ss-bump circle.node')!
    await fireEvent.focus(node)
    expect(container.querySelector('.ss-bump .tooltip')!.textContent).toContain('Ana')
    await fireEvent.blur(node)
    expect(container.querySelector('.ss-bump .tooltip')).toBeNull()
  })
})

describe('BumpChart — keyboard (roving tabindex, DS-0186)', () => {
  const nodesOf = (c: HTMLElement) => [...c.querySelectorAll<SVGElement>('.ss-bump circle.node')]

  it('marks are role="img" and the chart is exactly one tab stop', () => {
    const { container } = render(BumpChart, { series, stages })
    const nodes = nodesOf(container)
    for (const n of nodes) expect(n).toHaveAttribute('role', 'img')
    expect(nodes.filter((n) => n.getAttribute('tabindex') === '0')).toHaveLength(1)
    expect(nodes[0]).toHaveAttribute('tabindex', '0')
    expect(nodes.slice(1).every((n) => n.getAttribute('tabindex') === '-1')).toBe(true)
  })

  it('walks series-major: ArrowRight along a line, then into the next series', async () => {
    const { container } = render(BumpChart, { series, stages })
    const nodes = nodesOf(container)
    nodes[3].focus()
    expect(nodes[3].getAttribute('aria-label')).toBe('Ana: G4, rank 1')
    await fireEvent.keyDown(nodes[3], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(nodes[4])
    expect(nodes[4].getAttribute('aria-label')).toBe('Bruno: G1, rank 2')
    expect(nodes[4]).toHaveAttribute('tabindex', '0')
    expect(nodes[3]).toHaveAttribute('tabindex', '-1')
    await fireEvent.keyDown(nodes[4], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(nodes[3])
  })

  it('Home/End jump to first/last and the arrow key default is prevented', async () => {
    const { container } = render(BumpChart, { series, stages })
    const nodes = nodesOf(container)
    nodes[0].focus()
    const ev = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    nodes[0].dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    await Promise.resolve()
    expect(document.activeElement).toBe(nodes[nodes.length - 1])
    await fireEvent.keyDown(nodes[nodes.length - 1], { key: 'Home' })
    expect(document.activeElement).toBe(nodes[0])
  })

  it('keeps the last-focused node as the tab stop', async () => {
    const { container } = render(BumpChart, { series, stages })
    const nodes = nodesOf(container)
    await fireEvent.focus(nodes[6])
    await fireEvent.blur(nodes[6])
    expect(nodes[6]).toHaveAttribute('tabindex', '0')
    expect(nodes[0]).toHaveAttribute('tabindex', '-1')
  })

  it('skips non-finite nodes in the index (indices stay contiguous)', async () => {
    const gappy: BumpSeries[] = [
      { label: 'Eve', ranks: [1, NaN, 2, 1] },
      { label: 'Fay', ranks: [2, 1, 1, 2] },
    ]
    const { container } = render(BumpChart, { series: gappy, stages })
    const nodes = nodesOf(container)
    expect(nodes.map((n) => n.getAttribute('data-index'))).toEqual([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ])
    nodes[2].focus()
    await fireEvent.keyDown(nodes[2], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(nodes[3])
  })
})

describe('BumpChart — tooltip a11y (DS-0186)', () => {
  it('tooltip is aria-hidden, not a live region, and Escape hides it', async () => {
    const { container } = render(BumpChart, { series, stages })
    const node = container.querySelector('.ss-bump circle.node')!
    await fireEvent.focus(node)
    const tip = container.querySelector('.ss-bump .tooltip')!
    expect(tip).toHaveAttribute('aria-hidden', 'true')
    expect(tip).not.toHaveAttribute('role')
    await fireEvent.keyDown(node, { key: 'Escape' })
    expect(container.querySelector('.ss-bump .tooltip')).toBeNull()
  })

  it('Escape dismisses a hover-opened tooltip while focus is elsewhere', async () => {
    const { container } = render(BumpChart, { series, stages })
    const node = container.querySelector('.ss-bump circle.node')!
    await fireEvent.mouseEnter(node)
    expect(container.querySelector('.ss-bump .tooltip')).not.toBeNull()
    await fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(container.querySelector('.ss-bump .tooltip')).toBeNull()
  })

  it("the node's aria-label carries everything the tooltip shows", async () => {
    const { container } = render(BumpChart, { series, stages })
    const node = container.querySelectorAll('.ss-bump circle.node')[1]
    await fireEvent.focus(node)
    const label = node.getAttribute('aria-label')!
    expect(label).toContain('Ana')
    expect(label).toContain('G2')
    expect(label).toContain('rank 2')
  })
})

describe('BumpChart — empty state', () => {
  it('renders an em-dash placeholder and a "No data" name (no series)', () => {
    const { container } = render(BumpChart, { series: [], stages })
    expect(container.querySelector('.ss-bump .empty')).toHaveTextContent('—')
    expect(container.querySelector('.ss-bump')).toHaveAttribute('aria-label', 'No data')
    expect(container.querySelector('.ss-bump circle.node')).toBeNull()
  })

  it('renders the empty state when stages are missing', () => {
    const { container } = render(BumpChart, { series, stages: [] })
    expect(container.querySelector('.ss-bump .empty')).toHaveTextContent('—')
    expect(container.querySelector('.ss-bump circle.node')).toBeNull()
  })
})

describe('BumpChart — accessibility', () => {
  it('exposes role="group" and an auto-generated aria-label', () => {
    const { container } = render(BumpChart, { series, stages })
    const root = container.querySelector('.ss-bump')!
    expect(root).toHaveAttribute('role', 'group')
    expect(root.getAttribute('aria-label')).toContain('Bump chart')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(BumpChart, { series, stages, summary: 'Friday standings' })
    expect(container.querySelector('.ss-bump')).toHaveAttribute('aria-label', 'Friday standings')
  })

  it('has no axe violations', async () => {
    const { container } = render(BumpChart, { series, stages })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(BumpChart, { series: [], stages: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
