<script module lang="ts">
  export interface BumpSeries {
    /** Competitor label shown at the last node and in the tooltip / accessible name. */
    label: string
    /** 1-based finishing ranks; `ranks[i]` is the rank at stage `i` (length must match `stages`). */
    ranks: number[]
    /** Optional per-series colour; falls back to the cycling palette. */
    color?: string
  }
</script>

<script lang="ts">
  import { CHART_PALETTE } from '../palette.js'
  import { scalePoint, scaleLinear } from 'd3-scale'
  import { line as shapeLine } from 'd3-shape'
  import { max } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** One series per competitor; each carries a `label`, `ranks` and optional `color`. */
    series: BumpSeries[]
    /** Ordered x-axis category labels (e.g. ['G1','G2','G3','G4']). */
    stages: string[]
    /** Draw each series label at its last node (direct labelling). Default true. */
    showLabels?: boolean
    /** Intrinsic drawing height in px. Default 280. */
    height?: number
    /** Intrinsic drawing width in px. Default 480. */
    width?: number
    /** Stretch to the container width via the viewBox (width:100%). */
    fluid?: boolean
    /** Reveal a tooltip on hover/focus of a node. Default true. */
    tooltip?: boolean
    /** SR summary + accessible name; auto-generated when absent. */
    summary?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    series,
    stages,
    showLabels = true,
    height = 280,
    width = 480,
    fluid = false,
    tooltip = true,
    summary,
    size,
  }: Props = $props()

  const PALETTE = CHART_PALETTE

  const M = { top: 12, right: 56, bottom: 28, left: 32 }

  const cleanSeries = $derived((series ?? []).filter((s) => s && Array.isArray(s.ranks)))
  const cleanStages = $derived(stages ?? [])
  const isEmpty = $derived(cleanSeries.length === 0 || cleanStages.length === 0)

  function colorFor(s: BumpSeries, i: number): string {
    return s.color ?? PALETTE[i % PALETTE.length]
  }

  const innerW = $derived(Math.max(0, width - M.left - M.right))
  const innerH = $derived(Math.max(0, height - M.top - M.bottom))

  // Highest rank present across all series; default to the competitor count.
  const maxRank = $derived(
    max(cleanSeries.flatMap((s) => s.ranks.filter((r) => Number.isFinite(r)))) ??
      cleanSeries.length,
  )

  // x over stages; y maps rank 1 → top (0) and maxRank → bottom (innerH).
  const xScaleObj = $derived(
    scalePoint<string>().domain(cleanStages).range([0, innerW]).padding(0.5),
  )
  const yScaleObj = $derived(scaleLinear().domain([1, maxRank]).range([0, innerH]))

  // Integer rank ticks 1..maxRank.
  const rankTicks = $derived(
    Array.from({ length: Math.max(1, Math.round(maxRank)) }, (_, i) => i + 1),
  )

  // One node per (series, stage) where the rank is finite.
  const seriesNodes = $derived(
    cleanSeries.map((s, i) => {
      const color = colorFor(s, i)
      const nodes = cleanStages
        .map((stage, j) => {
          const rank = s.ranks[j]
          if (!Number.isFinite(rank)) return null
          return {
            cx: xScaleObj(stage) ?? 0,
            cy: yScaleObj(rank),
            stage,
            rank,
            label: s.label,
            color,
          }
        })
        .filter((n): n is NonNullable<typeof n> => n !== null)
      return { label: s.label, color, nodes }
    }),
  )

  const lineGen = $derived(
    shapeLine<{ cx: number; cy: number }>()
      .x((n) => n.cx)
      .y((n) => n.cy),
  )

  const linePaths = $derived(
    seriesNodes.map((s) => ({
      d: lineGen(s.nodes) ?? '',
      color: s.color,
      label: s.label,
    })),
  )

  // Last node of each series for direct labelling.
  const endLabels = $derived.by(() => {
    if (!showLabels) return [] as { x: number; y: number; color: string; label: string }[]
    return seriesNodes
      .filter((s) => s.nodes.length > 0)
      .map((s) => {
        const last = s.nodes[s.nodes.length - 1]
        return { x: last.cx + 8, y: last.cy, color: s.color, label: s.label }
      })
  })

  const autoSummary = $derived.by(() => {
    if (isEmpty) return 'No data'
    const stageNames = cleanStages.join(', ')
    return `Bump chart with ${cleanSeries.length} series over ${cleanStages.length} stages (${stageNames}).`
  })
  const srText = $derived(summary ?? autoSummary)

  const resolvedSize = $derived(resolveComponentSize('Chart', size))

  let active = $state<{
    label: string
    stage: string
    rank: number
    cx: number
    cy: number
  } | null>(null)
  function show(label: string, stage: string, rank: number, cx: number, cy: number) {
    if (tooltip) active = { label, stage, rank, cx, cy }
  }
  function hide() {
    active = null
  }
  function nodeLabel(label: string, stage: string, rank: number): string {
    return `${label}: ${stage}, rank ${rank}`
  }
</script>

<div class="ss-bump" class:fluid data-size-variant={resolvedSize} role="group" aria-label={srText}>
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
          <!-- gridlines + y axis (rank ticks) -->
          {#each rankTicks as t}
            <line class="grid" x1="0" x2={innerW} y1={yScaleObj(t)} y2={yScaleObj(t)} />
            <text class="tick y" x="-6" y={yScaleObj(t)} dy="0.32em" text-anchor="end">{t}</text>
          {/each}
          <line class="axis" x1="0" x2="0" y1="0" y2={innerH} />
          <line class="axis" x1="0" x2={innerW} y1={innerH} y2={innerH} />

          <!-- x axis (stage labels) -->
          {#each cleanStages as stage}
            <text class="tick x" x={xScaleObj(stage)} y={innerH + 16} text-anchor="middle"
              >{stage}</text
            >
          {/each}

          <!-- connecting lines -->
          {#each linePaths as p}
            <path class="line" d={p.d} style="stroke:{p.color}" />
          {/each}

          <!-- nodes -->
          {#each seriesNodes as s}
            {#each s.nodes as n}
              <circle
                class="node"
                cx={n.cx}
                cy={n.cy}
                r="5"
                style="fill:{n.color}"
                tabindex="0"
                role="button"
                aria-label={nodeLabel(n.label, n.stage, n.rank)}
                onfocus={() => show(n.label, n.stage, n.rank, n.cx, n.cy)}
                onblur={hide}
                onmouseenter={() => show(n.label, n.stage, n.rank, n.cx, n.cy)}
                onmouseleave={hide}
              />
            {/each}
          {/each}

          <!-- direct series labels -->
          {#each endLabels as l}
            <text class="series-label" x={l.x} y={l.y} dy="0.32em" style="fill:{l.color}"
              >{l.label}</text
            >
          {/each}
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
          <span class="t-val">{active.stage} · rank {active.rank}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .ss-bump {
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

    .node {
      cursor: pointer;
      transition: r var(--ss-dur-fast) var(--ss-ease);
      &:hover,
      &:focus-visible {
        outline: none;
        r: 7;
      }
      &:focus-visible {
        stroke: var(--ss-fg);
        stroke-width: 2;
      }
    }

    .series-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
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
