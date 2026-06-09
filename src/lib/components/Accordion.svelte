<script module lang="ts">
  /** One disclosure panel in an {@link Accordion}. */
  export interface AccordionItem {
    id: string
    /** Header label. */
    title: string
    /** Open on first render. */
    open?: boolean
    /** Disabled panels can't be toggled. */
    disabled?: boolean
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0051 (Accordion component).
  // Implement: header (button + chevron rotating 180° on open) + animated body
  // (token-driven duration/easing, reduced-motion → instant), single vs
  // `multiple` open, controlled `value` + onChange, aria-expanded/controls,
  // role=region + aria-labelledby.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Panels to render. */
    items?: AccordionItem[]
    /** Allow more than one panel open at once. */
    multiple?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Panel body content (per-item rendering is built in DS-0051). */
    children?: Snippet
  }

  let { items = [], multiple = false, size, children }: Props = $props()
</script>

<div class="ss-accordion" data-size-variant={resolveComponentSize('Accordion', size)}>
  {#each items as item (item.id)}
    <section>
      <button type="button" aria-expanded={item.open ?? false} disabled={item.disabled}>
        {item.title}
      </button>
    </section>
  {/each}
  {@render children?.()}
</div>

<style lang="scss">
  // TODO(DS-0051): real styling + animated disclosure.
  .ss-accordion { display: block; }
</style>
