<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    tone?: 'up' | 'deg' | 'down' | 'maint' | 'info'
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    children: Snippet
  }
  let { tone = 'info', size, children }: Props = $props()

  const hasDot = $derived(['up', 'deg', 'down', 'maint', 'info'].includes(tone))
</script>

<span class="ss-badge {tone}" data-size-variant={resolveComponentSize('Badge', size)}>
  {#if hasDot}<span class="dot" aria-hidden="true"></span>{/if}
  {@render children()}
</span>

<style lang="scss">
  .ss-badge {
    font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs);
    padding: var(--ss-badge-py) var(--ss-badge-px); letter-spacing: 0.05em;
    display: inline-flex; align-items: center; gap: 6px; text-transform: lowercase;
    border: 1px solid var(--ss-line);

    &.up   { background: rgba(102,239,115,.12); color: var(--ss-primary); border-color: rgba(102,239,115,.4); }
    &.deg  { background: rgba(224,195,106,.12); color: var(--ss-yellow); border-color: rgba(224,195,106,.4); }
    &.down { background: rgba(255,92,92,.12);   color: var(--ss-red);    border-color: rgba(255,92,92,.4); }
    &.maint { background: rgba(154,164,255,.12); color: var(--ss-blue);   border-color: rgba(154,164,255,.4); }
    &.info { background: rgba(102,217,239,.12); color: var(--ss-cyan);   border-color: rgba(102,217,239,.4); }
    .dot { width: 5px; height: 5px; background: currentColor; }
  }
</style>
