<script module lang="ts">
  export interface ScatterPoint {
    /** Label shown next to the dot and in the tooltip / accessible name. */
    label: string
    x: number
    y: number
    /** Optional magnitude → bubble area (sqrt-scaled radius). Omit for a fixed dot. */
    size?: number
    /** Optional per-point colour; falls back to the cycling palette. */
    color?: string
  }
</script>

<script lang="ts">
  import { scaleLinear, scaleSqrt } from 'd3-scale'
  import { extent, max } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** One dot per datum. Two encoded axes (x, y), optional `size` and `color`. */
    points: ScatterPoint[]
    /** X axis caption (drawn under the axis). */
    xLabel?: string
    /** Y axis caption (drawn rotated beside the axis). */
    yLabel?: string
    /** Draw a dashed vertical reference line at this x (e.g. the median) → quadrants. */
    xRef?: number
    /** Draw a dashed horizontal reference line at this y (e.g. the median) → quadrants. */
    yRef?: number
    /** Corner captions for the four quadrants (needs xRef + yRef to read well). */
    quadrantLabels?: { tl?: string; tr?: string; bl?: string; br?: string }
    /** Force the x domain; defaults to the padded data extent. */
    xDomain?: [number, number]
    /** Force the y domain; defaults to the padded data extent. */
    yDomain?: [number, number]
    /** Format an x value for ticks + tooltip. */
    xFormat?: (x: number) => string
    /** Format a y value for ticks + tooltip. */
    yFormat?: (y: number) => string
    /** Draw each point's label next to its dot. Default true. */
    showLabels?: boolean
    /** Intrinsic drawing height in px. Default 320. */
    height?: number
    /** Intrinsic drawing width in px. Default 420. */
    width?: number
    /** Stretch to the container width via the viewBox (width:100%). */
    fluid?: boolean
    /** Reveal a tooltip on hover/focus of a point. Default true. */
    tooltip?: boolean
    /** SR summary + accessible name; auto-generated when absent. */
    summary?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    points,
    xLabel,
    yLabel,
    xRef,
    yRef,
    quadrantLabels,
    xDomain,
    yDomain,
    xFormat,
    yFormat,
    showLabels = true,
    height = 320,
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

  const clean = $derived(
    (points ?? []).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y)),
  )
  const isEmpty = $derived(clean.length === 0)

  function colorFor(p: ScatterPoint, i: number): string {
    return p.color ?? PALETTE[i % PALETTE.length]
  }

  const innerW = $derived(Math.max(0, width - M.left - M.right))
  const innerH = $derived(Math.max(0, height - M.top - M.bottom))

  const fmtX = $derived(xFormat ?? ((x: number) => String(x)))
  const fmtY = $derived(yFormat ?? ((y: number) => String(y)))

  /** Data extent padded by 8% each side; a flat axis is expanded to ±1. */
  function paddedExtent(values: number[]): [number, number] {
    const e = extent(values) as [number, number]
    if (e[0] === undefined) return [0, 1]
    if (e[0] === e[1]) return [e[0] - 1, e[1] + 1]
    const pad = (e[1] - e[0]) * 0.08
    return [e[0] - pad, e[1] + pad]
  }

  const xDom = $derived(xDomain ?? paddedExtent(clean.map((p) => p.x)))
  const yDom = $derived(yDomain ?? paddedExtent(clean.map((p) => p.y)))

  const xScaleObj = $derived(scaleLinear().domain(xDom).nice().range([0, innerW]))
  const yScaleObj = $derived(scaleLinear().domain(yDom).nice().range([innerH, 0]))

  // Bubble radius: sqrt scale (area-true) when any point carries a size, else fixed.
  const hasSizes = $derived(clean.some((p) => typeof p.size === 'number'))
  const rScaleObj = $derived(
    scaleSqrt()
      .domain([0, max(clean, (p) => p.size ?? 0) || 1])
      .range([4, 16]),
  )
  function radiusFor(p: ScatterPoint): number {
    return hasSizes ? rScaleObj(p.size ?? 0) : 5
  }

  const xTicks = $derived(xScaleObj.ticks(5))
  const yTicks = $derived(yScaleObj.ticks(5))

  const marks = $derived(
    clean.map((p, i) => ({
      cx: xScaleObj(p.x),
      cy: yScaleObj(p.y),
      r: radiusFor(p),
      color: colorFor(p, i),
      label: p.label,
      x: p.x,
      y: p.y,
    })),
  )

  const corners = $derived.by(() => {
    if (!quadrantLabels) return [] as { x: number; y: number; anchor: string; text: string }[]
    const pad = 4
    const out: { x: number; y: number; anchor: string; text: string }[] = []
    if (quadrantLabels.tl)
      out.push({ x: pad, y: pad + 8, anchor: 'start', text: quadrantLabels.tl })
    if (quadrantLabels.tr)
      out.push({ x: innerW - pad, y: pad + 8, anchor: 'end', text: quadrantLabels.tr })
    if (quadrantLabels.bl)
      out.push({ x: pad, y: innerH - pad, anchor: 'start', text: quadrantLabels.bl })
    if (quadrantLabels.br)
      out.push({ x: innerW - pad, y: innerH - pad, anchor: 'end', text: quadrantLabels.br })
    return out
  })

  const autoSummary = $derived.by(() => {
    if (isEmpty) return 'No data'
    const names = clean.map((p) => p.label).join(', ')
    return `Scatter plot with ${clean.length} points (${names}).`
  })
  const srText = $derived(summary ?? autoSummary)

  const resolvedSize = $derived(resolveComponentSize('Chart', size))

  let active = $state<{ label: string; x: number; y: number; cx: number; cy: number } | null>(null)
  function show(label: string, x: number, y: number, cx: number, cy: number) {
    if (tooltip) active = { label, x, y, cx, cy }
  }
  function hide() {
    active = null
  }
  function datumLabel(label: string, x: number, y: number): string {
    return `${label}: ${fmtX(x)}, ${fmtY(y)}`
  }
