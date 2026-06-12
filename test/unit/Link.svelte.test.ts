import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import Link from '$lib/components/Link.svelte'
import LinkHarness from '../harness/LinkHarness.svelte'

const label = (text: string) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }))

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('Link', () => {
  it('renders an anchor with its children text inside a .ss-link', () => {
    const { container } = render(LinkHarness, { href: '/about', text: 'about' })
    const a = container.querySelector('a.ss-link')!
    expect(a).toBeInTheDocument()
    expect(a).toHaveTextContent('about')
    expect(a).toHaveAttribute('href', '/about')
  })

  it('defaults to the inline variant', () => {
    const { container } = render(LinkHarness, { href: '/x', text: 'x' })
    expect(container.querySelector('a')).toHaveClass('ss-link', 'inline')
  })

  it.each(['inline', 'button'] as const)('applies the %s variant class', (variant) => {
    const { container } = render(LinkHarness, { variant, href: '/x', text: 'x' })
    expect(container.querySelector('a')).toHaveClass(variant)
  })

  describe('external handling', () => {
    it('auto-detects an absolute http(s) URL as external', () => {
      const { container } = render(LinkHarness, { href: 'https://example.com', text: 'ext' })
      const a = container.querySelector('a')!
      expect(a).toHaveClass('external')
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not treat a relative URL as external', () => {
      const { container } = render(LinkHarness, { href: '/internal', text: 'in' })
      const a = container.querySelector('a')!
      expect(a).not.toHaveClass('external')
      expect(a).not.toHaveAttribute('target')
      expect(a).not.toHaveAttribute('rel')
    })

    it('honours an explicit external=true even for a relative URL', () => {
      const { container } = render(LinkHarness, { href: '/internal', external: true, text: 'in' })
      const a = container.querySelector('a')!
      expect(a).toHaveClass('external')
      expect(a).toHaveAttribute('target', '_blank')
      expect(a).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('honours an explicit external=false even for an absolute URL', () => {
      const { container } = render(LinkHarness, {
        href: 'https://example.com',
        external: false,
        text: 'forced same-tab',
      })
      const a = container.querySelector('a')!
      expect(a).not.toHaveClass('external')
      expect(a).not.toHaveAttribute('target')
    })

    it('renders the external glyph and an opens-in-new-tab hint when external', () => {
      const { container } = render(LinkHarness, { href: 'https://example.com', text: 'ext' })
      expect(container.querySelector('.ss-link-ext')).toBeInTheDocument()
      expect(screen.getByText(/opens in a new tab/i)).toBeInTheDocument()
    })

    it('renders no external glyph for an internal link', () => {
      const { container } = render(LinkHarness, { href: '/x', text: 'x' })
      expect(container.querySelector('.ss-link-ext')).toBeNull()
    })
  })

  describe('rest props', () => {
    it('forwards unknown attributes onto the <a>', () => {
      const { container } = render(LinkHarness, { href: '/x', text: 'x', 'data-testid': 'my-link' })
      expect(container.querySelector('a')).toHaveAttribute('data-testid', 'my-link')
    })

    it('lets an explicit target/rel override the external defaults', () => {
      // `target` collides with a @testing-library/svelte render option, so the
      // props must be nested under the explicit `props` key here.
      const { container } = render(LinkHarness, {
        props: {
          href: 'https://example.com',
          target: '_self',
          rel: 'nofollow',
          text: 'override',
        },
      })
      const a = container.querySelector('a')!
      expect(a).toHaveAttribute('target', '_self')
      expect(a).toHaveAttribute('rel', 'nofollow')
    })
  })

  describe('disabled (DS-0078)', () => {
    it('renders inert: no href, link semantics kept, aria-disabled set', () => {
      const { container } = render(Link, { href: '/x', disabled: true, children: label('x') })
      const a = container.querySelector('a.ss-link')!
      expect(a).not.toHaveAttribute('href')
      expect(a).toHaveAttribute('role', 'link')
      expect(a).toHaveAttribute('aria-disabled', 'true')
      expect(a).toHaveClass('disabled')
    })

    it('is out of the tab order (explicit tabindex=-1, no href)', () => {
      const { container } = render(Link, { href: '/x', disabled: true, children: label('x') })
      expect(container.querySelector('a')).toHaveAttribute('tabindex', '-1')
    })

    it('swallows clicks: no navigation target and no forwarded onclick', async () => {
      const onclick = vi.fn()
      const { container } = render(Link, {
        href: '/x',
        disabled: true,
        onclick,
        children: label('x'),
      })
      await fireEvent.click(container.querySelector('a')!)
      expect(onclick).not.toHaveBeenCalled()
    })

    it('still fires a forwarded onclick when enabled (regression)', async () => {
      const onclick = vi.fn((e: MouseEvent) => e.preventDefault())
      const { container } = render(Link, { href: '/x', onclick, children: label('x') })
      await fireEvent.click(container.querySelector('a')!)
      expect(onclick).toHaveBeenCalledTimes(1)
    })

    it('drops the external affordances while disabled', () => {
      const { container } = render(Link, {
        href: 'https://example.com',
        disabled: true,
        children: label('ext'),
      })
      const a = container.querySelector('a')!
      expect(a).not.toHaveClass('external')
      expect(a).not.toHaveAttribute('target')
      expect(a).not.toHaveAttribute('rel')
      expect(container.querySelector('.ss-link-ext')).toBeNull()
    })

    it('stays fully interactive when disabled is false (default)', () => {
      const { container } = render(Link, { href: '/x', children: label('x') })
      const a = container.querySelector('a')!
      expect(a).toHaveAttribute('href', '/x')
      expect(a).not.toHaveAttribute('aria-disabled')
      expect(a).not.toHaveAttribute('role')
    })

    it('has no axe violations while disabled', async () => {
      const { container } = render(Link, { href: '/x', disabled: true, children: label('x') })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('a11y (axe)', () => {
    it('has no violations as an inline internal link', async () => {
      const { container } = render(LinkHarness, { href: '/about', text: 'about' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('has no violations as an external link', async () => {
      const { container } = render(LinkHarness, {
        href: 'https://example.com',
        text: 'docs',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('has no violations as a button-variant link', async () => {
      const { container } = render(LinkHarness, {
        variant: 'button',
        href: '/cta',
        text: 'get started',
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
