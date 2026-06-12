import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createRawSnippet, type Component } from 'svelte'
import { render } from '@testing-library/svelte'
import { applyDesignConfig, defaultDesignConfig, getDesignConfig } from '$lib/config'

import Button from '$lib/components/Button.svelte'
import Badge from '$lib/components/Badge.svelte'
import Input from '$lib/components/Input.svelte'
import Sidebar from '$lib/components/Sidebar.svelte'
import Icon from '$lib/components/Icon.svelte'

// DS-0070 — theme application. jsdom cannot compute the CSS custom-property
// colors a [data-theme] flip produces, so these tests pin the *mechanism*:
// applyDesignConfig writes data-theme on <html>, getDesignConfig round-trips
// it, and components render under either theme without claiming their own
// data-theme (color must cascade from the ancestor, never be stamped locally).

const text = createRawSnippet(() => ({ render: () => '<span>content</span>' }))

interface ThemeCase {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Component<any>
  props: Record<string, unknown>
  selector: string
}

const CASES: ThemeCase[] = [
  { name: 'Button', component: Button, props: { children: text }, selector: '.ss-btn' },
  { name: 'Badge', component: Badge, props: { children: text }, selector: '.ss-badge' },
  { name: 'Input', component: Input, props: { label: 'Email' }, selector: '.ss-field' },
  { name: 'Sidebar', component: Sidebar, props: {}, selector: '.ss-side' },
  { name: 'Icon', component: Icon, props: { name: 'grid' }, selector: '.ss-icon' },
]

function resetConfig() {
  applyDesignConfig({ ...defaultDesignConfig }, document.documentElement)
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-size-variant')
}

beforeEach(resetConfig)
afterEach(resetConfig)

describe('theme application — applyDesignConfig round-trip (DS-0070)', () => {
  it.each(['light', 'dark'] as const)(
    'applyDesignConfig({ theme: %j }) stamps <html> and round-trips',
    (theme) => {
      const returned = applyDesignConfig({ theme })
      expect(document.documentElement).toHaveAttribute('data-theme', theme)
      expect(returned.theme).toBe(theme)
      expect(getDesignConfig().theme).toBe(theme)
    },
  )

  it('flipping light → dark updates the attribute in place', () => {
    applyDesignConfig({ theme: 'light' })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    applyDesignConfig({ theme: 'dark' })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(getDesignConfig().theme).toBe('dark')
  })

  it('flipping theme leaves the size axis untouched (orthogonal axes)', () => {
    applyDesignConfig({ sizeVariant: 'lg' })
    applyDesignConfig({ theme: 'light' })
    expect(document.documentElement).toHaveAttribute('data-size-variant', 'lg')
    expect(getDesignConfig()).toMatchObject({ theme: 'light', sizeVariant: 'lg' })
  })

  describe.each(['light', 'dark'] as const)('components rendered under theme=%s', (theme) => {
    it.each(CASES)(
      '$name renders inside the themed root without stamping its own data-theme',
      ({ component, props, selector }) => {
        applyDesignConfig({ theme })
        const { container } = render(component, { ...props })
        const root = container.querySelector(selector)!
        expect(root).not.toBeNull()
        // The component must inherit color via the cascade, not carry the axis itself…
        expect(root).not.toHaveAttribute('data-theme')
        expect(container.querySelector('[data-theme]')).toBeNull()
        // …and the nearest theme carrier above it is the configured <html>.
        expect(root.closest('[data-theme]')).toBe(document.documentElement)
        expect(root.closest('[data-theme]')).toHaveAttribute('data-theme', theme)
      },
    )
  })
})
