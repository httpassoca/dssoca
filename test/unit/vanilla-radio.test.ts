import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import { axe } from 'vitest-axe'
import RadioGroup from '$lib/components/RadioGroup.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount, selectRadio } from '$lib/vanilla/index'

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

const OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', disabled: true },
  { value: 'team', label: 'Team' },
]

function setup(props: Record<string, unknown> = {}) {
  document.body.innerHTML = svelteHtml(RadioGroup, {
    options: OPTIONS,
    label: 'Plan',
    name: 'plan',
    ...props,
  })
  mount(document.body)
  const root = document.querySelector<HTMLElement>('.ss-radio-group')!
  const list = Array.from(root.querySelectorAll<HTMLInputElement>('.input'))
  // `checked` is a property on the client render; plain HTML declares it with the attribute.
  list.forEach((r) => (r.checked = r.value === props.value))
  const seen: unknown[] = []
  root.addEventListener('ss:change', (e) => seen.push((e as CustomEvent).detail))
  const tabindexes = () => list.map((r) => r.getAttribute('tabindex'))
  return { root, list, seen, tabindexes }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('vanilla — RadioGroup', () => {
  it('a press selects natively, moves the tab stop and emits ss:change { value, index }', () => {
    const { list, seen, tabindexes } = setup({ value: 'free' })
    expect(tabindexes()).toEqual(['0', '-1', '-1'])
    list[2].click()
    expect(list.map((r) => r.checked)).toEqual([false, false, true])
    expect(tabindexes()).toEqual(['-1', '-1', '0'])
    expect(seen).toEqual([{ value: 'team', index: 2 }])
  })

  it('a press on the label text selects its radio', () => {
    const { root, list, seen } = setup()
    root.querySelectorAll<HTMLElement>('.label')[2].click()
    expect(list[2].checked).toBe(true)
    expect(seen).toEqual([{ value: 'team', index: 2 }])
  })

  it('pressing the selected radio again emits nothing', () => {
    const { list, seen } = setup({ value: 'free' })
    list[0].click()
    expect(seen).toEqual([])
  })

  it('disabled options and a disabled group are inert', () => {
    const one = setup({ value: 'free' })
    one.list[1].click()
    expect(one.list[1].checked).toBe(false)
    expect(one.seen).toEqual([])

    const all = setup({ value: 'free', disabled: true })
    all.list[2].click()
    selectRadio(all.list[2])
    expect(all.list.map((r) => r.checked)).toEqual([true, false, false])
    expect(all.seen).toEqual([])
  })

  it('selectRadio selects from script like a press, and is a no-op on the selection', () => {
    const { list, seen, tabindexes } = setup({ value: 'free' })
    selectRadio(list[2])
    expect(list[2].checked).toBe(true)
    expect(tabindexes()).toEqual(['-1', '-1', '0'])
    selectRadio(list[2])
    selectRadio(list[1])
    expect(list[2].checked).toBe(true)
    expect(seen).toEqual([{ value: 'team', index: 2 }])
  })

  it('has no axe violations', async () => {
    setup({ value: 'team' })
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})
