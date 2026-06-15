<script module lang="ts">
  export interface BoxGroup {
    /** Group caption shown under its band and in the tooltip / accessible name. */
    label: string
    /** Raw values for this group; whiskers + quartiles are computed from these. */
    values: number[]
    /** Optional per-group colour; falls back to the cycling palette. */
    color?: string
  }
</script>

<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale'
  import { extent, quantile } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** One box per group. Each group has a `label`, `values`, and optional `color`. */
    groups: BoxGroup[]
    /** Overlay every value as a small jittered dot. Default true. */
    showPoints?: boolean
    /** Y axis caption (drawn rotated beside the axis). */
    yLabel?: string
    /** Force the y domain; defaults to the padded data extent across all values. */
    yDomain?: [number, number]
    /** Format a y value for ticks + tooltip. */
    yFormat?: (y: number) => string
    /** Intrinsic drawing height in px. Default 300. */
    height?: number
    /** Intrinsic drawing width in px. Default 420. */
    width?: number
    /** Stretch to the container width via the viewBox (width:100%). */
    fluid?: boolean
    /** Reveal a tooltip on hover/focus of a box. Default true. */
    tooltip?: boolean
    /** SR summary + accessible name; auto-generated when absent. */
    summary?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    groups,
    showPoints = true,
    yLabel,
    yDomain,
    yFormat,
    height = 300,
    width = 420,
    fluid = false,
    tooltip = true,
    summary,
    size,
  }: Props = $props()

  const PALETTE = [
    'var(--ss-primary)',
    'var(--ss-blue)',
    'var(--ss-purple)',
    'var(--ss-cyan)',
    'var(--ss-yellow)',
    'var(--ss-lime)',
  ]

  const M = { top: 12, right: 16, bottom: 36, left: 48 }

  // Keep only groups carrying at least one finite value.
  const clean = $derived(
    (groups ?? [])
      .filter((g) => g && Array.isArray(g.values))
      .map((g) => ({
        label: g.label,
        color: g.color,
        values: g.values.filter((v) => Number.isFinite(v)),
      }))
      .filter((g) => g.values.length > 0),
  )
  const isEmpty = $derived(clean.length === 0)

  function colorFor(g: { color?: string }, i: number): string {
    return g.color ?? PALETTE[i % PALETTE.length]
  }

  const innerW = $derived(Math.max(0, width - M.left - M.right))
  const innerH = $derived(Math.max(0, height - M.top - M.bottom))

  const fmtY = $derived(yFormat ?? ((y: number) => String(y)))

  /** Data extent padded by 8% each side; a flat axis is expanded to ±1. */
  function paddedExtent(values: number[]): [number, number] {
    const e = extent(values) as [number, number]
    if (e[0] === undefined) return [0, 1]
    if (e[0] === e[1]) return [e[0] - 1, e[1] + 1]
    const pad = (e[1] - e[0]) * 0.08
    return [e[0] - pad, e[1] + pad]
  }

  const allValues = $derived(clean.flatMap((g) => g.values))
  const yDom = $derived(yDomain ?? paddedExtent(allValues))

  const xScaleObj = $derived(
    scaleBand<string>()
      .domain(clean.map((g) => g.label))
      .range([0, innerW])
      .padding(0.3),
  )
  const yScaleObj = $derived(scaleLinear().domain(yDom).nice().range([innerH, 0]))

  const yTicks = $derived(yScaleObj.ticks(5))

  /** Deterministic horizontal offset for dot i within a band (no Math.random → SSR-safe). */
  function jitter(i: number, bandW: number): number {
    // Cheap integer hash → [0,1), mapped into the inner 70% of the band.
    const h = ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1
    return (h - 0.5) * bandW * 0.7
  }

  // Five-number summary + Tukey whiskers per group.
  const boxes = $derived.by(() => {
    const bw = xScaleObj.bandwidth()
    return clean.map((g, i) => {
      const sorted = [...g.values].sort((a, b) => a - b)
      const q1 = quantile(sorted, 0.25) as number
      const median = quantile(sorted, 0.5) as number
      const q3 = quantile(sorted, 0.75) as number
      const iqr = q3 - q1
      const loFence = q1 - 1.5 * iqr
      const hiFence = q3 + 1.5 * iqr
      const lo = sorted.find((v) => v >= loFence) ?? sorted[0]
      const hi = [...sorted].reverse().find((v) => v <= hiFence) ?? sorted[sorted.length - 1]
      const x = xScaleObj(g.label) ?? 0
      const cx = x + bw / 2
      const points = showPoints
        ? g.values.map((v, j) => ({ cx: cx + jitter(j, bw), cy: yScaleObj(v) }))
        : []
      return {
        label: g.label,
        color: colorFor(g, i),
        x,
        cx,
        w: bw,
        q1,
        median,
        q3,
        lo,
        hi,
        yQ1: yScaleObj(q1),
        yMedian: yScaleObj(median),
        yQ3: yScaleObj(q3),
        yLo: yScaleObj(lo),
        yHi: yScaleObj(hi),
        points,
      }
    })
  })

  const autoSummary = $derived.by(() => {
    if (isEmpty) return 'No data'
    const names = clean.map((g) => g.label).join(', ')
    return `Box plot with ${clean.length} groups (${names}).`
  })
  const srText = $derived(summary ?? autoSummary)

  const resolvedSize = $derived(resolveComponentSize('Chart', size))

  let active = $state<{
    label: string
    median: number
    q1: number
    q3: number
    lo: number
    hi: number
    cx: number
    cy: number
  } | null>(null)
  function show(b: (typeof boxes)[number]) {
    if (tooltip)
      active = {
        label: b.label,
        median: b.median,
        q1: b.q1,
        q3: b.q3,
        lo: b.lo,
        hi: b.hi,
        cx: b.cx,
        cy: b.yMedian,
      }
  }
  function hide() {
    active = null
  }
  function boxLabel(b: (typeof boxes)[number]): string {
    return `${b.label}: median ${fmtY(b.median)} (Q1 ${fmtY(b.q1)}–Q3 ${fmtY(b.q3)})`
  }
