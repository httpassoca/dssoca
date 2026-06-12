<script module lang="ts">
  /** Curated glyph set. `target`'s centre dot is a filled circle in the *outline*
   *  variant — handled by the `variant` switch in markup, not a per-glyph fill hack. */
  const BUILTIN_PATHS = {
    grid:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    database: '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 4v5"/>',
    logs:     '<path d="M4 6h16M4 12h16M4 18h10"/>',
    terminal: '<rect x="3" y="5" width="18" height="14"/><path d="M3 9h18M7 14h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
    arrow:    '<path d="M5 12h14M13 5l7 7-7 7"/>',
    external: '<path d="M7 17L17 7M9 7h8v8"/>',
    film:     '<rect x="3" y="4" width="18" height="16"/><path d="M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>',
    note:     '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h6"/>',
    book:     '<path d="M6 4h11a1 1 0 011 1v15H7a1 1 0 01-1-1z"/><path d="M17 20a2 2 0 002-2V6a2 2 0 00-2-2"/><path d="M9 8h5"/>',
    check:    '<path d="M5 12l4 4L19 6"/>',
    cup:      '<path d="M4 8h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4z"/><path d="M16 10h2a2 2 0 010 4h-2M6 4v2M10 4v2M14 4v2"/>',
    wallet:   '<rect x="3" y="6" width="18" height="14"/><path d="M3 10h18M17 14h2"/>',
    target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" class="ss-icon-dot"/>',
    spinner:  '<path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round"/>',
    home:     '<path d="M4 11l8-8 8 8"/><path d="M6 9v12h12V9"/><path d="M10 21v-6h4v6"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13"/><path d="M9 7V4h6v3M3 12h18"/>',
    folder:   '<path d="M3 5h7l2 3h9v13H3z"/><path d="M3 8h9"/>',
    github:   '<path d="M7 3h10l2 2v6l-2 3h-4l1 2v5h-4v-5l1-2H7l-2-3V5l2-2z"/><path d="M9 8h1M14 8h1"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18"/><path d="M8 16v-5M8 8v.01M12 16v-5h2l2 2v3"/>',
    language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3L8 12l4 9M12 3l4 9-4 9"/>',
    'color-swatch': '<rect x="3" y="3" width="8" height="18"/><path d="M7 17v.01"/><path d="M11 19l8-8 2 2-8 8"/><path d="M13 21h8"/>',
  } as const

  export type IconName = keyof typeof BUILTIN_PATHS

  /**
   * The curated built-in glyphs plus any runtime-registered ones.
   * (`PATHS` is kept as the public name for backward compatibility.)
   */
  export const PATHS: Record<string, string> = { ...BUILTIN_PATHS }

  /**
   * Register (or override) a glyph at runtime so `<Icon name="foo" />` resolves
   * raw SVG inner markup that isn't part of the curated {@link IconName} union.
   * The markup is rendered verbatim inside the icon's `<svg viewBox="0 0 24 24">`.
   *
   *   registerIcon('heart', '<path d="M12 21 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7z"/>')
   *   <Icon name={'heart' as IconName} />
   */
  export function registerIcon(name: string, paths: string): void {
    PATHS[name] = paths
  }

  /** Look a glyph up; built-ins first, then runtime registrations. */
  export function resolveIcon(name: string): string | undefined {
    return PATHS[name]
  }
</script>

