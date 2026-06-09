<script module lang="ts">
  /** One responsive source for an {@link Image} `<picture>`. */
  export interface ImageSource {
    srcset: string
    /** e.g. '(max-width: 600px)' or a type like 'image/webp'. */
    media?: string
    type?: string
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0055 (Image component).
  // Implement: responsive <picture>/srcset, aspect-ratio box (no layout shift),
  // loading="lazy" + decoding="async", token-driven loading skeleton + error
  // fallback (reduced-motion safe), optional lightbox (role=dialog, focus trap,
  // Esc). Decide PhotoSwipe-dep vs lightweight built-in (prefer built-in).
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Image URL. */
    src: string
    /** Required alternative text. */
    alt: string
    /** Optional responsive <picture> sources. */
    sources?: ImageSource[]
    /** Aspect ratio (w/h) used to reserve space before load. */
    ratio?: number
    /** Open a lightbox overlay on click. */
    lightbox?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let { src, alt, sources = [], ratio, lightbox = false, size }: Props = $props()
</script>

<figure class="ss-image" data-size-variant={resolveComponentSize('Image', size)}>
  <picture>
    {#each sources as s}
      <source srcset={s.srcset} media={s.media} type={s.type} />
    {/each}
    <img {src} {alt} loading="lazy" decoding="async" />
  </picture>
</figure>

<style lang="scss">
  // TODO(DS-0055): aspect-ratio box, skeleton, lightbox.
  .ss-image { margin: 0; }
  img { display: block; max-width: 100%; height: auto; }
</style>
