import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import TierListHarness from '../harness/TierListHarness.svelte'

// DS-0189 — `animate:flip` is a JS animation, so the reduced-motion token zeroing in CSS never
// reaches it; the component reads `prefersReducedMotion` instead. jsdom can't flip the media
// query (Svelte reads matchMedia once, at import), so the store is mocked with a toggle.
const motion = vi.hoisted(() => ({ reduce: false }))
vi.mock('svelte/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('svelte/motion')>()),
  prefersReducedMotion: {
    get current() {
      return motion.reduce
    },
  },
}))

afterEach(() => {
  motion.reduce = false
  vi.restoreAllMocks()
})

/** jsdom has no layout: give every cell a box from its live position so a reorder "moves" it. */
function fakeLayout() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const i = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0
    return {
      left: i * 110,
      right: i * 110 + 100,
      top: 0,
      bottom: 100,
      width: 100,
      height: 100,
    } as DOMRect
  })
}

async function reorder() {
  const { container } = render(TierListHarness, { placements: { S: ['alpha', 'beta'] } })
  fakeLayout()
  const animate = vi.spyOn(Element.prototype, 'animate')
  const t = container.querySelector<HTMLElement>('.tile[data-item="alpha"]')!
  t.focus()
  await fireEvent.keyDown(t, { key: ' ' })
  await fireEvent.keyDown(t, { key: 'ArrowRight' })
  await tick()
  return animate
}

describe('TierList — reduced motion (DS-0189)', () => {
  it('animates a reorder with flip by default', async () => {
    expect(await reorder()).toHaveBeenCalled()
  })

  it('skips the flip animation when the user prefers reduced motion', async () => {
    motion.reduce = true
    expect(await reorder()).not.toHaveBeenCalled()
  })
})
