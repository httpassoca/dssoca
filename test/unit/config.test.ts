import { describe, it, expect, beforeEach } from 'vitest'
import {
  defaultDesignConfig,
  getDesignConfig,
  designAttributes,
  applyDesignConfig,
  resolveComponentSize,
} from '$lib/config'

describe('config — defaults', () => {
  // applyDesignConfig mutates module-level `current`; reset it before each test
  // so order-independence holds (the module singleton leaks otherwise).
  beforeEach(() => {
    applyDesignConfig({ ...defaultDesignConfig }, document.documentElement)
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-size-variant')
  })

  it('defaultDesignConfig is dark + md + empty componentsSize', () => {
    expect(defaultDesignConfig).toEqual({ theme: 'dark', sizeVariant: 'md', componentsSize: {} })
  })

  it('getDesignConfig returns a copy, not the internal reference', () => {
    const a = getDesignConfig()
    const b = getDesignConfig()
    expect(a).toEqual({ theme: 'dark', sizeVariant: 'md', componentsSize: {} })
    expect(a).not.toBe(b)
    expect(a.componentsSize).not.toBe(b.componentsSize)
  })

  it('mutating a returned config does not affect the store', () => {
    const cfg = getDesignConfig()
    cfg.theme = 'light'
    cfg.componentsSize.Button = 'lg'
    expect(getDesignConfig().theme).toBe('dark')
    expect(getDesignConfig().componentsSize).toEqual({})
  })
})

describe('designAttributes', () => {
  it('returns data-theme + data-size-variant from defaults when no config given', () => {
    expect(designAttributes()).toEqual({
      'data-theme': 'dark',
      'data-size-variant': 'md',
    })
  })

  it('merges a partial config over the defaults (sizeVariant only)', () => {
    expect(designAttributes({ sizeVariant: 'sm' })).toEqual({
      'data-theme': 'dark',
      'data-size-variant': 'sm',
    })
  })

  it('merges a partial config over the defaults (theme only)', () => {
    expect(designAttributes({ theme: 'light' })).toEqual({
      'data-theme': 'light',
      'data-size-variant': 'md',
    })
  })

  it('uses defaults regardless of prior applyDesignConfig calls (does not read current)', () => {
    applyDesignConfig({ theme: 'light', sizeVariant: 'lg' }, document.documentElement)
    expect(designAttributes()).toEqual({
      'data-theme': 'dark',
      'data-size-variant': 'md',
    })
  })
})

describe('applyDesignConfig', () => {
  beforeEach(() => {
    applyDesignConfig({ ...defaultDesignConfig, componentsSize: {} }, document.documentElement)
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-size-variant')
  })

  it('updates current and returns the new resolved config', () => {
    const result = applyDesignConfig({ theme: 'light' }, document.documentElement)
    expect(result).toEqual({ theme: 'light', sizeVariant: 'md', componentsSize: {} })
    expect(getDesignConfig()).toEqual({ theme: 'light', sizeVariant: 'md', componentsSize: {} })
  })

  it('sets data-theme and data-size-variant on the given target element', () => {
    const el = document.createElement('div')
    applyDesignConfig({ theme: 'light', sizeVariant: 'sm' }, el)
    expect(el).toHaveAttribute('data-theme', 'light')
    expect(el).toHaveAttribute('data-size-variant', 'sm')
  })

  it('defaults the target to document.documentElement under jsdom', () => {
    applyDesignConfig({ theme: 'light', sizeVariant: 'lg' })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(document.documentElement).toHaveAttribute('data-size-variant', 'lg')
  })

  it('merges one axis at a time over current', () => {
    applyDesignConfig({ sizeVariant: 'sm' }, document.documentElement)
    expect(getDesignConfig()).toMatchObject({ theme: 'dark', sizeVariant: 'sm' })
    applyDesignConfig({ theme: 'light' }, document.documentElement)
    expect(getDesignConfig()).toMatchObject({ theme: 'light', sizeVariant: 'sm' })
  })

  it('merges componentsSize key-by-key across calls', () => {
    applyDesignConfig({ componentsSize: { Button: 'lg' } }, document.documentElement)
    applyDesignConfig({ componentsSize: { Badge: 'sm' } }, document.documentElement)
    expect(getDesignConfig().componentsSize).toEqual({ Button: 'lg', Badge: 'sm' })
  })

  it('returns a copy each call (not the internal reference)', () => {
    const r1 = applyDesignConfig({}, document.documentElement)
    const r2 = applyDesignConfig({}, document.documentElement)
    expect(r1).not.toBe(r2)
  })
})

describe('resolveComponentSize', () => {
  beforeEach(() => {
    applyDesignConfig({ ...defaultDesignConfig, componentsSize: {} }, document.documentElement)
  })

  it('returns the explicit prop size when given', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm' } }, document.documentElement)
    expect(resolveComponentSize('Button', 'lg')).toBe('lg')
  })

  it('falls back to componentsSize[name] when no prop', () => {
    applyDesignConfig({ componentsSize: { Button: 'sm' } }, document.documentElement)
    expect(resolveComponentSize('Button')).toBe('sm')
  })

  it('returns undefined (inherit global) when neither prop nor componentsSize set', () => {
    expect(resolveComponentSize('Card')).toBeUndefined()
  })
})
