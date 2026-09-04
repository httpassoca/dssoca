<script module lang="ts">
  // Glyph table + registry live in `../icons.ts` (DS-0148) so the vanilla build can share
  // them without importing a .svelte file. Re-exported here for backward compatibility.
  import { PATHS, registerIcon, resolveIcon, type IconName } from '../icons.js'
  export { PATHS, registerIcon, resolveIcon }
  export type { IconName }
</script>

<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  /**
   * Icon-local size scale (DS-0109). Distinct from the global `Size` axis
   * (`sm | md | lg`): Icon adds an `xs` (12px) dense step that has *no* global
   * `data-size-variant` counterpart — it pins directly via {@link SIZE_PX}. The
   * named scale is fixed at xs 12 / sm 16 / md 20 / lg 24 px.
   */
  export type IconSize = 'xs' | Size

  /** Fixed px for each named Icon size — used to keep absolute stroke optically constant. */
  const SIZE_PX: Record<IconSize, number> = { xs: 12, sm: 16, md: 20, lg: 24 }
  const DEFAULT_PX = SIZE_PX.md

  interface Props {
    name: IconName
    /**
     * Icon-local size (`xs | sm | md | lg`, a fixed px scale); inherits the
     * active `--ss-icon` token when unset. `xs` (12px) is Icon-only and has no
     * global size-variant equivalent.
     */
    size?: IconSize
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

  // Box size: an explicit `px` wins; a named `size` pins to the fixed scale
  // (incl. the Icon-only `xs` = 12px, which has no global token); when both are
  // unset the icon inherits the active `--ss-icon` token through the cascade.
  const dim = $derived(
    px != null ? `${px}px` : size != null ? `${SIZE_PX[size]}px` : 'var(--ss-icon)',
  )

  // Resolve the glyph: explicit `paths` escape hatch → registered/built-in → warn.
  const markup = $derived.by(() => {
    if (paths != null) return paths
    const found = resolveIcon(name)
    if (found != null) return found
    if (typeof console !== 'undefined') {
      console.warn(
        `[dssoca] Icon: unknown name "${name}" (no registered glyph). Rendering empty; pass \`paths\` or call registerIcon().`,
      )
    }
    return ''
  })

  // Optically-constant stroke: recompute weight from the resolved px so a
  // 2u stroke at the canonical 24-unit viewBox looks the same at 12/16/20/24px.
  const resolvedPx = $derived(px != null ? px : (SIZE_PX[size ?? 'md'] ?? DEFAULT_PX))
  const stroke = $derived(absoluteStroke ? (strokeWidth * 24) / resolvedPx : strokeWidth)

  const isSolid = $derived(variant === 'solid')

  // The global `data-size-variant` axis is sm|md|lg only; the Icon-local `xs`
  // step has no axis equivalent (it pins via `dim` above), so it is omitted.
  const axisSize = $derived<Size | undefined>(size === 'xs' ? undefined : size)

  // Decorative unless an explicit title (or explicit decorative=false) opts in.
  const isDecorative = $derived(decorative ?? title == null)

  // Unique ids for <title>/<desc>, wired through aria-labelledby.
  const uid = $props.id()
  const titleId = $derived(title ? `${uid}-t` : undefined)
  const descId = $derived(desc ? `${uid}-d` : undefined)
  const labelledBy = $derived([titleId, descId].filter(Boolean).join(' ') || undefined)
  const labelled = $derived(!isDecorative && labelledBy != null)

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
  data-size-variant={resolveComponentSize('Icon', axisSize)}
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
  .ss-icon[data-rotate='90'] {
    transform: rotate(90deg);
  }
  .ss-icon[data-rotate='180'] {
    transform: rotate(180deg);
  }
  .ss-icon[data-rotate='270'] {
    transform: rotate(270deg);
  }

  .ss-icon.flip-h {
    transform: scaleX(-1);
  }
  .ss-icon.flip-v {
    transform: scaleY(-1);
  }

  .ss-icon.spin {
    animation: ss-icon-spin var(--ss-icon-spin-dur, 900ms) linear infinite;
  }

  @keyframes ss-icon-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-icon.spin {
      animation: none;
    }
  }
</style>
