import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import CardHarness from '../harness/CardHarness.svelte'
import AccordionHarness from '../harness/AccordionHarness.svelte'
import EmptyState from '$lib/components/EmptyState.svelte'
import Sparkline from '$lib/components/Sparkline.svelte'
import LogStream from '$lib/components/LogStream.svelte'
import BottomNav from '$lib/components/BottomNav.svelte'

// DS-0071 — axe coverage for the components that had no per-component axe
// assertion (Card, EmptyState, Sparkline, LogStream), plus extra variants for
// Accordion and BottomNav. Lives in its own file: the per-component test files
// are being extended in parallel and must not be touched here.

// Suite-standard axe options (mirrors test/unit/a11y.test.ts): jsdom can't do
// layout, so color-contrast is left to Storybook's a11y addon, and page-scope
// landmark/heading rules don't apply to fragment renders.
const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('a11y (axe) — coverage expansion (DS-0071)', () => {
  describe('Card', () => {
    it('static card (title + meta + description + body)', async () => {
      const { container } = render(CardHarness, {
        title: 'Stats',
        meta: 'updated 2m ago',
        description: 'Cluster overview',
        body: 'content',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('interactive card (onclick → role=button)', async () => {
      const { container } = render(CardHarness, {
        title: 'Stats',
        onclick: () => {},
        body: 'content',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('link card (href) with action + footer', async () => {
      const { container } = render(CardHarness, {
        title: 'Stats',
        href: '/stats',
        withAction: true,
        withFooter: true,
        body: 'content',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('EmptyState', () => {
    it('default (title + message + icon glyph)', async () => {
      const { container } = render(EmptyState, {
        title: 'Nothing here yet',
        message: 'Add your first service to get started.',
        icon: '∅',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('error variant (role=alert)', async () => {
      const { container } = render(EmptyState, {
        variant: 'error',
        title: 'Failed to load services',
        message: 'The hub did not respond.',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('no-results variant without a heading role (headingLevel=false)', async () => {
      const { container } = render(EmptyState, {
        variant: 'no-results',
        title: 'No matches',
        headingLevel: false,
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('Sparkline', () => {
    it('line variant (labelled role=img)', async () => {
      const { container } = render(Sparkline, { data: [1, 4, 2, 8, 5], label: 'CPU trend' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('bars variant with trend', async () => {
      const { container } = render(Sparkline, {
        data: [1, 4, 2, 8, 5],
        variant: 'bars',
        trend: 'up',
        label: 'Requests per minute',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('empty data placeholder', async () => {
      const { container } = render(Sparkline, { data: [], label: 'CPU trend' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('LogStream', () => {
    const lines = [
      { lvl: 'info', svc: '[hub]', msg: 'session refresh', t: '12:00:01' },
      { lvl: 'warn', svc: '[caddy]', msg: 'tls renewing', t: '12:00:02' },
      { lvl: 'err', svc: '[tasks]', msg: 'EADDRINUSE :3004', t: '12:00:03' },
    ] as const

    it('controlled lines with the controls toolbar', async () => {
      const { container } = render(LogStream, { lines: [...lines] })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('loading state without controls', async () => {
      const { container } = render(LogStream, { lines: [...lines], controls: false, loading: true })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('empty controlled stream (built-in EmptyState)', async () => {
      const { container } = render(LogStream, { lines: [] })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('Accordion — extra variants', () => {
    it('multiple mode with two sections open', async () => {
      const { container } = render(AccordionHarness, {
        multiple: true,
        defaultValue: ['one', 'two'],
        idBase: 'a11y-acc-multi',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('custom heading level (h2 outline)', async () => {
      const { container } = render(AccordionHarness, {
        headingLevel: 2,
        defaultValue: 'one',
        idBase: 'a11y-acc-h2',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('BottomNav — extra variants', () => {
    it('link tabs (href) with badges and an active tab', async () => {
      const { container } = render(BottomNav, {
        active: 'home',
        items: [
          { id: 'home', label: 'Home', icon: 'grid', href: '/' },
          { id: 'services', label: 'Services', icon: 'database', href: '/services', badge: 3 },
          { id: 'activity', label: 'Activity', icon: 'activity', href: '/activity', badge: '9+' },
        ],
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('button tabs with onSelect and no active tab', async () => {
      const { container } = render(BottomNav, { onSelect: () => {} })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
