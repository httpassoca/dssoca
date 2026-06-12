<script lang="ts">
  /**
   * The landing "workstation": a grid of independent live component tiles
   * (`HubTile`) sized to fill the viewport with a randomized, repeating pool
   * (~5 per row at 1920px). Rendered client-only by the page, so the components
   * never hit SSR/prerender. Each tile owns its own cycling — this just decides
   * how many to render and lays them out.
   */
  import { buildTilePool } from '$lib/hub-data'
  import HubTile from './HubTile.svelte'

  // Grid metrics (kept in sync with the CSS below): ~5 cols at 1920px.
  const TILE_MIN_W = 360
  const TILE_H = 176
  const MAX_TILES = 64 // perf cap; fills full-HD / 1440p, clipped beyond

  // Stable randomized pool (built once on the client → no SSR mismatch).
  const POOL = buildTilePool(MAX_TILES)

  // Render just enough tiles to fill the viewport. Resizing only adds/removes
  // tiles at the end — existing tiles (and their cyclers) are untouched.
  let count = $state(MAX_TILES)
  $effect(() => {
    const measure = () => {
      const cols = Math.max(1, Math.floor(window.innerWidth / TILE_MIN_W))
      const rows = Math.ceil(window.innerHeight / TILE_H) + 1
      count = Math.min(MAX_TILES, cols * rows)
    }
    measure()
    window.addEventListener('resize', measure, { passive: true })
    return () => window.removeEventListener('resize', measure)
  })
  const visible = $derived(POOL.slice(0, count))
</script>

<div class="hub" aria-hidden="true">
  {#each visible as slug, i (i)}
    <HubTile {slug} />
  {/each}
</div>

<style lang="scss">
  .hub {
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: grid;
    // ~5 columns at 1920px; auto-fills to the viewport width.
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    grid-auto-rows: 176px;
    gap: 1px;
    // transparent so the page's radial gradient shows through the dimmed tiles
    background: transparent;
  }
</style>
