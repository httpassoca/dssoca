<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /**
     * Page mode — behaves like a route page: fills the viewport height and
     * adds vertical page padding on top of the horizontal gutters.
     */
    page?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Page content. */
    children?: Snippet
  }

  let { page = false, size, children }: Props = $props()
</script>

<!--
  Centered, max-width page-content wrapper (DS-0085) — the DS-owned version of
  the per-site "AppContent" wrappers. Full-bleed at narrow viewports (the
  max-width simply stops binding); gutters stay via the inline padding.
-->
<div class="ss-container" class:page data-size-variant={resolveComponentSize('Container', size)}>
  {@render children?.()}
</div>

<style lang="scss">
  // Container size tokens — authored here (scoped) so they ship without
  // touching the shared token sheet; they cascade like any --ss-* custom
  // property. Defaults mirror the `md` size; sm/lg rescale via the size axis.
  // Mirrored globally in src/styles/components/_container.scss.
  .ss-container {
    --ss-container-max-w: 875px;
    --ss-container-px: var(--ss-main-px);
    --ss-container-page-py: var(--ss-s-10);

    &[data-size-variant='sm'] {
      --ss-container-max-w: 760px;
      --ss-container-px: var(--ss-s-5);
      --ss-container-page-py: var(--ss-s-8);
    }
    &[data-size-variant='lg'] {
      --ss-container-max-w: 1000px;
      --ss-container-px: var(--ss-s-12);
      --ss-container-page-py: var(--ss-s-12);
    }

    box-sizing: border-box;
    width: 100%;
    max-width: var(--ss-container-max-w);
    margin-inline: auto;
    padding-inline: var(--ss-container-px);

    // Route-page mode: viewport-filling with vertical page padding.
    &.page {
      min-height: 100vh;
      min-height: 100svh;
      padding-block: var(--ss-container-page-py);
    }
  }
</style>
