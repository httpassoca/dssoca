import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { axe } from 'vitest-axe'
import Avatar from '$lib/components/Avatar.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('Avatar — initials', () => {
  it('derives "AL" from "Ada Lovelace"', () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace' })
    expect(container.querySelector('.ss-avatar .initials')).toHaveTextContent('AL')
  })

  it('derives "C" from a single-word name "Cher"', () => {
    const { container } = render(Avatar, { name: 'Cher' })
    expect(container.querySelector('.ss-avatar .initials')).toHaveTextContent('C')
  })

  it('uses only the first two words and uppercases them', () => {
    const { container } = render(Avatar, { name: 'grace brewster murray hopper' })
    expect(container.querySelector('.ss-avatar .initials')).toHaveTextContent('GB')
  })

  it('keeps the initials aria-hidden (root carries the name)', () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace' })
    expect(container.querySelector('.ss-avatar .initials')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Avatar — image', () => {
  it('renders an <img> with the name as alt when src is set and no alt given', () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace', src: '/a.png' })
    const img = container.querySelector<HTMLImageElement>('.ss-avatar img.img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('alt', 'Ada Lovelace')
  })

  it('uses an explicit alt over the name', () => {
    const { container } = render(Avatar, { name: 'Ada', src: '/a.png', alt: 'Portrait of Ada' })
    expect(container.querySelector('.ss-avatar img.img')).toHaveAttribute('alt', 'Portrait of Ada')
  })

  it('falls back to initials when the image errors', async () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace', src: '/broken.png' })
    const img = container.querySelector<HTMLImageElement>('.ss-avatar img.img')!
    img.dispatchEvent(new Event('error'))
    await tick()
    expect(container.querySelector('.ss-avatar img.img')).toBeNull()
    expect(container.querySelector('.ss-avatar .initials')).toHaveTextContent('AL')
  })
})

describe('Avatar — deterministic colour', () => {
  it('produces the same background for the same name across renders', () => {
    const a = render(Avatar, { name: 'Ada Lovelace' })
    const b = render(Avatar, { name: 'Ada Lovelace' })
    const colA = a.container
      .querySelector<HTMLElement>('.ss-avatar')!
      .style.getPropertyValue('--ss-avatar-bg')
    const colB = b.container
      .querySelector<HTMLElement>('.ss-avatar')!
      .style.getPropertyValue('--ss-avatar-bg')
    expect(colA).not.toBe('')
    expect(colA).toBe(colB)
  })

  it('maps to a value from the documented palette', () => {
    const { container } = render(Avatar, { name: 'Grace Hopper' })
    const col = container
      .querySelector<HTMLElement>('.ss-avatar')!
      .style.getPropertyValue('--ss-avatar-bg')
    expect([
      'var(--ss-primary)',
      'var(--ss-blue)',
      'var(--ss-purple)',
      'var(--ss-cyan)',
      'var(--ss-yellow)',
      'var(--ss-lime)',
    ]).toContain(col)
  })
})

describe('Avatar — accessibility + size', () => {
  it('exposes the name via role="img" + aria-label', () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace' })
    const root = container.querySelector('.ss-avatar')!
    expect(root).toHaveAttribute('role', 'img')
    expect(root).toHaveAttribute('aria-label', 'Ada Lovelace')
  })

  it('reflects the size variant on the root', () => {
    const { container } = render(Avatar, { name: 'Ada', size: 'lg' })
    expect(container.querySelector('.ss-avatar')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('has no axe violations (initials)', async () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (image)', async () => {
    const { container } = render(Avatar, { name: 'Ada Lovelace', src: '/a.png' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
