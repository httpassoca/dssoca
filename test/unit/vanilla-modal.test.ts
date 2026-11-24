import { describe, it, expect, beforeAll, afterEach } from 'vitest'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'
import { closeModal, lockScroll, unlockScroll } from '$lib/vanilla/modal'

// DS-0178: an open vanilla modal locks page scroll on <html>, released on every close path.
const markup = `
  <button data-ss-modal="#m">open</button>
  <dialog class="ss-modal" id="m" aria-label="Confirm">
    <div class="panel"><header class="head">
      <button type="button" class="close" aria-label="Close" data-ss-dismiss>×</button>
    </header><div class="body"><p>Sure?</p></div></div>
  </dialog>`

const html = () => document.documentElement
const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)!
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

beforeAll(() => {
  if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
})

afterEach(() => {
  document.body.innerHTML = ''
  html().style.overflow = ''
  delete html().dataset.ssScrollLock
  delete html().dataset.ssScrollLockPrev
})

describe('vanilla — Modal scroll lock', () => {
  it('locks <html> on open and restores it on data-ss-dismiss', () => {
    document.body.innerHTML = markup
    mount(document.body)
    click(q('[data-ss-modal]'))
    expect(html().style.overflow).toBe('hidden')
    click(q('.close'))
    expect(html().style.overflow).toBe('')
  })

  it('releases on a native close (Escape / form method=dialog)', () => {
    document.body.innerHTML = markup
    click(q('[data-ss-modal]'))
    expect(html().style.overflow).toBe('hidden')
    q<HTMLDialogElement>('dialog').close()
    expect(html().style.overflow).toBe('')
  })

  it('releases on a backdrop pointerdown', () => {
    document.body.innerHTML = markup
    click(q('[data-ss-modal]'))
    const dialog = q<HTMLDialogElement>('dialog')
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(dialog.open).toBe(false)
    expect(html().style.overflow).toBe('')
  })

  it('ref-counts nested locks and restores the previous overflow', () => {
    html().style.overflow = 'auto'
    lockScroll()
    lockScroll()
    expect(html().style.overflow).toBe('hidden')
    unlockScroll()
    expect(html().style.overflow).toBe('hidden')
    unlockScroll()
    expect(html().style.overflow).toBe('auto')
    unlockScroll() // extra release is a no-op
    expect(html().style.overflow).toBe('auto')
  })
})

// DS-0197: the same decisions as Modal.svelte (core/modal.ts), reported on `ss:close`.
describe('vanilla — Modal close reason', () => {
  const setup = (attrs = '') => {
    document.body.innerHTML = markup.replace('id="m"', `id="m" ${attrs}`)
    click(q('[data-ss-modal]'))
    const dialog = q<HTMLDialogElement>('dialog')
    const reasons: string[] = []
    dialog.addEventListener('ss:close', (e) => {
      reasons.push((e as CustomEvent<{ reason: string }>).detail.reason)
    })
    return { dialog, reasons }
  }
  const cancel = (dialog: HTMLDialogElement) => {
    const e = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(e)
    return e
  }

  it('emits ss:close with "button" for data-ss-dismiss', () => {
    const { reasons } = setup()
    click(q('.close'))
    expect(reasons).toEqual(['button'])
  })

  it('emits "backdrop" for a backdrop pointerdown', () => {
    const { dialog, reasons } = setup()
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(reasons).toEqual(['backdrop'])
  })

  it('keeps a data-ss-static dialog open on a backdrop pointerdown', () => {
    const { dialog, reasons } = setup('data-ss-static')
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(dialog.open).toBe(true)
    expect(reasons).toEqual([])
  })

  it('ignores a pointerdown inside the panel', () => {
    const { dialog } = setup()
    q('.panel').dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(dialog.open).toBe(true)
  })

  it('emits "escape" when the native cancel precedes the close', () => {
    const { dialog, reasons } = setup()
    expect(cancel(dialog).defaultPrevented).toBe(false)
    dialog.close()
    expect(reasons).toEqual(['escape'])
  })

  it('blocks Escape on data-ss-no-esc and does not label the next close', () => {
    const { dialog, reasons } = setup('data-ss-no-esc')
    expect(cancel(dialog).defaultPrevented).toBe(true)
    dialog.close()
    expect(reasons).toEqual(['programmatic'])
  })

  it('emits "escape" when a non-cancelable cancel closes a data-ss-no-esc dialog', () => {
    // The browser's anti-trap rule: a second Escape with no interaction in between cannot be
    // prevented, and the dialog closes whatever the page asked for.
    const { dialog, reasons } = setup('data-ss-no-esc')
    dialog.dispatchEvent(new Event('cancel', { cancelable: false }))
    dialog.close()
    expect(reasons).toEqual(['escape'])
  })

  it('emits "programmatic" for a direct close() and for closeModal()', () => {
    const { dialog, reasons } = setup()
    dialog.close()
    click(q('[data-ss-modal]'))
    closeModal(dialog)
    expect(reasons).toEqual(['programmatic', 'programmatic'])
  })

  it('ss:close bubbles to the document', () => {
    const { dialog } = setup()
    let seen: unknown
    const listener = (e: Event) => (seen = (e as CustomEvent).detail)
    document.addEventListener('ss:close', listener)
    click(q('.close'))
    document.removeEventListener('ss:close', listener)
    expect(dialog.open).toBe(false)
    expect(seen).toEqual({ reason: 'button' })
  })
})
