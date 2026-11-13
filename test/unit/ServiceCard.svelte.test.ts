import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ServiceCard from '$lib/components/ServiceCard.svelte'
import ServiceCardHarness from '../harness/ServiceCardHarness.svelte'

describe('ServiceCard', () => {
  it('renders the name and host', () => {
    const { container } = render(ServiceCard, { name: 'movies-api', host: 'movies.home' })
    expect(container.querySelector('.name')).toHaveTextContent('movies-api')
    expect(container.querySelector('.host')).toHaveTextContent('movies.home')
  })

  it('renders a status badge (default up → positive tone)', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home' })
    const badge = container.querySelector('.ss-badge')
    expect(badge).toHaveClass('positive')
    expect(badge).toHaveTextContent('up')
  })

  it('reflects a down status into the badge (critical tone)', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'down' })
    const badge = container.querySelector('.ss-badge')
    expect(badge).toHaveClass('critical')
    expect(badge).toHaveTextContent('down')
  })

  it('spells "deg" out as "degraded" in the badge (caution tone)', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'deg' })
    const badge = container.querySelector('.ss-badge')
    expect(badge).toHaveClass('caution')
    expect(badge).toHaveTextContent('degraded')
  })

  it('supports a maintenance status (distinct tone + spelled-out label)', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'maint' })
    const badge = container.querySelector('.ss-badge')
    expect(badge).toHaveClass('brand')
    expect(badge).not.toHaveClass('critical')
    expect(badge).toHaveTextContent('maintenance')
  })

  it('renders the latency text', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home', latency: '4ms' })
    expect(container.querySelector('.latency')).toHaveTextContent('4ms')
  })

  it('defaults spark to no data instead of a made-up trend (DS-0192)', () => {
    const { container } = render(ServiceCard, { name: 'x', host: 'x.home' })
    expect(container.querySelectorAll('.ss-spark i')).toHaveLength(0)
    expect(container.querySelector('.ss-spark')).toHaveAccessibleName('No data')
  })

  it('renders a sparkline from the spark data', () => {
    const { container } = render(ServiceCard, {
      name: 'x',
      host: 'x.home',
      spark: [1, 2, 3],
    })
    expect(container.querySelectorAll('.ss-spark i')).toHaveLength(3)
  })

  describe('static card (no onclick/href, DS-0192)', () => {
    it('is not a focusable role=button and shows no "open" cue', () => {
      const { container } = render(ServiceCard, { name: 'x', host: 'x.home' })
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.queryByRole('link')).toBeNull()
      expect(container.querySelector('[tabindex]')).toBeNull()
      expect(container.querySelector('.open')).toBeNull()
    })

    it('is a group named by the visible name + status and described by the rest', () => {
      render(ServiceCard, {
        name: 'movies',
        host: 'movies.home',
        status: 'deg',
        latency: '4ms',
        spark: [1, 2, 3],
        updatedAt: new Date(Date.now() - 5_000),
      })
      const group = screen.getByRole('group')
      expect(group).not.toHaveAttribute('aria-label')
      expect(group).toHaveAccessibleName('movies degraded')
      const desc = group.getAttribute('aria-describedby')!.split(' ')
      expect(desc).toHaveLength(4)
      expect(group).toHaveAccessibleDescription(/movies\.home/)
      expect(group).toHaveAccessibleDescription(/4ms/)
      // The sparkline (role=img) is referenced too; jsdom's accname doesn't fold img labels into
      // descriptions, so assert the reference rather than the computed text.
      const trend = document.getElementById(desc[2])!
      expect(trend.querySelector('.ss-spark')).toHaveAccessibleName(/Trend rising/)
    })
  })

  describe('button mode (onclick)', () => {
    it('renders a native <button> overlay named by name + status', () => {
      render(ServiceCard, { name: 'movies', host: 'movies.home', status: 'deg', onclick: () => {} })
      const btn = screen.getByRole('button')
      expect(btn.tagName).toBe('BUTTON')
      expect(btn).toHaveClass('overlay')
      expect(btn).not.toHaveAttribute('aria-label')
      expect(btn).toHaveAccessibleName('movies degraded')
    })

    it('describes the button with host and latency (no longer hidden by aria-label)', () => {
      render(ServiceCard, {
        name: 'movies',
        host: 'movies.home',
        latency: '4ms',
        onclick: () => {},
      })
      const btn = screen.getByRole('button')
      expect(btn).toHaveAccessibleDescription(/movies\.home/)
      expect(btn).toHaveAccessibleDescription(/4ms/)
    })

    it('fires onclick when the card is clicked', async () => {
      const onclick = vi.fn()
      render(ServiceCard, { name: 'x', host: 'x.home', onclick })
      await fireEvent.click(screen.getByRole('button'))
      expect(onclick).toHaveBeenCalledOnce()
    })

    it('shows the "open" cue to sighted users only', () => {
      const { container } = render(ServiceCard, { name: 'x', host: 'x.home', onclick: () => {} })
      expect(container.querySelector('.open')).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not nest meta controls inside the button, and describes it with meta', () => {
      const { container } = render(ServiceCardHarness, { metaText: 'v9.9.9', withLink: true })
      const btn = screen.getByRole('button')
      const metaLink = screen.getByRole('link', { name: 'logs' })
      expect(btn.contains(metaLink)).toBe(false)
      expect(container.querySelector('.ss-svc')!.contains(metaLink)).toBe(true)
      expect(btn).toHaveAccessibleDescription(/v9\.9\.9/)
    })
  })

  describe('link mode (href)', () => {
    it('renders a real <a> overlay with the href, named by name + status', () => {
      const { container } = render(ServiceCard, {
        name: 'movies',
        host: 'movies.home',
        href: '/svc/movies',
      })
      const link = screen.getByRole('link')
      expect(link).toHaveClass('overlay')
      expect(container.querySelector('.ss-svc')!.contains(link)).toBe(true)
      expect(link).toHaveAttribute('href', '/svc/movies')
      expect(link).not.toHaveAttribute('aria-label')
      expect(link).toHaveAccessibleName('movies up')
      expect(link).toHaveAccessibleDescription(/movies\.home/)
    })

    it('does not render a role=button div in link mode (Enter is native)', () => {
      render(ServiceCard, { name: 'x', host: 'x.home', href: '/x' })
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.getByRole('link')).not.toHaveAttribute('tabindex')
    })

    it('still fires onclick on the anchor', async () => {
      const onclick = vi.fn()
      render(ServiceCard, { name: 'x', host: 'x.home', href: '/x', onclick })
      await fireEvent.click(screen.getByRole('link'))
      expect(onclick).toHaveBeenCalledOnce()
    })
  })

  describe('loading state', () => {
    it('marks the root aria-busy and renders skeletons instead of content', () => {
      const { container } = render(ServiceCard, { name: 'x', host: 'x.home', loading: true })
      const root = container.querySelector('.ss-svc')!
      expect(root).toHaveClass('loading')
      expect(root).toHaveAttribute('aria-busy', 'true')
      expect(container.querySelectorAll('.sk').length).toBeGreaterThan(0)
    })

    it('suppresses the click affordance while loading (no role=button/link)', () => {
      render(ServiceCard, { name: 'x', host: 'x.home', loading: true, onclick: () => {} })
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.queryByRole('link')).toBeNull()
    })

    it('hides the real name/host/badge/sparkline while loading', () => {
      const { container } = render(ServiceCard, {
        name: 'movies',
        host: 'movies.home',
        loading: true,
      })
      expect(container.querySelector('.name')).toBeNull()
      expect(container.querySelector('.host')).toBeNull()
      expect(container.querySelector('.ss-badge')).toBeNull()
      expect(container.querySelector('.ss-spark')).toBeNull()
    })
  })

  describe('disabled variant', () => {
    it('sets aria-disabled, drops tabindex/role and ignores onclick', async () => {
      const onclick = vi.fn()
      const { container } = render(ServiceCard, {
        name: 'x',
        host: 'x.home',
        disabled: true,
        onclick,
      })
      const root = container.querySelector('.ss-svc')!
      expect(root).toHaveClass('disabled')
      expect(root).toHaveAttribute('aria-disabled', 'true')
      expect(root).not.toHaveAttribute('tabindex')
      expect(screen.queryByRole('button')).toBeNull()
      expect(container.querySelector('.open')).toBeNull()
      await fireEvent.click(root)
      expect(onclick).not.toHaveBeenCalled()
    })
  })

  describe('updatedAt timestamp', () => {
    it('renders a <time datetime> with the ISO instant', () => {
      const when = new Date('2026-06-08T12:00:00.000Z')
      const { container } = render(ServiceCard, { name: 'x', host: 'x.home', updatedAt: when })
      const time = container.querySelector('time')
      expect(time).not.toBeNull()
      expect(time).toHaveAttribute('datetime', when.toISOString())
    })

    it('accepts an ISO string and ignores invalid input', () => {
      const { container: ok } = render(ServiceCard, {
        name: 'x',
        host: 'x.home',
        updatedAt: '2026-06-08T12:00:00.000Z',
      })
      expect(ok.querySelector('time')).not.toBeNull()

      const { container: bad } = render(ServiceCard, {
        name: 'x',
        host: 'x.home',
        updatedAt: 'not-a-date',
      })
      expect(bad.querySelector('time')).toBeNull()
    })
  })

  describe('meta snippet', () => {
    it('renders extra metadata rows passed via the meta snippet', () => {
      const { container } = render(ServiceCardHarness, { metaText: 'v9.9.9' })
      const meta = container.querySelector('.meta')
      expect(meta).not.toBeNull()
      expect(meta).toHaveTextContent('v9.9.9')
    })
  })
})
