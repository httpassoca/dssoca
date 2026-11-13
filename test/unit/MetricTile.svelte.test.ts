import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MetricTile from '$lib/components/MetricTile.svelte'

// DS-0191 (Front-End Checklist `aria-live-regions`): liveness is opt-in and, when on, the
// whole tile is one atomic region so the label is announced with the value.
describe('MetricTile live region (DS-0191)', () => {
  it('is not a live region by default', () => {
    const { container } = render(MetricTile, { label: 'cpu', value: 62, delta: '5%' })
    expect(container.querySelector('[role="status"]')).toBeNull()
    expect(container.querySelector('[aria-live]')).toBeNull()
    expect(container.querySelector('.val')).not.toHaveAttribute('role')
  })

  it('makes the whole tile one polite, atomic status region when live', () => {
    const { container } = render(MetricTile, { label: 'cpu', value: 62, live: true })
    const root = container.querySelector('.ss-metric')!
    expect(root).toHaveAttribute('role', 'status')
    expect(root).toHaveAttribute('aria-live', 'polite')
    expect(root).toHaveAttribute('aria-atomic', 'true')
    // the region contains the label, so an update reads "cpu 62", not a bare "62"
    expect(root.querySelector('.label')).toHaveTextContent('cpu')
    expect(root.querySelector('.val')).toHaveTextContent('62')
    // exactly one region per tile
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(1)
  })

  it('keeps the live region mounted across the loading state', async () => {
    const { container, rerender } = render(MetricTile, {
      label: 'cpu',
      value: 62,
      live: true,
      loading: true,
    })
    const root = container.querySelector('.ss-metric')!
    expect(root).toHaveAttribute('aria-live', 'polite')
    expect(root).toHaveAttribute('aria-busy', 'true')
    await rerender({ label: 'cpu', value: 64, live: true, loading: false })
    expect(container.querySelector('.ss-metric')).toBe(root)
    expect(root).not.toHaveAttribute('aria-busy')
    expect(root.querySelector('.val')).toHaveTextContent('64')
  })
})
