import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import BottomNav from '$lib/components/BottomNav.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const ITEMS = [
  { id: 'home', label: 'Home', icon: 'grid' as const },
  { id: 'services', label: 'Services', icon: 'database' as const },
  { id: 'account', label: 'Account', icon: 'user' as const },
]

describe('BottomNav', () => {
  it('renders a nav landmark labelled "Primary" by default', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    const nav = container.querySelector('nav.ss-bottom-nav')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', 'Primary')
  })

  it('accepts a custom ariaLabel', () => {
    const { container } = render(BottomNav, { items: ITEMS, ariaLabel: 'Mobile' })
    expect(container.querySelector('nav.ss-bottom-nav')).toHaveAttribute('aria-label', 'Mobile')
  })

  it('renders the items as a ul/li list of tabs', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    const list = container.querySelector('ul.list')
    expect(list).not.toBeNull()
    expect(list!.querySelectorAll('li.row')).toHaveLength(3)
    expect(container.querySelectorAll('.tab')).toHaveLength(3)
  })

  it('renders the default items when none are provided', () => {
    const { container } = render(BottomNav, {})
    expect(container.querySelectorAll('.tab')).toHaveLength(4)
    const labels = Array.from(container.querySelectorAll('.label')).map((s) => s.textContent)
    expect(labels).toEqual(['Home', 'Services', 'Activity', 'Account'])
  })

  it('renders each tab label and an Icon svg', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    const tabs = container.querySelectorAll('.tab')
    tabs.forEach((tab) => expect(tab.querySelector('svg')).not.toBeNull())
    const labels = Array.from(container.querySelectorAll('.label')).map((s) => s.textContent)
    expect(labels).toEqual(['Home', 'Services', 'Account'])
  })

  it('renders non-href items as <button type="button">', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    container.querySelectorAll('.tab').forEach((tab) => {
      expect(tab.tagName.toLowerCase()).toBe('button')
      expect(tab).toHaveAttribute('type', 'button')
    })
  })

  it('renders an item with href as an anchor', () => {
    const { container } = render(BottomNav, {
      items: [{ id: 'home', label: 'Home', icon: 'grid', href: '/home' }],
    })
    const a = container.querySelector('a.tab')
    expect(a).not.toBeNull()
    expect(a).toHaveAttribute('href', '/home')
  })

  it('marks the active tab with .active and aria-current=page', () => {
    const { container } = render(BottomNav, { items: ITEMS, active: 'services' })
    const active = container.querySelector('.tab.active')
    expect(active).toHaveTextContent('Services')
    expect(active).toHaveAttribute('aria-current', 'page')
    // non-active tabs carry no aria-current
    const others = Array.from(container.querySelectorAll('.tab:not(.active)'))
    others.forEach((t) => expect(t).not.toHaveAttribute('aria-current'))
  })

  it('renders nothing as active when active matches no item', () => {
    const { container } = render(BottomNav, { items: ITEMS, active: 'nope' })
    expect(container.querySelector('.tab.active')).toBeNull()
  })

  it('calls onSelect with the item id when a button tab is clicked', async () => {
    const onSelect = vi.fn()
    const { container } = render(BottomNav, { items: ITEMS, onSelect })
    const tabs = container.querySelectorAll<HTMLElement>('.tab')
    await fireEvent.click(tabs[1])
    expect(onSelect).toHaveBeenCalledWith('services')
  })

  it('still forwards onSelect when an href tab is clicked (SPA fallback)', async () => {
    const onSelect = vi.fn()
    const { container } = render(BottomNav, {
      onSelect,
      items: [{ id: 'home', label: 'Home', icon: 'grid', href: '/home' }],
    })
    const a = container.querySelector<HTMLElement>('a.tab')!
    a.addEventListener('click', (e) => e.preventDefault())
    await fireEvent.click(a)
    expect(onSelect).toHaveBeenCalledWith('home')
  })

  // --- badges --------------------------------------------------------------

  it('renders a count badge and folds it into the accessible name', () => {
    const { container } = render(BottomNav, {
      items: [{ id: 'inbox', label: 'Inbox', icon: 'note', badge: 5 }],
    })
    const badge = container.querySelector('.badge')
    expect(badge).toHaveTextContent('5')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.tab')).toHaveAttribute('aria-label', 'Inbox, 5')
  })

  it('omits the badge and aria-label when no badge is set', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    expect(container.querySelector('.badge')).toBeNull()
    container.querySelectorAll('.tab').forEach((t) => expect(t).not.toHaveAttribute('aria-label'))
  })

  it('does not render a badge for an empty-string badge value', () => {
    const { container } = render(BottomNav, {
      items: [{ id: 'x', label: 'X', icon: 'grid', badge: '' }],
    })
    expect(container.querySelector('.badge')).toBeNull()
  })

  // --- disabled (DS-0078) ----------------------------------------------------

  it('renders a disabled tab as a natively disabled button with aria-disabled', () => {
    const { container } = render(BottomNav, {
      items: [
        { id: 'home', label: 'Home', icon: 'grid' as const },
        { id: 'beta', label: 'Beta', icon: 'settings' as const, disabled: true },
      ],
    })
    const tabs = container.querySelectorAll('.tab')
    expect(tabs[1].tagName.toLowerCase()).toBe('button')
    expect(tabs[1]).toBeDisabled()
    expect(tabs[1]).toHaveAttribute('aria-disabled', 'true')
    // enabled tab is untouched
    expect(tabs[0]).not.toBeDisabled()
    expect(tabs[0]).not.toHaveAttribute('aria-disabled')
  })

  it('does not fire onSelect when a disabled tab is clicked', async () => {
    const onSelect = vi.fn()
    const { container } = render(BottomNav, {
      onSelect,
      items: [{ id: 'beta', label: 'Beta', icon: 'grid' as const, disabled: true }],
    })
    await fireEvent.click(container.querySelector<HTMLElement>('.tab')!)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('renders a disabled href tab as an inert disabled button (no navigation)', async () => {
    const onSelect = vi.fn()
    const { container } = render(BottomNav, {
      onSelect,
      items: [{ id: 'docs', label: 'Docs', icon: 'note' as const, href: '/docs', disabled: true }],
    })
    // no anchor — a disabled link must not be navigable or focusable
    expect(container.querySelector('a.tab')).toBeNull()
    const tab = container.querySelector<HTMLElement>('button.tab')!
    expect(tab).toBeDisabled()
    expect(tab).toHaveAttribute('aria-disabled', 'true')
    expect(tab).not.toHaveAttribute('href')
    await fireEvent.click(tab)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('has no axe violations with a disabled tab', async () => {
    const { container } = render(BottomNav, {
      active: 'home',
      items: [
        { id: 'home', label: 'Home', icon: 'grid' as const },
        { id: 'beta', label: 'Beta', icon: 'note' as const, disabled: true, badge: 2 },
      ],
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  // --- size ----------------------------------------------------------------

  it('applies an explicit size as data-size-variant on the root', () => {
    const { container } = render(BottomNav, { items: ITEMS, size: 'lg' })
    expect(container.querySelector('nav.ss-bottom-nav')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('inherits the global size (no data-size-variant) when size is unset', () => {
    const { container } = render(BottomNav, { items: ITEMS })
    expect(container.querySelector('nav.ss-bottom-nav')).not.toHaveAttribute('data-size-variant')
  })

  // --- a11y ----------------------------------------------------------------

  it('has no axe violations (button tabs)', async () => {
    const { container } = render(BottomNav, { items: ITEMS, active: 'home' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (link tabs + badge)', async () => {
    const { container } = render(BottomNav, {
      active: 'home',
      items: [
        { id: 'home', label: 'Home', icon: 'grid', href: '/home' },
        { id: 'inbox', label: 'Inbox', icon: 'note', href: '/inbox', badge: 3 },
      ],
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
