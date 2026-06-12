import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import {
  applyDesignConfig,
  defaultDesignConfig,
  getDesignConfig,
  type ComponentsSize,
} from '$lib/config'
import Button from '$lib/components/Button.svelte'
import CascadeHarness from '../harness/CascadeHarness.svelte'

// DS-0070 — size-inheritance integration. jsdom can't compute the CSS custom
// property cascade, so these tests assert the DOM mechanism that drives it:
// which element ends up carrying [data-size-variant] for a given config, and
// therefore which value a component resolves through `el.closest(...)`.
//
// Resolution order under test (highest priority first):
//   1. explicit `size` prop            → stamped on the component root
//   2. componentsSize[Name]            → stamped on the component root
//   3. nearest ancestor attribute      → component root stays unstamped
//   4. global default (applyDesignConfig → <html data-size-variant>)

/** Reset the module-level config singleton between tests. applyDesignConfig
 *  merges componentsSize key-by-key, so clearing means overwriting the keys
 *  this file sets back to undefined (undefined → inherit). */
function resetConfig() {
  applyDesignConfig(
    {
      ...defaultDesignConfig,
      componentsSize: { Button: undefined, Badge: undefined } as ComponentsSize,
    },
    document.documentElement,
  )
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-size-variant')
}

beforeEach(resetConfig)
afterEach(resetConfig)

describe('size cascade — global default via applyDesignConfig', () => {
  it('writes the global sizeVariant onto <html>', () => {
    applyDesignConfig({ sizeVariant: 'lg' })
    expect(document.documentElement).toHaveAttribute('data-size-variant', 'lg')
    expect(getDesignConfig().sizeVariant).toBe('lg')
  })

  it('a component with no size inherits the global default through closest()', () => {
    applyDesignConfig({ sizeVariant: 'sm' })
    const { container } = render(Button, { 'aria-label': 'Save' })
    const btn = container.querySelector('.ss-btn')!
    // No own attribute → the nearest [data-size-variant] is the <html> default.
    expect(btn).not.toHaveAttribute('data-size-variant')
    expect(btn.closest('[data-size-variant]')).toBe(document.documentElement)
    expect(btn.closest('[data-size-variant]')).toHaveAttribute('data-size-variant', 'sm')
  })
})

describe('size cascade — ancestor data-size-variant attribute', () => {
  it('the nearest ancestor attribute shadows the global default', () => {
    applyDesignConfig({ sizeVariant: 'sm' }) // global says sm…
    const { getByTestId, container } = render(CascadeHarness, { ancestorSize: 'lg' })
    const btn = container.querySelector('.ss-btn')!
    expect(btn).not.toHaveAttribute('data-size-variant')
    // …but the closest carrier is the lg section, not <html>.
    expect(btn.closest('[data-size-variant]')).toBe(getByTestId('ancestor'))
    expect(btn.closest('[data-size-variant]')).toHaveAttribute('data-size-variant', 'lg')
  })
})

describe('size cascade — componentsSize per-component default', () => {
  it('stamps componentsSize[Name] on the component root, overriding the ancestor', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm' } })
    const { container } = render(CascadeHarness, { ancestorSize: 'lg' })
    const btn = container.querySelector('.ss-btn')!
    expect(btn).toHaveAttribute('data-size-variant', 'sm')
  })

  it('mixed componentsSize: unlisted siblings keep inheriting the ancestor', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm' } })
    const { getByTestId, container } = render(CascadeHarness, { ancestorSize: 'lg' })
    // Button is listed → own sm root.
    expect(container.querySelector('.ss-btn')).toHaveAttribute('data-size-variant', 'sm')
    // Badge is not listed → no own attribute, resolves to the lg ancestor.
    const badge = container.querySelector('.ss-badge')!
    expect(badge).not.toHaveAttribute('data-size-variant')
    expect(badge.closest('[data-size-variant]')).toBe(getByTestId('ancestor'))
  })

  it('merges componentsSize key-by-key across applyDesignConfig calls', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm' } })
    applyDesignConfig({ componentsSize: { Badge: 'lg' } })
    expect(getDesignConfig().componentsSize).toMatchObject({ Button: 'sm', Badge: 'lg' })
    const { container } = render(CascadeHarness, {})
    expect(container.querySelector('.ss-btn')).toHaveAttribute('data-size-variant', 'sm')
    expect(container.querySelector('.ss-badge')).toHaveAttribute('data-size-variant', 'lg')
  })
})

describe('size cascade — explicit size prop wins over everything', () => {
  it('beats componentsSize and the ancestor attribute', () => {
    applyDesignConfig({ sizeVariant: 'md', componentsSize: { Button: 'sm' } })
    const { container } = render(CascadeHarness, { ancestorSize: 'md', buttonSize: 'lg' })
    expect(container.querySelector('.ss-btn')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('per-instance props stay independent within the same tree', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm', Badge: 'sm' } })
    const { container } = render(CascadeHarness, {
      ancestorSize: 'md',
      buttonSize: 'lg',
      badgeSize: 'md',
    })
    expect(container.querySelector('.ss-btn')).toHaveAttribute('data-size-variant', 'lg')
    expect(container.querySelector('.ss-badge')).toHaveAttribute('data-size-variant', 'md')
  })
})
