<script module lang="ts">
  /** One responsive source for an {@link Image} `<picture>`. */
  export interface ImageSource {
    srcset: string
    /** e.g. '(max-width: 600px)' or a type like 'image/webp'. */
    media?: string
    type?: string
    /** Per-source `sizes` hint for the browser's resource selection. */
    sizes?: string
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Image (DS-0055). Responsive <picture>/srcset, aspect-ratio box (no layout
  // shift), lazy + async decode, token-driven loading skeleton + error
  // fallback (reduced-motion safe), optional LIGHTWEIGHT built-in lightbox
  // (role=dialog, aria-modal, focus trap, Esc to close, restores focus).
  //
  // DECISION: ship a built-in dialog overlay rather than depending on
  // PhotoSwipe — dssoca stays zero-runtime-dependency (see PR/doc).
  // ─────────────────────────────────────────────────────────────────────────
  import { tick } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Image URL. */
    src: string
    /** Required alternative text (WCAG 1.1.1). Pass `''` only for purely decorative images. */
    alt: string
    /** Responsive `srcset` for the default `<img>` (used alongside `sources`). */
    srcset?: string
    /** `sizes` hint paired with `srcset`. */
    sizes?: string
    /** Responsive `<picture>` sources; rendered before the fallback `<img>`. */
    sources?: ImageSource[]
    /** Intrinsic width (px) — feeds the aspect-ratio box and the `<img>` attr. */
    width?: number
    /** Intrinsic height (px) — feeds the aspect-ratio box and the `<img>` attr. */
    height?: number
    /**
     * Aspect ratio (w / h) used to reserve space before load. Wins over
     * `width`/`height` when set; otherwise derived from them when both exist.
     */
    ratio?: number
    /**
     * How the image fills the reserved box once a ratio is known.
     * @default 'cover'
     */
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    /** Eager-load (above-the-fold) — flips `loading`/`decoding`/`fetchpriority`. @default false */
    eager?: boolean
    /** Open a lightweight built-in lightbox overlay on click. @default false */
    lightbox?: boolean
    /** Caption rendered under the image inside a `<figcaption>`. */
    caption?: string
    /** Token size (sm|md|lg); inherits the global size when unset. Affects chrome, not image dims. */
    size?: Size
    /** Extra class on the root `<figure>`. */
    class?: string
  }

  let {
    src,
    alt,
    srcset,
    sizes,
    sources = [],
    width,
    height,
    ratio,
    fit = 'cover',
    eager = false,
    lightbox = false,
    caption,
    size,
    class: className,
  }: Props = $props()

  // Reserve space before load → no layout shift (CLS). Prefer an explicit
  // ratio, else derive from intrinsic width/height. `null` → no box reserved.
  const aspect = $derived(
    ratio && ratio > 0
      ? ratio
      : width && height && height > 0
        ? width / height
        : null,
  )

  type State = 'loading' | 'loaded' | 'error'
  let state = $state<State>('loading')

  function onLoad() {
    state = 'loaded'
  }
  function onError() {
    state = 'error'
  }

  // ── Lightbox ───────────────────────────────────────────────────────────
  let open = $state(false)
  let trigger = $state<HTMLButtonElement | null>(null)
  let dialog = $state<HTMLDivElement | null>(null)
  let closeBtn = $state<HTMLButtonElement | null>(null)

  const canOpen = $derived(lightbox && state !== 'error')

  async function openLightbox() {
    if (!canOpen) return
    open = true
    await tick()
    closeBtn?.focus()
  }

  function closeLightbox() {
    open = false
    // Restore focus to the trigger (WCAG 2.4.3).
    trigger?.focus()
  }

  // Focus trap + Esc, scoped to the dialog (keeps Tab inside the overlay).
  function onDialogKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      closeLightbox()
      return
    }
    if (e.key !== 'Tab' || !dialog) return
    const focusables = dialog.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
</script>

<figure
  class="ss-image {className ?? ''}"
  class:is-loading={state === 'loading'}
  class:is-error={state === 'error'}
  class:has-ratio={aspect != null}
  data-size-variant={resolveComponentSize('Image', size)}
