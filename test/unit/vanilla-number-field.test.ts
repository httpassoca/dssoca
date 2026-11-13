import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte'
import NumberField from '$lib/components/NumberField.svelte'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'

/** Render the real component, strip Svelte scoping/hydration and hand the static HTML over. */
function mountNumberField(props: Record<string, unknown>, value: string): HTMLElement {
  const { container, unmount } = render(NumberField, props)
  const html = container.innerHTML
    .replace(/ svelte-[a-z0-9]+/g, '')
    .replace(/<!--[^>]*-->/g, '')
    .replace('class="ss-input"', `class="ss-input" value="${value}"`)
  unmount()
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  mount(host)
  return host
}

const click = (el: HTMLElement) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

describe('vanilla NumberField steppers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('uses aria-disabled at the bounds so focus stays on the stepper', () => {
    const host = mountNumberField({ id: 'n', min: 0, max: 2, value: 1 }, '1')
    const input = host.querySelector<HTMLInputElement>('.ss-input')!
    const inc = host.querySelector<HTMLButtonElement>('.step.inc')!
    inc.focus()
    click(inc)
    expect(input.value).toBe('2')
    expect(inc.disabled).toBe(false)
    expect(inc.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(inc)
    click(inc) // at the bound: no-op
    expect(input.value).toBe('2')
    const dec = host.querySelector<HTMLButtonElement>('.step.dec')!
    click(dec)
    expect(inc.hasAttribute('aria-disabled')).toBe(false)
  })

  it('natively disables the steppers only when the input is disabled', () => {
    const host = mountNumberField({ id: 'n', disabled: true, value: 1 }, '1')
    expect(host.querySelector<HTMLButtonElement>('.step.inc')!.disabled).toBe(true)
    expect(host.querySelector('.step.inc')!.hasAttribute('aria-disabled')).toBe(false)
  })

  it('writes each nudge to the polite live region', () => {
    const host = mountNumberField({ id: 'n', value: 4 }, '4')
    const live = host.querySelector('.live')!
    expect(live.getAttribute('aria-live')).toBe('polite')
    expect(live.textContent).toBe('')
    click(host.querySelector<HTMLButtonElement>('.step.inc')!)
    expect(live.textContent).toBe('5')
  })
})
