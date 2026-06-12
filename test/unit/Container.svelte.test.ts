import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import Container from '$lib/components/Container.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const content = (s: string) => createRawSnippet(() => ({ render: () => `<p>${s}</p>` }))

describe('Container', () => {
  it('renders its children inside a .ss-container', () => {
    const { container } = render(Container, { children: content('page body') })
    const root = container.querySelector('.ss-container')
    expect(root).not.toBeNull()
    expect(root).toHaveTextContent('page body')
  })

  it('renders an empty wrapper when no children given', () => {
    const { container } = render(Container, {})
    const root = container.querySelector('.ss-container')!
    expect(root).not.toBeNull()
    expect(root.textContent?.trim()).toBe('')
  })

  describe('page mode', () => {
    it('is a plain content wrapper by default (no page class)', () => {
      const { container } = render(Container, { children: content('x') })
      expect(container.querySelector('.ss-container')).not.toHaveClass('page')
    })

    it('applies the page class when page=true', () => {
      const { container } = render(Container, { page: true, children: content('x') })
      expect(container.querySelector('.ss-container')).toHaveClass('page')
    })
  })

  describe('size', () => {
    it('inherits the global size by default (no data-size-variant)', () => {
      const { container } = render(Container, { children: content('x') })
      expect(container.querySelector('.ss-container')).not.toHaveAttribute('data-size-variant')
    })

    it.each(['sm', 'md', 'lg'] as const)(
      'applies the %s size prop as data-size-variant',
      (size) => {
        const { container } = render(Container, { size, children: content('x') })
        expect(container.querySelector('.ss-container')).toHaveAttribute('data-size-variant', size)
      },
    )
  })

  describe('a11y (axe)', () => {
    it('default container has no violations', async () => {
      const { container } = render(Container, { children: content('page body') })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('page-mode container has no violations', async () => {
      const { container } = render(Container, { page: true, children: content('page body') })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
