import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import BadgeHarness from '../harness/BadgeHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const TONES = ['brand', 'neutral', 'positive', 'caution', 'critical', 'info'] as const

describe('Badge', () => {
  it('renders its children text inside a .ss-badge', () => {
    const { container } = render(BadgeHarness, { text: 'online' })
    const badge = container.querySelector('.ss-badge')
    expect(badge).not.toBeNull()
    expect(badge).toHaveTextContent('online')
  })

  it('defaults to the neutral tone', () => {
    const { container } = render(BadgeHarness, { text: 'x' })
    expect(container.querySelector('.ss-badge')).toHaveClass('neutral')
  })

  it.each(TONES)('applies the %s tone class', (tone) => {
    const { container } = render(BadgeHarness, { tone, text: tone })
    expect(container.querySelector('.ss-badge')).toHaveClass(tone)
  })

  describe('non-interactive (DS-0120)', () => {
    it('renders no interactive / focusable element in any prop combination', () => {
      const { container } = render(BadgeHarness, {
        text: 'tag',
        label: 'tag',
        dot: true,
        count: 3,
        live: true,
      })
      expect(container.querySelector('button')).toBeNull()
      expect(container.querySelector('a')).toBeNull()
      expect(container.querySelector('[tabindex]')).toBeNull()
    })
  })

  describe('dot', () => {
    it('renders no dot by default', () => {
      const { container } = render(BadgeHarness, { tone: 'positive', text: 'up' })
      expect(container.querySelector('.ss-badge .dot')).toBeNull()
    })

    it('renders a decorative dot when dot=true', () => {
      const { container } = render(BadgeHarness, { tone: 'positive', text: 'up', dot: true })
      const dot = container.querySelector('.ss-badge .dot')
      expect(dot).not.toBeNull()
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })

    it('is decoupled from tone (neutral can carry a dot too)', () => {
      const { container } = render(BadgeHarness, { tone: 'neutral', text: 'n', dot: true })
      expect(container.querySelector('.ss-badge .dot')).not.toBeNull()
    })
  })

  describe('dot-only / label-less mode', () => {
    it('renders only the dot with no visible text', () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        dot: true,
        tone: 'critical',
        label: 'down',
      })
      const badge = container.querySelector('.ss-badge')!
      expect(badge).toHaveClass('label-less')
      expect(badge.querySelector('.dot')).not.toBeNull()
      expect(badge.textContent?.trim()).toBe('')
    })

    it('carries the status as an aria-label so it is not colour-only', () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        dot: true,
        tone: 'positive',
        label: 'operational',
      })
      expect(container.querySelector('.ss-badge')).toHaveAttribute('aria-label', 'operational')
    })

    it('uses role="img" so the aria-label is valid', () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        dot: true,
        tone: 'positive',
        label: 'operational',
      })
      expect(container.querySelector('.ss-badge')).toHaveAttribute('role', 'img')
    })

    it('does not set an aria-label when a label snippet is present', () => {
      const { container } = render(BadgeHarness, { text: 'visible', label: 'ignored' })
      expect(container.querySelector('.ss-badge')).not.toHaveAttribute('aria-label')
    })
  })

  describe('count', () => {
    it('renders the count value', () => {
      const { container } = render(BadgeHarness, { noLabel: true, count: 5, label: 'items' })
      expect(container.querySelector('.ss-badge .count')).toHaveTextContent('5')
    })

    it('clamps to max with a trailing + (default max 99)', () => {
      const { container } = render(BadgeHarness, { noLabel: true, count: 150, label: 'items' })
      expect(container.querySelector('.ss-badge .count')).toHaveTextContent('99+')
    })

    it('honours a custom max', () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        count: 12,
        max: 9,
        label: 'items',
      })
      expect(container.querySelector('.ss-badge .count')).toHaveTextContent('9+')
    })

    it('renders nothing for the count when it is 0', () => {
      const { container } = render(BadgeHarness, { noLabel: true, count: 0, label: 'items' })
      expect(container.querySelector('.ss-badge .count')).toBeNull()
    })

    it('can accompany a label', () => {
      const { container } = render(BadgeHarness, { text: 'inbox', count: 3 })
      const badge = container.querySelector('.ss-badge')!
      expect(badge).toHaveTextContent('inbox')
      expect(badge.querySelector('.count')).toHaveTextContent('3')
    })
  })

  describe('live status semantics', () => {
    it('is a plain span by default (no role/aria-live)', () => {
      const { container } = render(BadgeHarness, { text: 'static' })
      const badge = container.querySelector('.ss-badge')!
      expect(badge).not.toHaveAttribute('role')
      expect(badge).not.toHaveAttribute('aria-live')
    })

    it('exposes role=status + aria-live=polite when live', () => {
      const { container } = render(BadgeHarness, { text: 'up', live: true })
      const badge = container.querySelector('.ss-badge')!
      expect(badge).toHaveAttribute('role', 'status')
      expect(badge).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('a11y (axe)', () => {
    it.each(TONES)('labelled %s badge has no violations', async (tone) => {
      const { container } = render(BadgeHarness, { tone, text: tone })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('dot-only badge has no violations', async () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        dot: true,
        tone: 'critical',
        label: 'down',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('count-only badge has no violations', async () => {
      const { container } = render(BadgeHarness, {
        noLabel: true,
        count: 7,
        tone: 'info',
        label: 'unread',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
