import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, fireEvent } from '@testing-library/svelte'
import Sidebar from '$lib/components/Sidebar.svelte'

describe('Sidebar — fills its container height', () => {
  // Layout height can't be measured in jsdom, so lock the fill rule at source:
  // `.ss-side` must stretch to the host's height (min-height: 100%) so the rail
  // border/background span the full screen/column rather than ending at the
  // last item.
  it('stretches .ss-side to the host height via min-height: 100%', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Sidebar.svelte'), 'utf8')
    expect(source).toMatch(/\.ss-side\s*\{[\s\S]*?min-height:\s*100%/)
  })
})

describe('Sidebar', () => {
  it('renders a nav landmark labelled "Sidebar"', () => {
    const { container } = render(Sidebar, {})
    const nav = container.querySelector('nav.ss-side')
    expect(nav).not.toBeNull()
    expect(nav).toHaveAttribute('aria-label', 'Sidebar')
  })

  it('renders the default platform + services sections', () => {
    const { container } = render(Sidebar, {})
    const sections = Array.from(container.querySelectorAll('.section')).map((s) => s.textContent)
    expect(sections).toEqual(['platform', 'services'])
  })

  it('renders each group as a ul/li list tied to its section label', () => {
    const { container } = render(Sidebar, {})
    const lists = container.querySelectorAll('ul.list')
    expect(lists).toHaveLength(2)
    // first list is labelled by the platform section heading
    const section = container.querySelector('.section')!
    expect(lists[0]).toHaveAttribute('aria-labelledby', section.id)
    expect(section.id).toBeTruthy()
    // platform has 3 items
    expect(lists[0].querySelectorAll('li.row')).toHaveLength(3)
  })

  it('renders all default items as labelled entries', () => {
    const { container } = render(Sidebar, {})
    const labels = Array.from(container.querySelectorAll('.item .label')).map((s) => s.textContent)
    expect(labels).toEqual(['Hub', 'Auth', 'Caddy', 'Movies', 'Notes', 'Tasks'])
  })

  it('renders an Icon svg inside each item', () => {
    const { container } = render(Sidebar, {})
    const items = container.querySelectorAll('.item')
    items.forEach((item) => expect(item.querySelector('svg')).not.toBeNull())
  })

  it('renders a text-only item when icon is omitted', () => {
    const { container } = render(Sidebar, {
      groups: [{ section: 'plain', items: [{ id: 'p', label: 'Plain' }] }],
    })
    const item = container.querySelector('.item')
    expect(item).toHaveTextContent('Plain')
    expect(item?.querySelector('svg')).toBeNull()
  })

  it('marks the active item (default hub) with aria-current=page', () => {
    const { container } = render(Sidebar, {})
    const active = container.querySelector('.item.active')
    expect(active).toHaveTextContent('Hub')
    expect(active).toHaveAttribute('aria-current', 'page')
  })

  it('marks a chosen active item', () => {
    const { container } = render(Sidebar, { active: 'movies' })
    expect(container.querySelector('.item.active')).toHaveTextContent('Movies')
  })

  it('renders custom groups when provided', () => {
    const { container } = render(Sidebar, {
      groups: [{ section: 'custom', items: [{ id: 'x', label: 'Xtra', icon: 'grid' }] }],
    })
    expect(container.querySelector('.section')).toHaveTextContent('custom')
    expect(container.querySelector('.item')).toHaveTextContent('Xtra')
  })

  it('renders non-href items as role=button entries', () => {
    const { container } = render(Sidebar, {})
    const items = container.querySelectorAll('.item')
    items.forEach((item) => expect(item).toHaveAttribute('role', 'button'))
  })

  it('calls onSelect with the item id when clicked', async () => {
    const onSelect = vi.fn()
    const { container } = render(Sidebar, { onSelect })
    const items = container.querySelectorAll<HTMLElement>('.item')
    // 4th item is 'movies'
    await fireEvent.click(items[3])
    expect(onSelect).toHaveBeenCalledWith('movies')
  })

  it('calls onSelect on Enter keydown', async () => {
    const onSelect = vi.fn()
    const { container } = render(Sidebar, { onSelect })
    const first = container.querySelector<HTMLElement>('.item')!
    await fireEvent.keyDown(first, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('hub')
  })

  it('adds a warn/err dot class for degraded/down statuses', () => {
    const { container } = render(Sidebar, {
      groups: [
        {
          section: 's',
          items: [
            { id: 'a', label: 'A', icon: 'grid', status: 'deg' },
            { id: 'b', label: 'B', icon: 'grid', status: 'down' },
            { id: 'c', label: 'C', icon: 'grid', status: 'up' },
          ],
        },
      ],
    })
    const items = container.querySelectorAll('.item')
    expect(items[0].querySelector('.dot')).toHaveClass('warn')
    expect(items[1].querySelector('.dot')).toHaveClass('err')
    const upDot = items[2].querySelector('.dot')!
    expect(upDot).not.toHaveClass('warn')
    expect(upDot).not.toHaveClass('err')
  })

  // --- href / real links -------------------------------------------------

  it('renders an anchor with href when item.href is set', () => {
    const { container } = render(Sidebar, {
      groups: [
        { section: 's', items: [{ id: 'docs', label: 'Docs', icon: 'book', href: '/docs' }] },
      ],
    })
    const a = container.querySelector('a.item')
    expect(a).not.toBeNull()
    expect(a).toHaveAttribute('href', '/docs')
    // anchors are not synthetic buttons
    expect(a).not.toHaveAttribute('role', 'button')
  })

  it('marks an active href item with aria-current=page', () => {
    const { container } = render(Sidebar, {
      active: 'docs',
      groups: [
        { section: 's', items: [{ id: 'docs', label: 'Docs', icon: 'book', href: '/docs' }] },
      ],
    })
    expect(container.querySelector('a.item.active')).toHaveAttribute('aria-current', 'page')
  })

  it('still forwards onSelect when an href item is clicked (SPA fallback)', async () => {
    const onSelect = vi.fn()
    const { container } = render(Sidebar, {
      onSelect,
      groups: [
        { section: 's', items: [{ id: 'docs', label: 'Docs', icon: 'book', href: '/docs' }] },
      ],
    })
    const a = container.querySelector<HTMLElement>('a.item')!
    // jsdom doesn't navigate; just confirm the handler fires
    a.addEventListener('click', (e) => e.preventDefault())
    await fireEvent.click(a)
    expect(onSelect).toHaveBeenCalledWith('docs')
  })

  // --- collapsed rail ----------------------------------------------------

  it('sets data-collapsed and exposes the label via aria-label when collapsed', () => {
    const { container } = render(Sidebar, {
      collapsed: true,
      groups: [{ section: 's', items: [{ id: 'hub', label: 'Hub', icon: 'grid', status: 'up' }] }],
    })
    expect(container.querySelector('nav.ss-side')).toHaveAttribute('data-collapsed')
    const item = container.querySelector('.item')!
    expect(item).toHaveAttribute('aria-label', 'Hub')
  })

  it('omits the aria-label when not collapsed', () => {
    const { container } = render(Sidebar, {
      groups: [{ section: 's', items: [{ id: 'hub', label: 'Hub', icon: 'grid' }] }],
    })
    expect(container.querySelector('.item')).not.toHaveAttribute('aria-label')
  })

  it('folds degraded status + badge into the collapsed accessible name', () => {
    const { container } = render(Sidebar, {
      collapsed: true,
      groups: [
        {
          section: 's',
          items: [{ id: 'auth', label: 'Auth', icon: 'user', status: 'deg', badge: 3 }],
        },
      ],
    })
    expect(container.querySelector('.item')).toHaveAttribute('aria-label', 'Auth, degraded, 3')
  })

  it('renders a collapse toggle and fires onToggleCollapsed', async () => {
    const onToggleCollapsed = vi.fn()
    const { container, getByRole } = render(Sidebar, { onToggleCollapsed })
    const toggle = getByRole('button', { name: 'Collapse sidebar' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await fireEvent.click(toggle)
    expect(onToggleCollapsed).toHaveBeenCalledWith(true)
  })

  it('omits the toggle when no onToggleCollapsed handler is provided', () => {
    const { container } = render(Sidebar, {})
    expect(container.querySelector('.rail-toggle')).toBeNull()
  })

  // --- badges ------------------------------------------------------------

  it('renders a badge and includes its count in the accessible name', () => {
    const { container } = render(Sidebar, {
      collapsed: true,
      groups: [{ section: 's', items: [{ id: 'logs', label: 'Logs', icon: 'logs', badge: 12 }] }],
    })
    const badge = container.querySelector('.badge')
    expect(badge).toHaveTextContent('12')
    expect(container.querySelector('.item')).toHaveAttribute('aria-label', 'Logs, 12')
  })

  it('does not render a badge when absent', () => {
    const { container } = render(Sidebar, {
      groups: [{ section: 's', items: [{ id: 'logs', label: 'Logs', icon: 'logs' }] }],
    })
    expect(container.querySelector('.badge')).toBeNull()
  })

  // --- nested / disclosure ----------------------------------------------

  it('renders a disclosure button + nested ul controlled by aria-controls', () => {
    const { container } = render(Sidebar, {
      groups: [
        {
          section: 's',
          items: [
            {
              id: 'media',
              label: 'Media',
              icon: 'film',
              children: [{ id: 'movies', label: 'Movies', icon: 'film' }],
            },
          ],
        },
      ],
    })
    const toggle = container.querySelector('.item.disclosure')!
    expect(toggle).toHaveAttribute('aria-expanded')
    const controls = toggle.getAttribute('aria-controls')!
    const sublist = container.querySelector(`#${controls}`)!
    expect(sublist.tagName.toLowerCase()).toBe('ul')
    expect(sublist).toHaveClass('sublist')
  })

  it('collapses children by default and toggles open on click', async () => {
    const { container } = render(Sidebar, {
      groups: [
        {
          section: 's',
          items: [
            {
              id: 'media',
              label: 'Media',
              icon: 'film',
              children: [{ id: 'movies', label: 'Movies', icon: 'film' }],
            },
          ],
        },
      ],
    })
    const toggle = container.querySelector<HTMLElement>('.item.disclosure')!
    const sublist = container.querySelector('ul.sublist')!
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(sublist).toHaveAttribute('hidden')
    await fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(sublist).not.toHaveAttribute('hidden')
  })

  it('auto-expands a disclosure when a descendant is active', () => {
    const { container } = render(Sidebar, {
      active: 'movies',
      groups: [
        {
          section: 's',
          items: [
            {
              id: 'media',
              label: 'Media',
              icon: 'film',
              children: [{ id: 'movies', label: 'Movies', icon: 'film' }],
            },
          ],
        },
      ],
    })
    const toggle = container.querySelector('.item.disclosure')!
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveClass('active')
    expect(container.querySelector('ul.sublist')).not.toHaveAttribute('hidden')
  })

  it('fires onSelect for a nested non-href child', async () => {
    const onSelect = vi.fn()
    const { container } = render(Sidebar, {
      active: 'media',
      onSelect,
      groups: [
        {
          section: 's',
          items: [
            {
              id: 'media',
              label: 'Media',
              icon: 'film',
              children: [{ id: 'movies', label: 'Movies', icon: 'film' }],
            },
          ],
        },
      ],
    })
    // open the disclosure, then click the child
    await fireEvent.click(container.querySelector<HTMLElement>('.item.disclosure')!)
    const child = container.querySelector<HTMLElement>('.item.child')!
    await fireEvent.click(child)
    expect(onSelect).toHaveBeenCalledWith('movies')
  })

  it('renders a nested child as an anchor when it has an href', () => {
    const { container } = render(Sidebar, {
      groups: [
        {
          section: 's',
          items: [
            {
              id: 'media',
              label: 'Media',
              icon: 'film',
              children: [{ id: 'movies', label: 'Movies', icon: 'film', href: '/movies' }],
            },
          ],
        },
      ],
    })
    const child = container.querySelector('a.item.child')
    expect(child).toHaveAttribute('href', '/movies')
  })
})