<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  /** Resolved px for each token size — used to keep absolute stroke optically constant. */
  const SIZE_PX: Record<Size, number> = { sm: 14, md: 16, lg: 20 }
  const DEFAULT_PX = SIZE_PX.md

  interface Props {
    name: IconName
    /** Token-driven size (sm|md|lg); inherits the active size when unset. */
    size?: Size
    /** Explicit pixel size — overrides the token sizing. */
    px?: number
    /**
     * Raw SVG inner markup escape hatch — rendered when `name` is not a known
     * (built-in or runtime-registered) glyph. Lets callers pass one-off icons
     * without registering them globally.
     */
    paths?: string
    /** Accessible name; rendered as a real <title> and wired via aria-labelledby. */
    title?: string
    /** Extended description, rendered as <desc> and appended to aria-labelledby. */
    desc?: string
    /**
     * Mark the icon purely decorative (aria-hidden, no a11y name). Defaults to
     * true when no `title` is given, false when a `title` is present.
     */
    decorative?: boolean
    /** Spin the glyph (e.g. a loader). Honours prefers-reduced-motion. */
    spin?: boolean
    /** Quarter-turn rotation. */
    rotate?: 0 | 90 | 180 | 270
    /** Mirror the glyph. */
    flip?: 'horizontal' | 'vertical'
    /** outline (stroked, default) | solid (filled with currentColor). */
    variant?: 'outline' | 'solid'
    /** Stroke weight in viewBox units (default 2). */
    strokeWidth?: number
    /** Keep `strokeWidth` optically constant across sizes (recompute from resolved px). */
    absoluteStroke?: boolean
    class?: string
  }
  let {
    name,
    size,
    px,
    paths,
    title,
    desc,
    decorative,
    spin = false,
    rotate = 0,
    flip,
    variant = 'outline',
    strokeWidth = 2,
    absoluteStroke = false,
    class: cls = '',
  }: Props = $props()

  const dim = $derived(px != null ? `${px}px` : 'var(--ss-icon)')

  // Resolve the glyph: explicit `paths` escape hatch → registered/built-in → warn.
  const markup = $derived.by(() => {
    if (paths != null) return paths
    const found = resolveIcon(name)
    if (found != null) return found
    if (typeof console !== 'undefined') {
      console.warn(`[dssoca] Icon: unknown name "${name}" (no registered glyph). Rendering empty; pass \`paths\` or call registerIcon().`)
    }
    return ''
  })

  // Optically-constant stroke: recompute weight from the resolved px so a
  // 2u stroke at the canonical 24-unit viewBox looks the same at 14/16/20px.
  const resolvedPx = $derived(px != null ? px : SIZE_PX[size ?? 'md'] ?? DEFAULT_PX)
  const stroke = $derived(
    absoluteStroke ? (strokeWidth * 24) / resolvedPx : strokeWidth,
  )

  const isSolid = $derived(variant === 'solid')

  // Decorative unless an explicit title (or explicit decorative=false) opts in.
  const isDecorative = $derived(decorative ?? title == null)

  // Unique ids for <title>/<desc>, wired through aria-labelledby.
  const uid = $props.id()
  const titleId = $derived(title ? `${uid}-t` : undefined)
  const descId = $derived(desc ? `${uid}-d` : undefined)
  const labelledBy = $derived(
    [titleId, descId].filter(Boolean).join(' ') || undefined,
  )
  const labelled = $derived(!isDecorative && labelledBy != null)

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // <title>/<desc> are folded into the same @html string as the glyph so the
  // SVG carries no Svelte {#if} comment anchors (keeps innerHTML clean for AT
  // and tests). a11y ids still resolve via aria-labelledby above.
  const inner = $derived(
    (title ? `<title id="${titleId}">${esc(title)}</title>` : '') +
      (desc ? `<desc id="${descId}">${esc(desc)}</desc>` : '') +
      markup,
  )
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svg
  viewBox="0 0 24 24"
  fill={isSolid ? 'currentColor' : 'none'}
  stroke={isSolid ? 'none' : 'currentColor'}
  stroke-width={stroke}
  stroke-linecap="square"
  stroke-linejoin="miter"
  class="ss-icon {cls}"
  class:spin
  class:flip-h={flip === 'horizontal'}
  class:flip-v={flip === 'vertical'}
  data-size-variant={resolveComponentSize('Icon', size)}
  data-rotate={rotate || undefined}
  style="width:{dim};height:{dim}"
  role={labelled ? 'img' : undefined}
  aria-labelledby={labelled ? labelledBy : undefined}
  aria-hidden={isDecorative ? 'true' : undefined}
  focusable="false"
>
  {@html inner}
</svg>

<style lang="scss">
  .ss-icon {
    display: inline-block;
    flex: none;
    transform-origin: center;

    // The `target` centre dot is filled even in the outline variant.
    :global(.ss-icon-dot) {
      fill: currentColor;
      stroke: none;
    }
  }

  // Quarter-turn rotation (composes with flip via the same transform stack
  // would conflict — keep rotate on its own selector; flip wins when both set
  // since flip selectors come later, matching a single-transform contract).
  .ss-icon[data-rotate='90']  { transform: rotate(90deg); }
  .ss-icon[data-rotate='180'] { transform: rotate(180deg); }
  .ss-icon[data-rotate='270'] { transform: rotate(270deg); }

  .ss-icon.flip-h { transform: scaleX(-1); }
  .ss-icon.flip-v { transform: scaleY(-1); }

  .ss-icon.spin {
    animation: ss-icon-spin var(--ss-icon-spin-dur, 900ms) linear infinite;
  }

  @keyframes ss-icon-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-icon.spin { animation: none; }
  }
</style>
