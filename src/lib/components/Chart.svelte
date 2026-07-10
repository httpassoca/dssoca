<script module lang="ts">
  export type ChartXValue = number | string | Date
  export interface ChartPoint {
    x: ChartXValue
    y: number
  }
  export interface ChartSeries {
    label: string
    data: ChartPoint[]
    color?: string
  }
  export type ChartVariant = 'line' | 'area' | 'bar'
</script>

<script lang="ts">
  import { CHART_PALETTE } from '../palette.js'
  import { scaleLinear, scaleTime, scaleBand } from 'd3-scale'
  import { line as shapeLine, area as shapeArea } from 'd3-shape'
  import { extent, max } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'

  type XType = 'linear' | 'time' | 'band'

  interface Props {
    /** One or more data series; each is drawn in the cycling palette unless `color` is set. */
    series: ChartSeries[]
    /** Rendering style. `bar` groups bars per x-category across series. Default `line`. */
    variant?: ChartVariant
    /** X scale kind. Defaults to `band` for bars, else `time` for Date x-values, else `linear`. */
    xType?: XType
    /** Format an x value for axis ticks + tooltip. */
    xFormat?: (x: ChartXValue) => string
    /** Format a y value for axis ticks + tooltip. */
    yFormat?: (y: number) => string
    /** Intrinsic drawing height in px. Default 240. */
    height?: number
    /** Intrinsic drawing width in px. Default 480. */
    width?: number
    /** Stretch to the container width via the viewBox (width:100%). */
    fluid?: boolean
    /** Show the series legend (labels + colour swatches). Default true. */
    legend?: boolean
    /** Show a tooltip on hover/focus of a datum. Default true. */
    tooltip?: boolean
    /** SR summary + accessible name; auto-generated when absent. */
    summary?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    series,
    variant = 'line',
    xType,
    xFormat,
    yFormat,
    height = 240,
    width = 480,
    fluid = false,
    legend = true,
    tooltip = true,
    summary,
    size,
  }: Props = $props()

  const PALETTE = CHART_PALETTE

  const M = { top: 8, right: 12, bottom: 24, left: 40 }

  const cleanSeries = $derived((series ?? []).filter((s) => s && Array.isArray(s.data)))
  const allPoints = $derived(cleanSeries.flatMap((s) => s.data))
  const isEmpty = $derived(allPoints.length === 0)

  function colorFor(s: ChartSeries, i: number): string {
    return s.color ?? PALETTE[i % PALETTE.length]
  }

  function toNum(x: ChartXValue): number {
    if (x instanceof Date) return x.getTime()
    return typeof x === 'number' ? x : Number(x)
  }
  function xKey(x: ChartXValue): string {
    return x instanceof Date ? String(x.getTime()) : String(x)
  }

  // Resolve the x scale kind.
  const xIsDate = $derived(allPoints.some((p) => p.x instanceof Date))
  const resolvedXType = $derived<XType>(
    xType ?? (variant === 'bar' ? 'band' : xIsDate ? 'time' : 'linear'),
  )

  const innerW = $derived(Math.max(0, width - M.left - M.right))
  const innerH = $derived(Math.max(0, height - M.top - M.bottom))

  const fmtX = $derived(
    xFormat ?? ((x: ChartXValue) => (x instanceof Date ? x.toLocaleDateString() : String(x))),
  )
  const fmtY = $derived(yFormat ?? ((y: number) => String(y)))

  // Distinct x categories (band scale + grouped bars), in first-seen order.
  const categories = $derived.by(() => {
    const seen = new Map<string, ChartXValue>()
    for (const p of allPoints) {
      const k = xKey(p.x)
      if (!seen.has(k)) seen.set(k, p.x)
    }
    return [...seen.values()]
  })
  const categoryKeys = $derived(categories.map(xKey))

  // ── d3 scales ─────────────────────────────────────────────────────────────
  // Linear y scale [0..max] → [innerH..0], rounded to nice tick bounds.
  const yScaleObj = $derived(
    scaleLinear()
      .domain([0, max(allPoints, (p) => p.y) ?? 1])
      .nice()
      .range([innerH, 0]),
  )
  function yScale(y: number): number {
    return yScaleObj(y)
  }

  // Band scale across the distinct categories (drives bars + categorical x).
  const xBand = $derived(scaleBand<string>().domain(categoryKeys).range([0, innerW]).padding(0.2))

  // Continuous x scales for line/area (time for Date values, else linear).
  const xLinear = $derived(
    scaleLinear()
      .domain((extent(allPoints, (p) => toNum(p.x)) as [number, number]) ?? [0, 1])
      .range([0, innerW]),
  )
  const xTime = $derived(
    scaleTime()
      .domain(
        (extent(allPoints, (p) => (p.x instanceof Date ? p.x : new Date(toNum(p.x)))) as [
          Date,
          Date,
        ]) ?? [new Date(0), new Date(1)],
      )
      .range([0, innerW]),
  )

  function xPos(x: ChartXValue): number {
    if (resolvedXType === 'band') return (xBand(xKey(x)) ?? 0) + xBand.bandwidth() / 2
    if (resolvedXType === 'time') return xTime(x instanceof Date ? x : new Date(toNum(x)))
    return xLinear(toNum(x))
  }

  // Axis ticks via the d3 scales.
  const yTicks = $derived(yScaleObj.ticks(5))
  const xTicks = $derived.by<{ x: number; label: string }[]>(() => {
    if (resolvedXType === 'band') {
      return categories.map((c) => ({ x: xPos(c), label: fmtX(c) }))
    }
    if (resolvedXType === 'time') {
      return xTime.ticks(5).map((v) => ({ x: xTime(v), label: fmtX(v) }))
    }
    return xLinear.ticks(5).map((v) => ({ x: xLinear(v), label: fmtX(v) }))
  })

  // ── path generators (d3-shape) ─────────────────────────────────────────────
  const lineGen = $derived(
    shapeLine<ChartPoint>()
      .x((p) => xPos(p.x))
      .y((p) => yScale(p.y)),
  )
  const areaGen = $derived(
    shapeArea<ChartPoint>()
      .x((p) => xPos(p.x))
      .y0(innerH)
      .y1((p) => yScale(p.y)),
  )

  const linePaths = $derived.by(() => {
    if (variant !== 'line' && variant !== 'area') return []
    return cleanSeries.map((s, i) => ({
      d: lineGen(s.data) ?? '',
      color: colorFor(s, i),
      label: s.label,
    }))
  })
  const areaPaths = $derived.by(() => {
    if (variant !== 'area') return []
    return cleanSeries.map((s, i) => ({
      d: areaGen(s.data) ?? '',
      color: colorFor(s, i),
      label: s.label,
    }))
  })

  // Grouped bars: each x-category holds one bar per series, packed across the band.
  const barGroups = $derived.by(() => {
    if (variant !== 'bar') return []
    const inner = scaleBand<number>()
      .domain(cleanSeries.map((_, i) => i))
      .range([0, xBand.bandwidth()])
      .padding(0.1)
    return categories.map((cat) => {
      const left = xBand(xKey(cat)) ?? 0
      const bars = cleanSeries
        .map((s, i) => {
          const pt = s.data.find((p) => xKey(p.x) === xKey(cat))
          if (!pt) return null
          const y = yScale(pt.y)
          return {
            x: left + (inner(i) ?? 0),
            y,
            w: inner.bandwidth(),
            h: Math.max(0, innerH - y),
            color: colorFor(s, i),
            label: s.label,
            value: pt.y,
            cat,
          }
        })
        .filter((b): b is NonNullable<typeof b> => b !== null)
      return { bars }
    })
  })

  // Focusable point markers (line/area datums).
  const pointMarkers = $derived.by(() => {
    if (variant !== 'line' && variant !== 'area') return []
    return cleanSeries.flatMap((s, i) =>
      s.data.map((p) => ({
        cx: xPos(p.x),
        cy: yScale(p.y),
        color: colorFor(s, i),
        label: s.label,
        x: p.x,
        value: p.y,
      })),
    )
  })

  // Auto SR summary.
  const autoSummary = $derived.by(() => {
    if (isEmpty) return 'No data'
    const kind = variant === 'bar' ? 'Bar chart' : variant === 'area' ? 'Area chart' : 'Line chart'
    const names = cleanSeries.map((s) => s.label).join(', ')
    return `${kind} with ${cleanSeries.length} series (${names}); ${allPoints.length} data points.`
  })
  const srText = $derived(summary ?? autoSummary)

  const resolvedSize = $derived(resolveComponentSize('Chart', size))

  // Tooltip state.
  let active = $state<{
    label: string
    x: ChartXValue
    y: number
    cx: number
    cy: number
  } | null>(null)
  function show(label: string, x: ChartXValue, y: number, cx: number, cy: number) {
    if (tooltip) active = { label, x, y, cx, cy }
  }
  function hide() {
    active = null
  }
  function datumLabel(label: string, x: ChartXValue, y: number): string {
    return `${label}: ${fmtX(x)}, ${fmtY(y)}`
  }
