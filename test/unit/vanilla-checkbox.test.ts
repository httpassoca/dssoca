import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import { axe } from 'vitest-axe'
import Checkbox from '$lib/components/Checkbox.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount, setCheckbox } from '$lib/vanilla/index'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

/** Real component DOM, stripped of scoping hashes + hydration comments (as in vanilla-behaviors). */
function svelteHtml<P extends Record<string, unknown>>(Comp: Component<P>, props: P): string {
  const { container, unmount } = render(Comp, props)
  const html = container.innerHTML
  unmount()
  return html.replace(/ svelte-[a-z0-9]+/g, '').replace(/<!--[^>]*-->/g, '')
}

function setup(props: Record<string, unknown>) {
  document.body.innerHTML = svelteHtml(Checkbox, { label: 'Email me', ...props })
  mount(document.body)
  const root = document.querySelector<HTMLElement>('.ss-checkbox')!
  const input = root.querySelector<HTMLInputElement>('.input')!
  const seen: unknown[] = []
  root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
  return { root, input, seen }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vanilla — Checkbox', () => {
  it('toggles natively and emits ss:change with { checked } (no reason)', () => {
    const { input, seen } = setup({})
    input.click()
    expect(input.checked).toBe(true)
    input.click()
    expect(input.checked).toBe(false)
    expect(seen).toEqual([{ checked: true }, { checked: false }])
  })

  it('a press on the label text toggles too', () => {
    const { root, input, seen } = setup({})
    root.querySelector<HTMLElement>('.label')!.click()
    expect(input.checked).toBe(true)
    expect(seen).toEqual([{ checked: true }])
  })

  it('mount() turns data-indeterminate into the DOM property', () => {
    const { input } = setup({ indeterminate: true })
    expect(input.getAttribute('data-indeterminate')).toBe('true')
    expect(input.indeterminate).toBe(true)
  })

  it.each([false, true])(
    'an indeterminate checkbox toggles to checked (checked=%s underneath)',
    (checked) => {
      const { input, seen } = setup({ indeterminate: true })
      input.checked = checked
      input.click()
      expect(input.checked).toBe(true)
      expect(input.indeterminate).toBe(false)
      expect(input.hasAttribute('data-indeterminate')).toBe(false)
      expect(seen).toEqual([{ checked: true }])
    },
  )

  it('disabled is inert', () => {
    const { input, seen } = setup({ disabled: true })
    input.click()
    expect(input.checked).toBe(false)
    expect(seen).toEqual([])
  })

  it('setCheckbox writes a state without emitting', () => {
    const { input, seen } = setup({})
    setCheckbox(input, { checked: true, indeterminate: true })
    expect(input.checked).toBe(true)
    expect(input.indeterminate).toBe(true)
    expect(input.getAttribute('data-indeterminate')).toBe('true')
    setCheckbox(input, { indeterminate: false })
    expect(input.indeterminate).toBe(false)
    expect(input.checked).toBe(true)
    expect(seen).toEqual([])
  })

  it('has no axe violations', async () => {
    setup({ indeterminate: true })
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})
