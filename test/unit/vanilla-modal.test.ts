import { describe, it, expect, beforeAll, afterEach } from 'vitest'
// Importing the entry installs the delegated behaviours on this file's jsdom document.
import { mount } from '$lib/vanilla/index'
import { lockScroll, unlockScroll } from '$lib/vanilla/modal'

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
