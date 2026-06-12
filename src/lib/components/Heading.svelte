<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Heading level (1–6) — picks the rendered element (h1…h6); styling is level-independent. */
    level?: 1 | 2 | 3 | 4 | 5 | 6
    /** Primary accent underline behind the text. On by default. */
    accent?: boolean
    /** Center the heading (text-align). */
    centered?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Heading text. */
    children?: Snippet
  }

  let { level = 1, accent = true, centered = false, size, children }: Props = $props()

  const tag = $derived(`h${level}`)
</script>

<!--
  Display/page-title heading — the `.hs-display` recipe from theme.css, carried
  in-component so it works without the global stylesheet (DS-0083 / DS-0089).
  The accent underline sits behind the text via a negative-z pseudo-element;
  the bg-colored text-shadow lets the glyphs "cut into" the highlight.
-->
<svelte:element
  this={tag}
  class="ss-heading"
  class:accent
  class:centered
  data-size-variant={resolveComponentSize('Heading', size)}
>
  <span class="txt">{@render children?.()}</span>
</svelte:element>

<style lang="scss">
  // Heading size tokens — authored here (scoped) so they ship without touching
  // the shared token sheet; they cascade like any --ss-* custom property.
  // Defaults mirror the `md` size; sm/lg rescale via the size axis. Mirrored
  // globally in src/styles/components/_heading.scss.
  .ss-heading {
    --ss-heading-size: var(--ss-size-display);
    --ss-heading-mb: var(--ss-s-4);
    --ss-heading-shadow: 3px;

    &[data-size-variant='sm'] {
      --ss-heading-size: clamp(30px, 6.5vw, 44px);
      --ss-heading-mb: var(--ss-s-3);
      --ss-heading-shadow: 2px;
    }
    &[data-size-variant='lg'] {
      --ss-heading-size: clamp(44px, 9vw, 64px);
      --ss-heading-mb: var(--ss-s-6);
      --ss-heading-shadow: 4px;
    }

    // The .hs-display recipe (see src/styles/_base.scss), token-driven.
    font-family: var(--ss-font-display);
    font-style: normal;
    font-weight: 400;
    font-size: var(--ss-heading-size);
    line-height: 1.05;
    letter-spacing: -0.015em;
    color: var(--ss-fg);
    margin: 0 0 var(--ss-heading-mb) 0;
    // bg-colored shadow so the glyphs read above the accent highlight.
    text-shadow: var(--ss-heading-shadow) var(--ss-heading-shadow) var(--ss-bg);
    position: relative;
    z-index: 0;

    &.centered {
      text-align: center;
    }

    .txt {
      position: relative;
    }

    // Accent underline — a primary bar behind the lower third of the text
    // (zero border-radius, house rule). Behind the glyphs via z-index: -1.
    &.accent .txt::before {
      content: '';
      position: absolute;
      left: -2%;
      right: -8%;
      top: 70%;
      height: 20%;
      background: var(--ss-primary);
      opacity: 0.9;
      z-index: -1;
    }
  }
</style>
