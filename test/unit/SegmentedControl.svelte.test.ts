import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import SegmentedControl from '$lib/components/SegmentedControl.svelte'

const OPTS = [
  { value: 'list', label: 'List', icon: 'logs' as const },
  { value: 'grid', label: 'Grid', icon: 'grid' as const },
  { value: 'map', label: 'Map' },
]

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('SegmentedControl', () => {
  it('renders a radiogroup with one radio per option', () => {
    const { container } = render(SegmentedControl, { options: OPTS, label: 'View' })
    const group = container.querySelector('.ss-segmented')!
    expect(group).toHaveAttribute('role', 'radiogroup')
    expect(group).toHaveAttribute('aria-label', 'View')
    expect(container.querySelectorAll('[role="radio"]')).toHaveLength(3)
  })

  it('renders each option label and an icon when provided', () => {
    const { container } = render(SegmentedControl, { options: OPTS, label: 'View' })
    const segs = container.querySelectorAll('.segment')
    expect(Array.from(segs).map((s) => s.querySelector('.label')!.textContent)).toEqual([
      'List',
      'Grid',
      'Map',
    ])
    // icons present on the first two, absent on the third
    expect(segs[0].querySelector('svg')).not.toBeNull()
    expect(segs[1].querySelector('svg')).not.toBeNull()
    expect(segs[2].querySelector('svg')).toBeNull()
  })

  it('marks the selected option with aria-checked and the selected class', () => {
    const { container } = render(SegmentedControl, { options: OPTS, value: 'grid', label: 'View' })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    expect(segs[1]).toHaveAttribute('aria-checked', 'true')
    expect(segs[1]).toHaveClass('selected')
    expect(segs[0]).toHaveAttribute('aria-checked', 'false')
    expect(segs[2]).toHaveAttribute('aria-checked', 'false')
  })

  // --- roving tabindex ----------------------------------------------------

  it('gives the selected segment the single tab stop (roving tabindex)', () => {
    const { container } = render(SegmentedControl, { options: OPTS, value: 'grid', label: 'View' })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    expect(segs[0]).toHaveAttribute('tabindex', '-1')
    expect(segs[1]).toHaveAttribute('tabindex', '0')
    expect(segs[2]).toHaveAttribute('tabindex', '-1')
  })

  it('falls back to the first enabled segment for the tab stop when nothing is selected', () => {
    const { container } = render(SegmentedControl, {
      options: [
        { value: 'a', label: 'A', disabled: true },
        { value: 'b', label: 'B' },
      ],
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    expect(segs[0]).toHaveAttribute('tabindex', '-1')
    expect(segs[1]).toHaveAttribute('tabindex', '0')
  })

  // --- selection ----------------------------------------------------------

  it('selects on click and fires onChange', async () => {
    const onChange = vi.fn()
    const { container } = render(SegmentedControl, {
      options: OPTS,
      value: 'list',
      onChange,
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.click(segs[2])
    expect(onChange).toHaveBeenCalledWith('map')
    expect(segs[2]).toHaveAttribute('aria-checked', 'true')
  })

  it('does not fire onChange when clicking the already-selected segment', async () => {
    const onChange = vi.fn()
    const { container } = render(SegmentedControl, {
      options: OPTS,
      value: 'list',
      onChange,
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.click(segs[0])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders a disabled segment and ignores clicks on it', async () => {
    const onChange = vi.fn()
    const { container } = render(SegmentedControl, {
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ],
      value: 'a',
      onChange,
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLButtonElement>('.segment')
    expect(segs[1]).toBeDisabled()
    await fireEvent.click(segs[1])
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- keyboard -----------------------------------------------------------

  it('ArrowRight moves selection + focus to the next option', async () => {
    const onChange = vi.fn()
    const { container } = render(SegmentedControl, {
      options: OPTS,
      value: 'list',
      onChange,
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.keyDown(segs[0], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('grid')
    expect(segs[1]).toHaveAttribute('aria-checked', 'true')
    expect(document.activeElement).toBe(segs[1])
  })

  it('ArrowLeft wraps from the first to the last option', async () => {
    const onChange = vi.fn()
    const { container } = render(SegmentedControl, {
      options: OPTS,
      value: 'list',
      onChange,
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.keyDown(segs[0], { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith('map')
    expect(document.activeElement).toBe(segs[2])
  })

  it('ArrowDown / ArrowUp behave like Right / Left', async () => {
    const { container } = render(SegmentedControl, { options: OPTS, value: 'grid', label: 'View' })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.keyDown(segs[1], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(segs[2])
    await fireEvent.keyDown(segs[2], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(segs[1])
  })

  it('Home / End jump to the first / last enabled option', async () => {
    const { container } = render(SegmentedControl, { options: OPTS, value: 'grid', label: 'View' })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.keyDown(segs[1], { key: 'End' })
    expect(document.activeElement).toBe(segs[2])
    await fireEvent.keyDown(segs[2], { key: 'Home' })
    expect(document.activeElement).toBe(segs[0])
  })

  it('arrow navigation skips disabled options', async () => {
    const { container } = render(SegmentedControl, {
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
        { value: 'c', label: 'C' },
      ],
      value: 'a',
      label: 'View',
    })
    const segs = container.querySelectorAll<HTMLElement>('.segment')
    await fireEvent.keyDown(segs[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(segs[2])
  })

  // --- component-wide disabled (DS-0078) -----------------------------------

  describe('component-wide disabled', () => {
    it('disables every segment and marks the group aria-disabled', () => {
      const { container } = render(SegmentedControl, {
        options: OPTS,
        value: 'list',
        disabled: true,
        label: 'View',
      })
      expect(container.querySelector('.ss-segmented')).toHaveAttribute('aria-disabled', 'true')
      for (const seg of container.querySelectorAll<HTMLButtonElement>('.segment')) {
        expect(seg).toBeDisabled()
      }
    })

    it('removes the tab stop entirely (no tabbable segment)', () => {
      const { container } = render(SegmentedControl, {
        options: OPTS,
        value: 'list',
        disabled: true,
        label: 'View',
      })
      for (const seg of container.querySelectorAll<HTMLElement>('.segment')) {
        expect(seg).toHaveAttribute('tabindex', '-1')
      }
    })

    it('ignores clicks and keyboard while disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(SegmentedControl, {
        options: OPTS,
        value: 'list',
        onChange,
        disabled: true,
        label: 'View',
      })
      const segs = container.querySelectorAll<HTMLElement>('.segment')
      await fireEvent.click(segs[1])
      await fireEvent.keyDown(segs[0], { key: 'ArrowRight' })
      expect(onChange).not.toHaveBeenCalled()
      expect(segs[0]).toHaveAttribute('aria-checked', 'true') // selection unchanged
    })

    it('does not set aria-disabled on the group by default', () => {
      const { container } = render(SegmentedControl, { options: OPTS, label: 'View' })
      expect(container.querySelector('.ss-segmented')).not.toHaveAttribute('aria-disabled')
    })

    it('has no axe violations while disabled', async () => {
      const { container } = render(SegmentedControl, {
        options: OPTS,
        value: 'list',
        disabled: true,
        label: 'View mode',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  // --- layout -------------------------------------------------------------

  it('applies the full class when fullWidth is set', () => {
    const { container } = render(SegmentedControl, {
      options: OPTS,
      fullWidth: true,
      label: 'View',
    })
    expect(container.querySelector('.ss-segmented')).toHaveClass('full')
  })

  it('writes data-size-variant when an explicit size is given', () => {
    const { container } = render(SegmentedControl, { options: OPTS, size: 'sm', label: 'View' })
    expect(container.querySelector('.ss-segmented')).toHaveAttribute('data-size-variant', 'sm')
  })

  it('omits data-size-variant to inherit the global size when size is unset', () => {
    const { container } = render(SegmentedControl, { options: OPTS, label: 'View' })
    expect(container.querySelector('.ss-segmented')).not.toHaveAttribute('data-size-variant')
  })

  // --- a11y ---------------------------------------------------------------

  it('has no axe violations', async () => {
    const { container } = render(SegmentedControl, {
      options: OPTS,
      value: 'grid',
      label: 'View mode',
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations with a disabled option', async () => {
    const { container } = render(SegmentedControl, {
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ],
      value: 'a',
      label: 'View mode',
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