>
  <div
    class="frame"
    style:aspect-ratio={aspect != null ? `${aspect}` : undefined}
    aria-busy={state === 'loading'}
  >
    {#if state === 'error'}
      <div class="fallback" role="img" aria-label={alt || 'Image failed to load'}>
        <span class="glyph" aria-hidden="true">⊘</span>
      </div>
    {:else}
      {#if state === 'loading'}
        <div class="skeleton" aria-hidden="true"></div>
      {/if}
      {#if canOpen}
        <button
          bind:this={trigger}
          type="button"
          class="trigger"
          aria-haspopup="dialog"
          aria-label={alt ? `View image: ${alt}` : 'View image full size'}
          onclick={openLightbox}
        >
          {@render media()}
        </button>
      {:else}
        {@render media()}
      {/if}
    {/if}
  </div>
  {#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

{#snippet media()}
  <picture>
    {#each sources as s (s.srcset)}
      <source srcset={s.srcset} media={s.media} type={s.type} sizes={s.sizes} />
    {/each}
    <img
      {src}
      {alt}
      {srcset}
      {sizes}
      {width}
      {height}
      class="img"
      style:object-fit={aspect != null ? fit : undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'auto' : 'async'}
      fetchpriority={eager ? 'high' : undefined}
      onload={onLoad}
      onerror={onError}
    />
  </picture>
{/snippet}

{#if open}
  <!-- Built-in lightbox: dialog semantics + focus trap; backdrop click closes. -->
  <div
    bind:this={dialog}
    class="ss-image-lightbox"
    data-size-variant={resolveComponentSize('Image', size)}
    role="dialog"
    aria-modal="true"
    aria-label={alt ? `Image: ${alt}` : 'Image preview'}
    tabindex="-1"
    onkeydown={onDialogKeydown}
  >
    <button
      type="button"
      class="backdrop"
      tabindex="-1"
      aria-hidden="true"
      onclick={closeLightbox}
    ></button>
    <div class="dialog-body">
      <button
        bind:this={closeBtn}
        type="button"
        class="close"
        aria-label="Close image preview"
        onclick={closeLightbox}>×</button
      >
      <picture>
        {#each sources as s (s.srcset)}
          <source srcset={s.srcset} media={s.media} type={s.type} sizes={s.sizes} />
        {/each}
        <img {src} {alt} {srcset} {sizes} class="full" decoding="async" />
      </picture>
      {#if caption}<p class="lightbox-caption">{caption}</p>{/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .ss-image {
    margin: 0;
    display: block;
    max-width: 100%;
  }

  .frame {
    position: relative;
    display: block;
    width: 100%;
    overflow: hidden;
    background: var(--ss-image-frame-bg);
  }

  // Without a known ratio we can't reserve space; let the image flow naturally.
  .ss-image:not(.has-ratio) .frame {
    background: none;
  }

  .img {
    display: block;
    width: 100%;
    height: auto;
  }
  // When a ratio reserves space, the image must fill it (object-fit set inline).
  .has-ratio .img {
    height: 100%;
  }

  // The clickable lightbox trigger is a transparent, full-bleed button wrapper.
  .trigger {
    appearance: none;
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    color: inherit;
    font: inherit;

    &:focus-visible {
      outline: var(--ss-image-focus-w) solid var(--ss-primary);
      outline-offset: calc(-1 * var(--ss-image-focus-w));
    }
  }

  // ── Skeleton (token-driven, reduced-motion safe) ────────────────────────
  .skeleton {
    position: absolute;
    inset: 0;
    background: var(--ss-skeleton);
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      var(--ss-image-shimmer) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    background-repeat: no-repeat;
    animation: ss-image-shimmer var(--ss-image-shimmer-dur) ease-in-out infinite;
  }

  @keyframes ss-image-shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
      background-image: none; // static neutral wash, no movement
    }
  }

  // ── Error fallback ───────────────────────────────────────────────────────
  .fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ss-image-frame-bg);
    color: var(--ss-fg-faint);
    border: 1px solid var(--ss-line);
  }
  // No reserved box → give the fallback an intrinsic min height so it's visible.
  .ss-image:not(.has-ratio) .fallback {
    position: static;
    min-height: var(--ss-image-fallback-min);
  }
  .fallback .glyph {
    font-size: var(--ss-image-glyph);
    line-height: 1;
  }

  figcaption {
    margin-top: var(--ss-image-caption-gap);
    color: var(--ss-fg-muted);
    font-size: var(--ss-ui-sm);
    line-height: var(--ss-leading, 1.5);
  }

  // ── Lightbox overlay ──────────────────────────────────────────────────────
  .ss-image-lightbox {
    position: fixed;
    inset: 0;
    z-index: var(--ss-image-lightbox-z);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ss-image-lightbox-pad);

    .backdrop {
      position: absolute;
      inset: 0;
      appearance: none;
      border: 0;
      margin: 0;
      padding: 0;
      cursor: zoom-out;
      background: var(--ss-image-backdrop);
      animation: ss-image-fade var(--ss-dur-fast) var(--ss-ease);
    }

    .dialog-body {
      position: relative;
      z-index: 1;
      max-width: min(92vw, 1400px);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ss-s-2);
      animation: ss-image-fade var(--ss-dur-fast) var(--ss-ease);
    }

    .full {
      display: block;
      max-width: 100%;
      max-height: 82vh;
      width: auto;
      height: auto;
      object-fit: contain;
      box-shadow: var(--ss-shadow-pop);
      background: var(--ss-bg-elev);
    }

    .lightbox-caption {
      margin: 0;
      color: var(--ss-fg-shine);
      font-size: var(--ss-ui-md);
      text-align: center;
    }

    .close {
      position: absolute;
      top: calc(-1 * var(--ss-s-10));
      right: 0;
      appearance: none;
      background: var(--ss-bg-elev);
      border: 1px solid var(--ss-line-strong);
      color: var(--ss-fg);
      cursor: pointer;
      width: var(--ss-image-close);
      height: var(--ss-image-close);
      font-size: var(--ss-size-h3);
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover { background: var(--ss-bg-elev-hover); }
      &:focus-visible { outline: 2px solid var(--ss-primary); outline-offset: 2px; }
    }
  }

  @keyframes ss-image-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ss-image-lightbox .backdrop,
    .ss-image-lightbox .dialog-body { animation: none; }
  }
</style>
