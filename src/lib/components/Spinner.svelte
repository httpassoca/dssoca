<script module lang="ts">
  import { type SpinnerVariant as SpinnerVariantName } from '../dssoca.config.js'

  // Surfaced for backward compatibility (consumers importing from this component
  // path); the source of truth is `dssoca.config.ts` (DS-0108). The const is a
  // plain re-export; the type is aliased so it doesn't collide with the import.
  export { SPINNER_VARIANT_NAMES } from '../dssoca.config.js'
  export type SpinnerVariant = SpinnerVariantName

  // Frame data lives in `../spinner-frames.ts` (DS-0148) so the vanilla CSS generator can
  // share it without importing a .svelte file. Re-exported here for backward compatibility.
  import { SPINNER_VARIANTS, type SpinnerFrames } from '../spinner-frames.js'
  export { SPINNER_VARIANTS }
  export type { SpinnerFrames }
</script>

<script lang="ts">
  import { resolveComponentSize, resolveSpinnerVariant, type Size } from '../config.js'

  interface Props {
    /**
     * Which frame set to animate (curated from cli-spinners, MIT). When unset,
     * falls back to the configured global default (`spinnerVariant`, default
     * `boxBounce2`); an explicit value here always wins (DS-0108).
     */
    variant?: SpinnerVariantName
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Accessible name announced via role="status". */
    label?: string
    /** Render the label visibly next to the glyph (it is announced either way). */
    showLabel?: boolean
    /** Override the variant's frame interval (ms). */
    speed?: number
    /** Any remaining native attributes are forwarded to the root span. */
    [key: string]: unknown
  }
  let { variant, size, label = 'Loading', showLabel = false, speed, ...rest }: Props = $props()

  // An explicit `variant` prop wins; otherwise fall back to the configured
  // house default (`spinnerVariant`, from the manifest) — DS-0108.
  const resolvedVariant = $derived(resolveSpinnerVariant(variant))
  const spinner = $derived(SPINNER_VARIANTS[resolvedVariant])
  const interval = $derived(speed ?? spinner.interval)
  const resolvedSize = $derived(resolveComponentSize('Spinner', size))

  // Under prefers-reduced-motion the first frame renders statically — no cycling.
  const reduceMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let tickIndex = $state(0)
  // Modulo on read so a variant swap to a shorter frame set never reads past the end.
  const frame = $derived(spinner.frames[tickIndex % spinner.frames.length])

  $effect(() => {
    if (reduceMotion) return
    const count = spinner.frames.length
    const ms = interval
    const id = setInterval(() => {
      tickIndex = (tickIndex + 1) % count
    }, ms)
    return () => clearInterval(id)
  })
</script>

<span class="ss-spinner" data-size-variant={resolvedSize} role="status" {...rest}>
  <span class="frame" aria-hidden="true">{frame}</span>
  <span class="lbl" class:sr-only={!showLabel}>{label}</span>
</span>

<style lang="scss">
  .ss-spinner {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    // Accent by default; themeable via --ss-spinner-color (falls back through
    // to the accent), and the glyph itself tracks currentColor.
    color: var(--ss-spinner-color, var(--ss-primary));

    .frame {
      font-family: var(--ss-font-mono);
      // --ss-spinner-font rescales per size tier (see styles/components/_spinner.scss);
      // until the partial is wired, fall back to the shared control font.
      font-size: var(--ss-spinner-font, var(--ss-control-font));
      line-height: 1;
      // Mono glyphs are 1ch wide — reserve it so frame swaps never shift layout.
      min-width: 1ch;
      text-align: center;
      color: currentColor;
    }

    .lbl {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
      letter-spacing: 0.02em;
    }

    // Visually hidden but announced (role="status" reads the label).
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  }
</style>
