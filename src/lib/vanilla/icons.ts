/**
 * Icons (DS-0148) — renders the exact `<svg class="ss-icon">` Icon.svelte produces from the
 * shared glyph table, and hydrates placeholders:
 *
 *   <span data-ss-icon="chevron" data-size="sm" class="ic"></span>
 *
 * Supported data attributes mirror the component props: `data-size` (xs|sm|md|lg), `data-px`,
 * `data-variant="solid"`, `data-spin`, `data-rotate` (90|180|270), `data-flip`
 * (horizontal|vertical), `data-title` (+ `data-desc`) for a labelled, non-decorative icon.
 * Extra classes on the placeholder are carried over.
 */
import { resolveIcon } from '../icons.js'
import { all } from './delegate.js'

export type IconSizeName = 'xs' | 'sm' | 'md' | 'lg'

const SIZE_PX: Record<IconSizeName, number> = { xs: 12, sm: 16, md: 20, lg: 24 }

export interface IconOptions {
  size?: IconSizeName
  px?: number
  variant?: 'outline' | 'solid'
  spin?: boolean
  rotate?: 0 | 90 | 180 | 270
  flip?: 'horizontal' | 'vertical'
  title?: string
  desc?: string
  strokeWidth?: number
  class?: string
}

let seq = 0
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attr = (s: string) => esc(s).replace(/"/g, '&quot;')

/** Markup for one icon — byte-compatible with Icon.svelte's rendered `<svg>`. */
export function iconSvg(name: string, o: IconOptions = {}): string {
  const paths = resolveIcon(name)
  if (paths == null && typeof console !== 'undefined') {
    console.warn(`[dssoca] icon: unknown name "${name}" (no registered glyph). Rendering empty.`)
  }
  const dim =
    o.px != null ? `${o.px}px` : o.size != null ? `${SIZE_PX[o.size]}px` : 'var(--ss-icon)'
  const solid = o.variant === 'solid'
  const classes = [
    'ss-icon',
    o.class,
    o.spin && 'spin',
    o.flip === 'horizontal' && 'flip-h',
    o.flip === 'vertical' && 'flip-v',
  ]
    .filter(Boolean)
    .join(' ')
  const axis = o.size && o.size !== 'xs' ? ` data-size-variant="${o.size}"` : ''
  const rotate = o.rotate ? ` data-rotate="${o.rotate}"` : ''
  const uid = o.title ? `ss-ic-${++seq}` : ''
  const titleId = o.title ? `${uid}-t` : ''
  const descId = o.desc && o.title ? `${uid}-d` : ''
  const labelledBy = [titleId, descId].filter(Boolean).join(' ')
  const a11y = o.title ? ` role="img" aria-labelledby="${labelledBy}"` : ' aria-hidden="true"'
  const inner =
    (o.title ? `<title id="${titleId}">${esc(o.title)}</title>` : '') +
    (descId ? `<desc id="${descId}">${esc(o.desc as string)}</desc>` : '') +
    (paths ?? '')
  return (
    `<svg viewBox="0 0 24 24" fill="${solid ? 'currentColor' : 'none'}" stroke="${solid ? 'none' : 'currentColor'}"` +
    ` stroke-width="${o.strokeWidth ?? 2}" stroke-linecap="square" stroke-linejoin="miter"` +
    ` class="${attr(classes)}"${axis}${rotate} style="width:${dim};height:${dim}"${a11y} focusable="false">` +
    `${inner}</svg>`
  )
}

function optionsFrom(el: HTMLElement): IconOptions {
  const d = el.dataset
  const rotate = d.rotate ? Number(d.rotate) : 0
  return {
    size: (d.size as IconSizeName | undefined) ?? undefined,
    px: d.px ? Number(d.px) : undefined,
    variant: d.variant === 'solid' ? 'solid' : undefined,
    spin: 'spin' in d,
    rotate: rotate === 90 || rotate === 180 || rotate === 270 ? rotate : 0,
    flip: d.flip === 'horizontal' || d.flip === 'vertical' ? d.flip : undefined,
    title: d.title,
    desc: d.desc,
    strokeWidth: d.strokeWidth ? Number(d.strokeWidth) : undefined,
    class: el.className || undefined,
  }
}

/** Replace every `[data-ss-icon]` placeholder under `root` with the rendered SVG. */
export function hydrateIcons(root: ParentNode = document): void {
  for (const el of all(root, '[data-ss-icon]')) {
    const name = el.getAttribute('data-ss-icon')
    if (!name) continue
    const tpl = document.createElement('template')
    tpl.innerHTML = iconSvg(name, optionsFrom(el))
    const svg = tpl.content.firstElementChild
    if (svg) el.replaceWith(svg)
  }
}
