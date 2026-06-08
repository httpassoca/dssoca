<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label: string
    value: string | number
    suffix?: string
    delta?: string
    dir?: 'up' | 'down'
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let { label, value, suffix, delta, dir = 'up', size }: Props = $props()
</script>

<div class="ss-metric" data-size-variant={resolveComponentSize('MetricTile', size)}>
  <div class="label">{label}</div>
  <div class="val">
    {value}{#if suffix}<span class="small">{suffix}</span>{/if}
  </div>
  {#if delta}
    <div class="delta {dir}" aria-label="{dir === 'up' ? 'up' : 'down'} {delta}">{dir === 'up' ? '↑' : '↓'} {delta}</div>
  {/if}
</div>

<style lang="scss">
  .ss-metric {
    padding: var(--ss-card-py) var(--ss-card-px);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    display: flex; flex-direction: column; gap: 4px;

    .label { font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); color: var(--ss-fg-faint); text-transform: lowercase; letter-spacing: 0.04em; }
    .val {
      font-family: var(--ss-font-display); font-weight: 400; font-size: var(--ss-metric-val); line-height: 1; letter-spacing: -0.015em; font-variant-numeric: tabular-nums;
      .small { font-size: .5em; opacity: .5; }
    }
    .delta {
      font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs);
      &.up { color: var(--ss-primary); }
      &.down { color: var(--ss-red); }
    }
  }
</style>