</script>

<div
  class="ss-boxplot"
  class:fluid
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
            <line class="grid" x1="0" x2={innerW} y1={yScaleObj(t)} y2={yScaleObj(t)} />
            <text class="tick y" x="-6" y={yScaleObj(t)} dy="0.32em" text-anchor="end">{fmtY(t)}</text>
          {/each}
          <line class="axis" x1="0" x2="0" y1="0" y2={innerH} />
          <line class="axis" x1="0" x2={innerW} y1={innerH} y2={innerH} />

          <!-- boxes -->
          {#each boxes as b}
            <!-- whisker centre line + caps -->
            <line class="whisker" x1={b.cx} x2={b.cx} y1={b.yLo} y2={b.yHi} />
            <line class="whisker" x1={b.cx - b.w / 4} x2={b.cx + b.w / 4} y1={b.yLo} y2={b.yLo} />
            <line class="whisker" x1={b.cx - b.w / 4} x2={b.cx + b.w / 4} y1={b.yHi} y2={b.yHi} />

            <!-- box (q1..q3) -->
            <rect
              class="box"
              x={b.x}
              y={b.yQ3}
              width={b.w}
              height={Math.max(0, b.yQ1 - b.yQ3)}
              style="fill:{b.color};stroke:{b.color}"
              tabindex="0"
              role="button"
              aria-label={boxLabel(b)}
              onfocus={() => show(b)}
              onblur={hide}
              onmouseenter={() => show(b)}
              onmouseleave={hide}
            />

            <!-- median -->
            <line class="median" x1={b.x} x2={b.x + b.w} y1={b.yMedian} y2={b.yMedian} style="stroke:{b.color}" />

            <!-- point overlay (decorative) -->
            {#if showPoints}
              {#each b.points as p}
                <circle class="point" cx={p.cx} cy={p.cy} r="2.5" style="fill:{b.color}" aria-hidden="true" />
              {/each}
            {/if}
          {/each}

          <!-- x axis labels -->
          {#each boxes as b}
            <text class="tick x" x={b.cx} y={innerH + 16} text-anchor="middle">{b.label}</text>
          {/each}

          <!-- y axis caption -->
          {#if yLabel}
            <text
              class="axis-label y"
              transform="translate({-M.left + 12},{innerH / 2}) rotate(-90)"
              text-anchor="middle">{yLabel}</text
            >
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
          <span class="t-val">med {fmtY(active.median)}</span>
          <span class="t-val">Q1 {fmtY(active.q1)} · Q3 {fmtY(active.q3)}</span>
          <span class="t-val">min {fmtY(active.lo)} · max {fmtY(active.hi)}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .ss-boxplot {
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

    .axis-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .whisker {
      stroke: var(--ss-line-strong);
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .box {
      cursor: pointer;
      fill-opacity: 0.18;
      stroke-width: 1.5;
      transition: fill-opacity var(--ss-dur-fast) var(--ss-ease);
      &:hover {
        fill-opacity: 0.3;
      }
      &:focus-visible {
        outline: none;
        stroke: var(--ss-fg);
        stroke-width: 2;
      }
    }

    .median {
      stroke-width: 2;
      shape-rendering: crispEdges;
    }

    .point {
      fill-opacity: 0.6;
      pointer-events: none;
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
  }
</style>
