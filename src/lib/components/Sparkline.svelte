<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  type Trend = 'auto' | 'up' | 'down' | 'flat' | 'none'
  type Variant = 'bars' | 'line' | 'area'

  interface Props {
    data: number[]
    /** Bar/line fill. Ignored when `trend` resolves to a non-`none` direction. */
    color?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Accessible label; overrides the auto-generated summary as the accessible name. */
    label?: string
    /** Lower bound of the scale. Defaults to the data min — set to fix the scale across rows. */
    min?: number
    /** Upper bound of the scale. Defaults to the data max — set to fix the scale across rows. */
    max?: number
    /** Colour by direction. `auto` derives first-vs-last → success/danger/muted. Default `none`. */
    trend?: Trend
    /** Rendering style. Default `bars`. */
    variant?: Variant
    /** Flex the chart to fill its container width (table-cell friendly). */
    fluid?: boolean
    /** Explicit CSS width (e.g. `'120px'`, `'100%'`). Overrides the intrinsic width. */
    width?: string
    /** Format a value for the screen-reader summary (e.g. `v => v + '%'`). */
    valueFormat?: (v: number) => string
    /** Replace the auto-generated screen-reader summary entirely. */
    summary?: string
  }
  let {
    data,
    color = 'var(--ss-primary)',
    size,
    label,
    min,
    max,
    trend = 'none',
    variant = 'bars',
    fluid = false,
    width,
    valueFormat,
    summary,
  }: Props = $props()

  const fmt = $derived(valueFormat ?? ((v: number) => String(v)))

  // Scale bounds: explicit props win, else derive from the data's real range.
  const lo = $derived(min ?? (data.length ? Math.min(...data) : 0))
  const hi = $derived(max ?? (data.length ? Math.max(...data) : 1))
  const range = $derived(hi - lo)

  /** Normalise a value into 0..1 across [lo,hi]; flat range pins to the mid-line. */
  function norm(v: number): number {
    if (range <= 0) return 0.5
    return Math.min(1, Math.max(0, (v - lo) / range))
  }

  // Resolved trend direction (auto derives from first-vs-last).
  const direction = $derived.by<'up' | 'down' | 'flat' | 'none'>(() => {
    if (trend === 'none') return 'none'
    if (trend !== 'auto') return trend
    if (data.length < 2) return 'flat'
    const d = data[data.length - 1] - data[0]
    if (d > 0) return 'up'
    if (d < 0) return 'down'
    return 'flat'
  })

  // Colour: a resolved direction overrides the `color` prop.
  const fill = $derived.by(() => {
    switch (direction) {
      case 'up':
        return 'var(--ss-success)'
      case 'down':
        return 'var(--ss-danger)'
      case 'flat':
        return 'var(--ss-fg-muted)'
      default:
        return color
    }
  })

  // Screen-reader summary: first→last, direction, min/max, n points.
  const autoSummary = $derived.by(() => {
    if (!data.length) return 'No data'
    if (data.length === 1) return `Single value ${fmt(data[0])}`
    const first = data[0]
    const last = data[data.length - 1]
    const dmin = Math.min(...data)
    const dmax = Math.max(...data)
    const arrow = last > first ? 'rising' : last < first ? 'falling' : 'flat'
    return `Trend ${arrow}: ${fmt(first)} to ${fmt(last)} over ${data.length} points, range ${fmt(dmin)} to ${fmt(dmax)}.`
  })
  const srText = $derived(summary ?? autoSummary)
  const accName = $derived(label ?? srText)

  // SVG geometry (line/area) on a fixed viewBox; width:100% + viewBox makes it fluid.
  const VB_W = 100
  const VB_H = 100
  const points = $derived.by(() => {
    if (data.length === 0) return []
    if (data.length === 1) {
      const y = VB_H - norm(data[0]) * VB_H
      return [{ x: VB_W / 2, y }]
    }
    return data.map((v, i) => ({
      x: (i / (data.length - 1)) * VB_W,
      y: VB_H - norm(v) * VB_H,
    }))
  })
  const polyline = $derived(points.map((p) => `${p.x},${p.y}`).join(' '))
  const areaPath = $derived(
    points.length
      ? `M${points[0].x},${VB_H} L` +
          points.map((p) => `${p.x},${p.y}`).join(' ') +
          ` L${points[points.length - 1].x},${VB_H} Z`
      : '',
  )

  const isEmpty = $derived(data.length === 0)
  const isSingle = $derived(data.length === 1)

  const rootStyle = $derived(
    [width ? `width:${width}` : '', fluid && !width ? 'width:100%' : ''].filter(Boolean).join(';'),
  )
</script>

<div
  class="ss-spark"
  class:fluid
  data-variant={variant}
  data-size-variant={resolveComponentSize('Sparkline', size)}
  role="img"
  aria-label={accName}
  style={rootStyle || undefined}
>
  {#if isEmpty}
    <span class="empty" aria-hidden="true">—</span>
  {:else if variant === 'bars'}
    {#if isSingle}
      <i
        class="single"
        aria-hidden="true"
        style="height:{Math.max(8, norm(data[0]) * 100)}%;background:{fill}"
      ></i>
    {:else}
      {#each data as v}
        <i aria-hidden="true" style="height:{Math.max(8, norm(v) * 100)}%;background:{fill}"></i>
      {/each}
    {/if}
  {:else}
    <svg
      class="chart"
      viewBox="0 0 {VB_W} {VB_H}"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {#if variant === 'area' && areaPath}
        <path class="area" d={areaPath} style="fill:{fill}" />
      {/if}
      {#if isSingle}
        <circle class="marker" cx={points[0].x} cy={points[0].y} r="3" style="fill:{fill}" />
      {:else}
        <polyline class="line" points={polyline} style="stroke:{fill}" />
      {/if}
    </svg>
  {/if}
</div>

<style lang="scss">
  .ss-spark {
    display: inline-flex;
    align-items: flex-end;
    gap: var(--ss-spark-gap, 1px);
    // Height fallback chain (DS-0068): without --ss-spark-h the chart tracks
    // the icon size token, so it still rescales with the size axis; the
    // literal 18px (the md value) is only the no-stylesheet last resort.
    height: var(--ss-spark-h, var(--ss-icon, 18px));
    position: relative;

    &.fluid {
      width: 100%;
    }

    i {
      width: var(--ss-spark-bar-w, 3px);
      background: var(--ss-primary);
      opacity: 0.85;
      border-radius: 0;
    }

    &.fluid i {
      flex: 1 1 0;
      width: auto;
      min-width: 1px;
    }

    .single {
      margin: 0 auto;
    }

    .empty {
      align-self: center;
      margin: auto;
      color: var(--ss-fg-muted);
      font-family: var(--ss-font-mono);
      line-height: 1;
    }

    .chart {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .line {
      fill: none;
      stroke: var(--ss-primary);
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .area {
      opacity: 0.22;
      stroke: none;
    }

    .marker {
      fill: var(--ss-primary);
    }
  }
</style>