</script>

<div
  class="ss-chart"
  class:fluid
  data-variant={variant}
  data-size-variant={resolvedSize}
  role="group"
  aria-label={srText}
>
  {#if isEmpty}
    <span class="empty" aria-hidden="true">—</span>
    <span class="sr-only">No data</span>
  {:else}
    <div class="plot">
      <svg
        class="canvas"
        viewBox="0 0 {width} {height}"
        width={fluid ? undefined : width}
        height={fluid ? undefined : height}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <g transform="translate({M.left},{M.top})">
          <!-- gridlines + y axis -->
          {#each yTicks as t}
            <line class="grid" x1="0" x2={innerW} y1={yScale(t)} y2={yScale(t)} />
            <text class="tick y" x="-6" y={yScale(t)} dy="0.32em" text-anchor="end">{fmtY(t)}</text>
          {/each}
          <line class="axis" x1="0" x2="0" y1="0" y2={innerH} />

          <!-- x axis -->
          <line class="axis" x1="0" x2={innerW} y1={innerH} y2={innerH} />
          {#each xTicks as t}
            <text class="tick x" x={t.x} y={innerH + 16} text-anchor="middle">{t.label}</text>
          {/each}

          <!-- series -->
          {#if variant === 'area'}
            {#each areaPaths as p}
              <path class="area" d={p.d} style="fill:{p.color}" />
            {/each}
          {/if}

          {#if variant === 'line' || variant === 'area'}
            {#each linePaths as p}
              <path class="line" d={p.d} style="stroke:{p.color}" />
            {/each}
            {#each pointMarkers as m}
              <circle
                class="point"
                cx={m.cx}
                cy={m.cy}
                r="4"
                style="fill:{m.color}"
                tabindex="0"
                role="button"
                aria-label={datumLabel(m.label, m.x, m.value)}
                onfocus={() => show(m.label, m.x, m.value, m.cx, m.cy)}
                onblur={hide}
                onmouseenter={() => show(m.label, m.x, m.value, m.cx, m.cy)}
                onmouseleave={hide}
              />
            {/each}
          {/if}

          {#if variant === 'bar'}
            {#each barGroups as g}
              {#each g.bars as b}
                <rect
                  class="bar"
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  style="fill:{b.color}"
                  tabindex="0"
                  role="button"
                  aria-label={datumLabel(b.label, b.cat, b.value)}
                  onfocus={() => show(b.label, b.cat, b.value, b.x + b.w / 2, b.y)}
                  onblur={hide}
                  onmouseenter={() => show(b.label, b.cat, b.value, b.x + b.w / 2, b.y)}
                  onmouseleave={hide}
                />
              {/each}
            {/each}
          {/if}
        </g>
      </svg>

      {#if tooltip && active}
        <div
          class="tooltip"
          role="status"
          style="left:{((active.cx + M.left) / width) * 100}%;top:{((active.cy + M.top) / height) *
            100}%"
        >
          <span class="t-label">{active.label}</span>
          <span class="t-val">{fmtX(active.x)} · {fmtY(active.y)}</span>
        </div>
      {/if}
    </div>

    {#if legend}
      <ul class="legend">
        {#each cleanSeries as s, i}
          <li class="legend-item">
            <span class="swatch" style="background:{colorFor(s, i)}" aria-hidden="true"></span>
            <span class="legend-label">{s.label}</span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style lang="scss">
  .ss-chart {
    display: inline-flex;
    flex-direction: column;
    gap: var(--ss-gap-sm);
    font-family: var(--ss-font-body);
    color: var(--ss-fg);
    max-width: 100%;

    &.fluid {
      display: flex;
      width: 100%;
    }

    .plot {
      position: relative;
      width: 100%;
    }

    .canvas {
      display: block;
      max-width: 100%;
      height: auto;
      overflow: visible;
    }

    &.fluid .canvas {
      width: 100%;
    }

    .empty {
      align-self: center;
      margin: auto;
      padding: var(--ss-gap-sm);
      color: var(--ss-fg-muted);
      font-family: var(--ss-font-mono);
      line-height: 1;
      min-height: var(--ss-chart-h, 240px);
      display: flex;
      align-items: center;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .grid {
      stroke: var(--ss-line);
      stroke-width: 1;
      opacity: 0.5;
      shape-rendering: crispEdges;
    }

    .axis {
      stroke: var(--ss-line);
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .tick {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .line {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .area {
      opacity: 0.18;
      stroke: none;
    }

    .point {
      cursor: pointer;
      transition: r var(--ss-dur-fast) var(--ss-ease);
      &:hover,
      &:focus-visible {
        outline: none;
        r: 6;
      }
      &:focus-visible {
        stroke: var(--ss-fg);
        stroke-width: 2;
      }
    }

    .bar {
      cursor: pointer;
      transition: opacity var(--ss-dur-fast) var(--ss-ease);
      &:hover {
        opacity: 0.85;
      }
      &:focus-visible {
        outline: none;
        stroke: var(--ss-fg);
        stroke-width: 2;
      }
    }

    .tooltip {
      position: absolute;
      transform: translate(-50%, calc(-100% - 8px));
      pointer-events: none;
      background: var(--ss-bg-elev);
      border: 1px solid var(--ss-line-strong);
      padding: var(--ss-gap-sm);
      font-size: var(--ss-ui-xs);
      line-height: 1.3;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 2;

      .t-label {
        font-family: var(--ss-font-mono);
        color: var(--ss-fg);
      }
      .t-val {
        font-family: var(--ss-font-mono);
        color: var(--ss-fg-muted);
      }
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ss-gap-sm);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--ss-ui-xs);
      font-family: var(--ss-font-mono);
      color: var(--ss-fg-muted);
    }

    .swatch {
      width: 10px;
      height: 10px;
      flex: none;
      display: inline-block;
    }
  }
</style>
