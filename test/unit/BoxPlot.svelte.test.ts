import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import BoxPlot from '$lib/components/BoxPlot.svelte'
import type { BoxGroup } from '$lib/components/BoxPlot.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const groups: BoxGroup[] = [
  { label: 'Ana', values: [20000, 21000, 19500, 22000, 20500, 23000] },
  { label: 'Bruno', values: [15000, 18000, 12000, 22000, 9000, 25000] },
  { label: 'Caio', values: [17000, 17500, 16800, 18200, 17000, 16500] },
]

describe('BoxPlot — boxes', () => {
  it('renders one box per group', () => {
    const { container } = render(BoxPlot, { groups })
    const boxes = container.querySelectorAll('.ss-boxplot rect.box')
    expect(boxes).toHaveLength(3)
    expect(boxes[0]).toHaveAttribute('tabindex', '0')
    expect(boxes[1]).toHaveAttribute('tabindex', '-1')
    expect(boxes[2]).toHaveAttribute('tabindex', '-1')
    expect(boxes[0].getAttribute('aria-label')).toContain('Ana')
  })

  it('renders median and whisker elements', () => {
    const { container } = render(BoxPlot, { groups })
    expect(container.querySelectorAll('.ss-boxplot line.median')).toHaveLength(3)
    // 3 lines per group (centre + two caps).
    expect(container.querySelectorAll('.ss-boxplot line.whisker')).toHaveLength(9)
  })

  it('toggles the point overlay with showPoints', () => {
    const total = groups.reduce((n, g) => n + g.values.length, 0)
    const withPoints = render(BoxPlot, { groups, showPoints: true })
    expect(withPoints.container.querySelectorAll('.ss-boxplot circle.point')).toHaveLength(total)
    const withoutPoints = render(BoxPlot, { groups, showPoints: false })
    expect(withoutPoints.container.querySelectorAll('.ss-boxplot circle.point')).toHaveLength(0)
  })
})

describe('BoxPlot — tooltip', () => {
  it('reveals tooltip text on focusing a box and hides it on blur', async () => {
    const { container } = render(BoxPlot, { groups })
    expect(container.querySelector('.ss-boxplot .tooltip')).toBeNull()
    const box = container.querySelector('.ss-boxplot rect.box')!
    await fireEvent.focus(box)
    expect(container.querySelector('.ss-boxplot .tooltip')!.textContent).toContain('Ana')
    await fireEvent.blur(box)
    expect(container.querySelector('.ss-boxplot .tooltip')).toBeNull()
  })

  it('hides the tooltip from AT and is not a live region', async () => {
    const { container } = render(BoxPlot, { groups })
    await fireEvent.focus(container.querySelector('.ss-boxplot rect.box')!)
    const tip = container.querySelector('.ss-boxplot .tooltip')!
    expect(tip).toHaveAttribute('aria-hidden', 'true')
    expect(tip).not.toHaveAttribute('role')
  })

  it('dismisses the tooltip on Escape (focus and hover)', async () => {
    const { container } = render(BoxPlot, { groups })
    const box = container.querySelector('.ss-boxplot rect.box')!
    await fireEvent.focus(box)
    await fireEvent.keyDown(box, { key: 'Escape' })
    expect(container.querySelector('.ss-boxplot .tooltip')).toBeNull()
    await fireEvent.mouseEnter(box)
    expect(container.querySelector('.ss-boxplot .tooltip')).not.toBeNull()
    await fireEvent.keyDown(window, { key: 'Escape' })
    expect(container.querySelector('.ss-boxplot .tooltip')).toBeNull()
  })

  it('puts min and max (shown only in the tooltip) into the box label', () => {
    const { container } = render(BoxPlot, {
      groups: [{ label: 'G', values: [1, 2, 3, 4, 5] }],
      yFormat: (y: number) => `${y}u`,
    })
    const label = container.querySelector('.ss-boxplot rect.box')!.getAttribute('aria-label')!
    expect(label).toContain('min 1u')
    expect(label).toContain('max 5u')
  })
})

describe('BoxPlot — keyboard (roving tabindex)', () => {
  it('exposes marks as role="img", not inert buttons', () => {
    const { container } = render(BoxPlot, { groups })
    const boxes = container.querySelectorAll('.ss-boxplot rect.box')
    boxes.forEach((b) => expect(b).toHaveAttribute('role', 'img'))
    expect(container.querySelector('.ss-boxplot [role="button"]')).toBeNull()
  })

  it('is a single tab stop', () => {
    const { container } = render(BoxPlot, { groups })
    expect(container.querySelectorAll('.ss-boxplot [tabindex="0"]')).toHaveLength(1)
  })

  it('moves focus with the arrow keys, Home and End, and keeps the last focused as the tab stop', async () => {
    const { container } = render(BoxPlot, { groups })
    const boxes = container.querySelectorAll<SVGRectElement>('.ss-boxplot rect.box')
    boxes[0].focus()
    await fireEvent.keyDown(boxes[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(boxes[1])
    expect(boxes[1]).toHaveAttribute('tabindex', '0')
    expect(boxes[0]).toHaveAttribute('tabindex', '-1')
    await fireEvent.keyDown(boxes[1], { key: 'End' })
    expect(document.activeElement).toBe(boxes[2])
    await fireEvent.keyDown(boxes[2], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(boxes[2])
    await fireEvent.keyDown(boxes[2], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(boxes[1])
    await fireEvent.keyDown(boxes[1], { key: 'Home' })
    expect(document.activeElement).toBe(boxes[0])
    expect(container.querySelectorAll('.ss-boxplot [tabindex="0"]')).toHaveLength(1)
  })

  it('does not swallow non-navigation keys', async () => {
    const { container } = render(BoxPlot, { groups })
    const box = container.querySelector('.ss-boxplot rect.box')!
    const notCancelled = await fireEvent.keyDown(box, { key: 'Tab' })
    expect(notCancelled).toBe(true)
  })
})

describe('BoxPlot — empty state', () => {
  it('renders an em-dash placeholder and a "No data" name', () => {
    const { container } = render(BoxPlot, { groups: [] })
    expect(container.querySelector('.ss-boxplot .empty')).toHaveTextContent('—')
    expect(container.querySelector('.ss-boxplot')).toHaveAttribute('aria-label', 'No data')
    expect(container.querySelector('.ss-boxplot rect.box')).toBeNull()
  })

  it('treats groups with no finite values as empty', () => {
    const { container } = render(BoxPlot, { groups: [{ label: 'X', values: [] }] })
    expect(container.querySelector('.ss-boxplot')).toHaveAttribute('aria-label', 'No data')
  })
})

describe('BoxPlot — accessibility', () => {
  it('exposes role="group" and an auto-generated aria-label', () => {
    const { container } = render(BoxPlot, { groups })
    const root = container.querySelector('.ss-boxplot')!
    expect(root).toHaveAttribute('role', 'group')
    expect(root.getAttribute('aria-label')).toContain('Box plot')
  })

  it('lets an explicit summary override the auto text', () => {
    const { container } = render(BoxPlot, { groups, summary: 'Score spread per player' })
    expect(container.querySelector('.ss-boxplot')).toHaveAttribute(
      'aria-label',
      'Score spread per player',
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(BoxPlot, { groups })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (empty)', async () => {
    const { container } = render(BoxPlot, { groups: [] })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
