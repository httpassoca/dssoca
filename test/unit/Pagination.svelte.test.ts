import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Pagination from '$lib/components/Pagination.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

/** The page-number buttons only (excludes Prev/Next nav buttons). */
function numberButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('.page')).filter(
    (b) => !b.classList.contains('nav-btn'),
  )
}

describe('Pagination', () => {
  it('renders every page number with no ellipsis when there are few pages', () => {
    const { container } = render(Pagination, { page: 1, pageCount: 4 })
    expect(numberButtons(container).map((b) => b.textContent?.trim())).toEqual(['1', '2', '3', '4'])
    expect(container.querySelectorAll('.ellipsis')).toHaveLength(0)
  })

  it('derives the page count from total / pageSize', () => {
    const { container } = render(Pagination, { page: 1, total: 25, pageSize: 10 })
    // ceil(25/10) = 3 pages
    expect(numberButtons(container).map((b) => b.textContent?.trim())).toEqual(['1', '2', '3'])
  })

  it('windows the pages with ellipses for many pages, keeping first and last', () => {
    const { container } = render(Pagination, { page: 10, pageCount: 20, siblingCount: 1 })
    const labels = numberButtons(container).map((b) => b.textContent?.trim())
    expect(labels[0]).toBe('1')
    expect(labels[labels.length - 1]).toBe('20')
    // sibling window around 10
    expect(labels).toContain('9')
    expect(labels).toContain('10')
    expect(labels).toContain('11')
    // gaps on both sides
    expect(container.querySelectorAll('.ellipsis')).toHaveLength(2)
  })

  it('marks the current page with aria-current="page" and the active class', () => {
    const { container } = render(Pagination, { page: 3, pageCount: 5 })
    const buttons = numberButtons(container)
    const cur = buttons.find((b) => b.textContent?.trim() === '3')!
    expect(cur).toHaveAttribute('aria-current', 'page')
    expect(cur).toHaveClass('active')
    expect(buttons.find((b) => b.textContent?.trim() === '2')).not.toHaveAttribute('aria-current')
  })

  it('disables Prev on the first page', () => {
    const { container } = render(Pagination, { page: 1, pageCount: 5 })
    const prev = container.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')!
    const next = container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!
    expect(prev).toBeDisabled()
    expect(next).not.toBeDisabled()
  })

  it('disables Next on the last page', () => {
    const { container } = render(Pagination, { page: 5, pageCount: 5 })
    const prev = container.querySelector<HTMLButtonElement>('[aria-label="Previous page"]')!
    const next = container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!
    expect(next).toBeDisabled()
    expect(prev).not.toBeDisabled()
  })

  it('sets page and calls onchange when a number is clicked', async () => {
    const onchange = vi.fn()
    const { container } = render(Pagination, { page: 1, pageCount: 5, onchange })
    const btn = numberButtons(container).find((b) => b.textContent?.trim() === '5')!
    await fireEvent.click(btn)
    expect(onchange).toHaveBeenCalledWith(5)
    // the clicked page becomes current
    const cur = numberButtons(container).find((b) => b.getAttribute('aria-current') === 'page')!
    expect(cur.textContent?.trim()).toBe('5')
  })

  it('does not re-fire when the current page button is clicked', async () => {
    const onchange = vi.fn()
    const { container } = render(Pagination, { page: 2, pageCount: 5, onchange })
    const cur = numberButtons(container).find((b) => b.textContent?.trim() === '2')!
    await fireEvent.click(cur)
    expect(onchange).not.toHaveBeenCalled()
  })

  it('moves by one when Next is clicked', async () => {
    const onchange = vi.fn()
    const { container } = render(Pagination, { page: 2, pageCount: 5, onchange })
    await fireEvent.click(container.querySelector('[aria-label="Next page"]')!)
    expect(onchange).toHaveBeenCalledWith(3)
  })

  it('moves by one when Prev is clicked', async () => {
    const onchange = vi.fn()
    const { container } = render(Pagination, { page: 4, pageCount: 5, onchange })
    await fireEvent.click(container.querySelector('[aria-label="Previous page"]')!)
    expect(onchange).toHaveBeenCalledWith(3)
  })

  it('disables every button when disabled and ignores clicks', async () => {
    const onchange = vi.fn()
    const { container } = render(Pagination, { page: 3, pageCount: 6, disabled: true, onchange })
    for (const b of container.querySelectorAll<HTMLButtonElement>('.page')) {
      expect(b).toBeDisabled()
    }
    expect(container.querySelector('.ss-pagination')).toHaveAttribute('data-disabled', 'true')
    await fireEvent.click(numberButtons(container)[0])
    expect(onchange).not.toHaveBeenCalled()
  })

  it('labels the nav landmark', () => {
    const { container } = render(Pagination, { page: 1, pageCount: 3 })
    const nav = container.querySelector('nav.ss-pagination')!
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
  })

  it('writes data-size-variant when an explicit size is given', () => {
    const { container } = render(Pagination, { page: 1, pageCount: 3, size: 'sm' })
    expect(container.querySelector('.ss-pagination')).toHaveAttribute('data-size-variant', 'sm')
  })

  it('omits data-size-variant to inherit the global size when size is unset', () => {
    const { container } = render(Pagination, { page: 1, pageCount: 3 })
    expect(container.querySelector('.ss-pagination')).not.toHaveAttribute('data-size-variant')
  })

  it('has no axe violations (few pages)', async () => {
    const { container } = render(Pagination, { page: 2, pageCount: 4 })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (windowed with ellipses)', async () => {
    const { container } = render(Pagination, { page: 10, pageCount: 20 })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
