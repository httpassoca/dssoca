import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import CardHarness from '../harness/CardHarness.svelte'

describe('Card', () => {
  it('renders children inside the body', () => {
    const { container } = render(CardHarness, { body: 'panel content' })
    expect(container.querySelector('.body')).toHaveTextContent('panel content')
  })

  it('uses the .ss-card identity class (not .ss-panel)', () => {
    const { container } = render(CardHarness, { body: 'x' })
    expect(container.querySelector('.ss-card')).not.toBeNull()
    expect(container.querySelector('.ss-panel')).toBeNull()
  })

  it('omits the head when no title/meta/description/action is given', () => {
    const { container } = render(CardHarness, { body: 'x' })
    expect(container.querySelector('.head')).toBeNull()
  })

  it('renders a head with the title when provided', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    expect(container.querySelector('.head')).not.toBeNull()
    expect(container.querySelector('.head .title')).toHaveTextContent('Stats')
  })

  it('renders the meta text when provided alongside a title', () => {
    const { container } = render(CardHarness, { title: 'Stats', meta: 'updated 2m ago', body: 'x' })
    expect(container.querySelector('.meta')).toHaveTextContent('updated 2m ago')
  })

  it('omits the meta element when not provided', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    expect(container.querySelector('.meta')).toBeNull()
  })

  it('renders the action snippet in the head when provided', () => {
    const { container } = render(CardHarness, { title: 'Stats', withAction: true, body: 'x' })
    expect(container.querySelector('.card-action')).not.toBeNull()
  })

  it('uses a scoped .actions wrapper (no inline style) for meta + action', () => {
    const { container } = render(CardHarness, { title: 'Stats', withAction: true, body: 'x' })
    const actions = container.querySelector('.actions')
    expect(actions).not.toBeNull()
    expect(actions?.getAttribute('style')).toBeNull()
    expect(actions?.querySelector('.card-action')).not.toBeNull()
  })

  it('renders a description under the heading in a .desc element', () => {
    const { container } = render(CardHarness, {
      title: 'Stats',
      description: 'last 24h',
      body: 'x',
    })
    expect(container.querySelector('.desc')).toHaveTextContent('last 24h')
  })

  it('omits the description element when not provided', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    expect(container.querySelector('.desc')).toBeNull()
  })

  it('renders a head when only a description is given (no title)', () => {
    const { container } = render(CardHarness, { description: 'just desc', body: 'x' })
    expect(container.querySelector('.head')).not.toBeNull()
    expect(container.querySelector('.desc')).toHaveTextContent('just desc')
  })

  it('accepts a Snippet as the title', () => {
    const { container } = render(CardHarness, { withTitleSnippet: true, body: 'x' })
    expect(container.querySelector('.title .title-snippet')).not.toBeNull()
    expect(container.querySelector('.title')).toHaveTextContent('Live')
  })

  it('honours a custom titleLevel via aria-level', () => {
    const { container } = render(CardHarness, { title: 'Stats', titleLevel: 2, body: 'x' })
    expect(container.querySelector('.title')?.getAttribute('aria-level')).toBe('2')
  })

  it('renders the media snippet full-bleed above the head', () => {
    const { container } = render(CardHarness, { title: 'Stats', withMedia: true, body: 'x' })
    const media = container.querySelector('.media')
    expect(media).not.toBeNull()
    expect(media?.querySelector('.card-media')).not.toBeNull()
    // media comes before head in the DOM
    const root = container.querySelector('.ss-card')!
    const kids = Array.from(root.children)
    expect(kids.indexOf(root.querySelector('.media')!)).toBeLessThan(
      kids.indexOf(root.querySelector('.head')!),
    )
  })

  it('omits the media region when not provided', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    expect(container.querySelector('.media')).toBeNull()
  })

  it('renders the footer band only when provided', () => {
    const { container } = render(CardHarness, { withFooter: true, body: 'x' })
    expect(container.querySelector('.foot')).toHaveTextContent('footer text')
  })

  it('omits the footer when not provided', () => {
    const { container } = render(CardHarness, { body: 'x' })
    expect(container.querySelector('.foot')).toBeNull()
  })

  it('is outlined by default and elevated when variant=elevated', () => {
    const { container: outlined } = render(CardHarness, { body: 'x' })
    expect(outlined.querySelector('.ss-card')?.classList.contains('elevated')).toBe(false)

    const { container: elevated } = render(CardHarness, { variant: 'elevated', body: 'x' })
    expect(elevated.querySelector('.ss-card')?.classList.contains('elevated')).toBe(true)
  })

  it('renders a full-card overlay link when href is given', () => {
    const { container } = render(CardHarness, { title: 'Stats', href: '/foo', body: 'x' })
    const overlay = container.querySelector('a.overlay')
    expect(overlay).not.toBeNull()
    expect(overlay?.getAttribute('href')).toBe('/foo')
    // the root is not a button when linking
    expect(container.querySelector('.ss-card')?.getAttribute('role')).not.toBe('button')
  })

  // DS-0158 — off-site link cards (the docs' Inspirations gallery).
  it('external: the overlay opens in a new tab, noopener, and says so to AT', () => {
    const { container } = render(CardHarness, {
      title: 'Ops console',
      href: 'https://example.com/x/',
      external: true,
      body: 'x',
    })
    const overlay = container.querySelector('a.overlay')!
    expect(overlay).toHaveAttribute('target', '_blank')
    expect(overlay).toHaveAttribute('rel', 'noopener noreferrer')
    expect(overlay.querySelector('.sr-only')).toHaveTextContent('Ops console (opens in a new tab)')
  })

  it('a plain href stays same-tab with no rel and no announcement', () => {
    const { container } = render(CardHarness, { title: 'Stats', href: '/foo', body: 'x' })
    const overlay = container.querySelector('a.overlay')!
    expect(overlay).not.toHaveAttribute('target')
    expect(overlay).not.toHaveAttribute('rel')
    expect(overlay.querySelector('.sr-only')).toHaveTextContent(/^Stats$/)
  })

  it('labels the card region via aria-labelledby pointing at the title id', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    const root = container.querySelector('.ss-card')!
    const labelledby = root.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    expect(container.querySelector('.title')?.getAttribute('id')).toBe(labelledby)
  })

  // DS-0183 — aria-labelledby is not allowed on a role-less <div>.
  it('a titled card is a named region (role="region")', () => {
    const { container, getByRole } = render(CardHarness, { title: 'Stats', body: 'x' })
    expect(container.querySelector('.ss-card')).toHaveAttribute('role', 'region')
    expect(getByRole('region', { name: 'Stats' })).toBe(container.querySelector('.ss-card'))
  })

  it('omits aria-labelledby and role when there is no title', () => {
    const { container } = render(CardHarness, { body: 'x' })
    const root = container.querySelector('.ss-card')!
    expect(root.getAttribute('aria-labelledby')).toBeNull()
    expect(root.getAttribute('role')).toBeNull()
  })

  // DS-0183 — the clickable card is a stretched overlay <button>, never role="button" on the
  // root, so the heading and `action` controls are not flattened into a button.
  it('renders an overlay <button> (not a role=button root) when onclick is given', async () => {
    const onclick = vi.fn()
    const { container, getByRole } = render(CardHarness, {
      title: 'Stats',
      onclick,
      withAction: true,
      body: 'x',
    })
    const root = container.querySelector('.ss-card')!
    expect(root).toHaveAttribute('role', 'region')
    expect(root).not.toHaveAttribute('tabindex')
    expect(root.classList.contains('interactive')).toBe(true)

    const overlay = container.querySelector('button.overlay')!
    expect(overlay).toHaveAttribute('type', 'button')
    expect(getByRole('button', { name: 'Stats' })).toBe(overlay)
    // The heading stays a heading, outside any button.
    expect(getByRole('heading', { name: 'Stats' }).closest('button')).toBeNull()
    expect(container.querySelector('.card-action')!.closest('button.overlay')).toBeNull()

    await fireEvent.click(overlay)
    expect(onclick).toHaveBeenCalledTimes(1)
  })

  it('Enter/Space on a nested action control does not activate the card', async () => {
    const onclick = vi.fn()
    const { container } = render(CardHarness, {
      title: 'Stats',
      onclick,
      withAction: true,
      body: 'x',
    })
    const action = container.querySelector('.card-action')!
    await fireEvent.keyDown(action, { key: 'Enter' })
    await fireEvent.keyDown(action, { key: ' ' })
    expect(onclick).not.toHaveBeenCalled()
  })

  it('untitled clickable card falls back to "Open" as the overlay name', () => {
    const { getByRole } = render(CardHarness, { onclick: vi.fn(), body: 'x' })
    expect(getByRole('button', { name: 'Open' })).toHaveClass('overlay')
  })

  it('href wins over onclick: one overlay <a>, onclick runs as its click handler', async () => {
    const onclick = vi.fn((e: Event) => e.preventDefault())
    const { container } = render(CardHarness, { title: 'Stats', href: '/foo', onclick, body: 'x' })
    expect(container.querySelector('button.overlay')).toBeNull()
    await fireEvent.click(container.querySelector('a.overlay')!)
    expect(onclick).toHaveBeenCalledTimes(1)
  })

  it('is not interactive (no tabindex, no overlay) by default', () => {
    const { container } = render(CardHarness, { title: 'Stats', body: 'x' })
    const root = container.querySelector('.ss-card')!
    expect(root.getAttribute('role')).toBe('region')
    expect(root.getAttribute('tabindex')).toBeNull()
    expect(container.querySelector('.overlay')).toBeNull()
  })
})

describe('Card — overlay takes no layout space (DS-0183)', () => {
  it('collapses the overlay control so a <button> overlay adds no empty line under the footer', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/lib/components/Card.svelte', 'utf8')
    const rule = src.slice(
      src.indexOf('  .overlay {'),
      src.indexOf('&::after', src.indexOf('  .overlay {')),
    )
    expect(rule).toContain('display: block')
    expect(rule).toContain('block-size: 0')
  })
})
