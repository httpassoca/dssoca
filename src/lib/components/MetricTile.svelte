<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  /** Sentiment drives the delta colour independently of the arrow direction
   *  (a rising error rate is `negative`, a falling one `positive`). */
  type Trend = 'positive' | 'negative' | 'neutral'

  interface Props {
    label: string
    value: string | number
    suffix?: string
    /** Leading unit, e.g. `$` / `€`; rendered faint like the suffix. */
    prefix?: string
    delta?: string
    dir?: 'up' | 'down'
    /**
     * Good/bad colour for the delta, decoupled from the arrow `dir`.
     * Defaults so `up` reads positive / `down` reads negative — today's behaviour.
     * Set explicitly (e.g. `trend="negative"` on a rising error rate) to flip it.
     */
    trend?: Trend
    /** Comparison-period label rendered faint after the delta ("vs prev 7d"). */
    deltaLabel?: string
    /** Render the delta as a soft sentiment chip (non-colour redundancy). Zero radius. */
    emphasis?: boolean
    /** Skeleton/loading state: hides the real value behind aria-hidden bars. */
    loading?: boolean
    /** Snippet slot below the delta — drop in a <Sparkline> here. */
    chart?: Snippet
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let {
    label,
    value,
    suffix,
    prefix,
    delta,
    dir = 'up',
    trend,
    deltaLabel,
    emphasis = false,
    loading = false,
    chart,
    size,
  }: Props = $props()

  // Default sentiment preserves today's up=positive / down=negative.
  const sentiment = $derived<Trend>(trend ?? (dir === 'up' ? 'positive' : 'negative'))

  // Worded delta description so colour/arrow isn't the only signal (WCAG 1.4.1).
  const deltaDescription = $derived(
    [`${dir === 'up' ? 'increased' : 'decreased'} ${delta}`, deltaLabel].filter(Boolean).join(' '),
  )
</script>

<div
  class="ss-metric"
  data-size-variant={resolveComponentSize('MetricTile', size)}
  aria-busy={loading ? 'true' : undefined}
>
  <div class="label">{label}</div>

  {#if loading}
    <div class="skeleton skeleton-val" aria-hidden="true"></div>
    {#if delta}<div class="skeleton skeleton-delta" aria-hidden="true"></div>{/if}
  {:else}
    <div class="val" role="status" aria-live="polite">
      {#if prefix}<span class="small">{prefix}</span>{/if}{value}{#if suffix}<span class="small"
          >{suffix}</span
        >{/if}
    </div>
    {#if delta}
      <div class="delta {sentiment}" class:emphasis role="img" aria-label={deltaDescription}>
        <span aria-hidden="true">{dir === 'up' ? '↑' : '↓'} {delta}</span>
        {#if deltaLabel}<span class="period" aria-hidden="true">{deltaLabel}</span>{/if}
      </div>
    {/if}
  {/if}

  {#if chart}<div class="chart">{@render chart()}</div>{/if}
</div>

<style lang="scss">
  .ss-metric {
    padding: var(--ss-card-py) var(--ss-card-px);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-1);

    .label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
      text-transform: lowercase;
      letter-spacing: 0.04em;
    }
    .val {
      font-family: var(--ss-font-display);
      font-weight: 400;
      font-size: var(--ss-metric-val);
      line-height: 1;
      letter-spacing: -0.015em;
      font-variant-numeric: tabular-nums;
      .small {
        font-size: 0.5em;
        opacity: 0.5;
      }
    }
    .delta {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      display: inline-flex;
      align-items: baseline;
      gap: var(--ss-s-1);
      &.positive {
        color: var(--ss-success);
      }
      &.negative {
        color: var(--ss-danger);
      }
      &.neutral {
        color: var(--ss-fg-muted);
      }

      .period {
        color: var(--ss-fg-faint);
      }

      // Opt-in soft chip — non-colour redundancy. Zero radius (house rule).
      &.emphasis {
        align-self: flex-start;
        padding: var(--ss-s-1) var(--ss-s-2);
        border-radius: var(--ss-radius-0);
        &.positive {
          background: var(--ss-success-soft);
        }
        &.negative {
          background: var(--ss-danger-soft);
        }
        &.neutral {
          background: var(--ss-hover);
        }
      }
    }

    .chart {
      margin-top: var(--ss-s-1);
    }

    // Zero-radius skeleton bars (aria-hidden); pulse honours reduced-motion via the token.
    .skeleton {
      background: var(--ss-skeleton);
      border-radius: var(--ss-radius-0);
      animation: skeleton-pulse var(--ss-dur-xslow) var(--ss-ease) infinite alternate;
    }
    .skeleton-val {
      height: var(--ss-metric-val);
      width: 60%;
    }
    .skeleton-delta {
      height: var(--ss-ui-xs);
      width: 35%;
    }
  }

  @keyframes skeleton-pulse {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ss-metric .skeleton {
      animation: none;
    }
  }
</style>