</script>

<div
  class="ss-scatter"
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
            <text class="tick y" x="-6" y={yScaleObj(t)} dy="0.32em" text-anchor="end"
              >{fmtY(t)}</text
            >
          {/each}
          {#each xTicks as t}
            <text class="tick x" x={xScaleObj(t)} y={innerH + 16} text-anchor="middle"
              >{fmtX(t)}</text
            >
          {/each}
          <line class="axis" x1="0" x2="0" y1="0" y2={innerH} />
          <line class="axis" x1="0" x2={innerW} y1={innerH} y2={innerH} />

          <!-- quadrant reference lines -->
          {#if xRef !== undefined}
            <line class="ref" x1={xScaleObj(xRef)} x2={xScaleObj(xRef)} y1="0" y2={innerH} />
          {/if}
          {#if yRef !== undefined}
            <line class="ref" x1="0" x2={innerW} y1={yScaleObj(yRef)} y2={yScaleObj(yRef)} />
          {/if}

          <!-- quadrant captions -->
          {#each corners as c}
            <text class="quadrant" x={c.x} y={c.y} text-anchor={c.anchor}>{c.text}</text>
          {/each}

          <!-- points -->
          {#each marks as m}
            <circle
              class="point"
              cx={m.cx}
              cy={m.cy}
              r={m.r}
              style="fill:{m.color}"
              tabindex="0"
              role="button"
              aria-label={datumLabel(m.label, m.x, m.y)}
              onfocus={() => show(m.label, m.x, m.y, m.cx, m.cy)}
              onblur={hide}
              onmouseenter={() => show(m.label, m.x, m.y, m.cx, m.cy)}
              onmouseleave={hide}
            />
            {#if showLabels}
              <text class="point-label" x={m.cx + m.r + 4} y={m.cy} dy="0.32em">{m.label}</text>
            {/if}
          {/each}

          <!-- axis captions -->
          {#if xLabel}
            <text class="axis-label x" x={innerW / 2} y={innerH + 32} text-anchor="middle"
              >{xLabel}</text
            >
          {/if}
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
          <span class="t-val">{fmtX(active.x)} · {fmtY(active.y)}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .ss-scatter {
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

    .ref {
      stroke: var(--ss-line-strong);
      stroke-width: 1;
      stroke-dasharray: 3 3;
      shape-rendering: crispEdges;
    }

    .tick {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .quadrant {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
      opacity: 0.75;
    }

    .axis-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .point {
      cursor: pointer;
      fill-opacity: 0.85;
      transition: fill-opacity var(--ss-dur-fast) var(--ss-ease);
      &:hover {
        fill-opacity: 1;
      }
      &:focus-visible {
        outline: none;
        stroke: var(--ss-fg);
        stroke-width: 2;
      }
    }

    .point-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg);
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
