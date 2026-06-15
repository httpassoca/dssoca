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
