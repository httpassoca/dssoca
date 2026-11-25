/**
 * Image core (DS-0197) — the load state, whether the lightbox may open, and what a key inside
 * the lightbox does (Escape, and the Tab focus trap). Pure functions; Image.svelte holds the
 * state, reads the focusable elements from the DOM and applies the result. No DOM, no Svelte.
 */

export type ImageLoadState = 'loading' | 'loaded' | 'error'

/** The load state after the `<img>` fired `load` or `error`. */
export function imageLoadResult(event: 'load' | 'error'): ImageLoadState {
  return event === 'load' ? 'loaded' : 'error'
}

/**
 * The aspect ratio (w / h) reserved before load. An explicit positive `ratio` wins, else it is
 * derived from `width` / `height` when both exist. `null` = reserve no box.
 */
export function imageAspect(input: {
  ratio?: number
  width?: number
  height?: number
}): number | null {
  const { ratio, width, height } = input
  if (ratio && ratio > 0) return ratio
  return width && height && height > 0 ? width / height : null
}

/** The lightbox trigger exists only when the lightbox is on and the image did not fail. */
export function imageCanOpen(lightbox: boolean, loadState: ImageLoadState): boolean {
  return lightbox && loadState !== 'error'
}

export interface ImageDialogKeyInput {
  key: string
  shiftKey: boolean
  /** How many elements inside the dialog can take Tab focus. */
  focusableCount: number
  /** Index of the focused element among them; `-1` when focus is elsewhere (the dialog itself). */
  activeIndex: number
}

export type ImageDialogAction = { type: 'close' } | { type: 'focus'; index: number }

/** A key the lightbox handles: its action, and what must be done to the event. */
export interface ImageDialogKeyResult {
  action: ImageDialogAction
  preventDefault: boolean
  /** Keep the key from reaching an enclosing surface (Escape closes only the lightbox). */
  stopPropagation: boolean
}

/**
 * A key inside the lightbox. Escape closes it. Tab is trapped: forward from the last focusable
 * wraps to the first, Shift+Tab from the first wraps to the last. `null` = let the key through
 * (any other key, a Tab that stays inside, or nothing to trap).
 */
export function imageDialogKey(input: ImageDialogKeyInput): ImageDialogKeyResult | null {
  if (input.key === 'Escape') {
    return { action: { type: 'close' }, preventDefault: true, stopPropagation: true }
  }
  if (input.key !== 'Tab' || input.focusableCount === 0) return null
  const last = input.focusableCount - 1
  const wrap = (index: number): ImageDialogKeyResult => ({
    action: { type: 'focus', index },
    preventDefault: true,
    stopPropagation: false,
  })
  if (input.shiftKey && input.activeIndex === 0) return wrap(last)
  if (!input.shiftKey && input.activeIndex === last) return wrap(0)
  return null
}

const bool = (value: boolean): 'true' | 'false' => (value ? 'true' : 'false')

export function imageFrameAttrs(loadState: ImageLoadState) {
  return { 'aria-busy': bool(loadState === 'loading') } as const
}

export function imageTriggerAttrs(alt: string) {
  return {
    'aria-haspopup': 'dialog',
    'aria-label': alt ? `View image: ${alt}` : 'View image full size',
  } as const
}

export function imageDialogAttrs(alt: string) {
  return {
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': alt ? `Image: ${alt}` : 'Image preview',
    tabindex: -1,
  } as const
}
