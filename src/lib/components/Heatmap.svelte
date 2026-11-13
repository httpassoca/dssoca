<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import { extent } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'
  import { chartNavStep } from '../chart-nav.js'

  interface Props {
    /** Row labels, top→bottom. */
    rows: string[]
    /** Column labels, left→right. */
    columns: string[]
    /** values[r][c]; `null` renders a blank cell excluded from the colour scale (e.g. the diagonal). */
    values: (number | null)[][]
    /** Value range mapped to colour intensity; defaults to the [min, max] of all non-null values. */
    domain?: [number, number]
    /** Format a cell value for its text + tooltip. */
    valueFormat?: (v: number) => string
    /** Render the value text inside each cell. Default true. When false, a min→max legend is
     * drawn instead so intensity is not the only cue. */
    showValues?: boolean
    /** X axis caption (drawn under the column headers). */
    xLabel?: string
    /** Y axis caption (drawn rotated beside the row headers). */
    yLabel?: string
    /** Square cell size in px. Default 48. */
    cellSize?: number
    /** Reveal a tooltip on hover/focus of a cell. Default true. */
    tooltip?: boolean
    /** SR summary + accessible name; auto-generated when absent. */
    summary?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    rows,
    columns,
    values,
    domain,
    valueFormat,
    showValues = true,
    xLabel,
    yLabel,
    cellSize = 48,
    tooltip = true,
    summary,
    size,
  }: Props = $props()

  const cleanRows = $derived(rows ?? [])
  const cleanCols = $derived(columns ?? [])
  const isEmpty = $derived(cleanRows.length === 0 || cleanCols.length === 0)

  const fmt = $derived(valueFormat ?? ((v: number) => String(v)))

  // Header gutters + optional axis-label room.
  const headLeft = $derived(72 + (yLabel ? 20 : 0))
  const headTop = 28
  const labelBottom = $derived(xLabel ? 24 : 0)

  const gridW = $derived(cleanCols.length * cellSize)
  const gridH = $derived(cleanRows.length * cellSize)
  const width = $derived(headLeft + gridW)
  const height = $derived(headTop + gridH + labelBottom)

  function valueAt(r: number, c: number): number | null {
    const v = values?.[r]?.[c]
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }

  const allValues = $derived.by(() => {
    const out: number[] = []
    for (let r = 0; r < cleanRows.length; r++) {
      for (let c = 0; c < cleanCols.length; c++) {
        const v = valueAt(r, c)
        if (v !== null) out.push(v)
      }
    }
    return out
  })

  const dom = $derived.by<[number, number]>(() => {
    if (domain) return domain
    const e = extent(allValues) as [number, number]
    if (e[0] === undefined) return [0, 1]
    if (e[0] === e[1]) return [e[0], e[1] + 1]
    return e
  })

  // Opacity on the primary token encodes intensity.
  const opacityScale = $derived(scaleLinear().domain(dom).range([0.12, 1]).clamp(true))

  // Grid rows of cells; `i` is the row-major index used by the roving tabindex.
  const gridRows = $derived.by(() =>
    cleanRows.map((row, r) =>
      cleanCols.map((col, c) => {
        const v = valueAt(r, c)
        return {
          i: r * cleanCols.length + c,
          r,
          c,
          row,
          col,
          x: headLeft + c * cellSize,
          y: headTop + r * cellSize,
          value: v,
          opacity: v === null ? 0 : opacityScale(v),
        }
      }),
    ),
  )
  const cellCount = $derived(cleanRows.length * cleanCols.length)

  // Legend swatches (shown when values are not printed in the cells).
  const LEGEND_STEPS = 5
  const legendStops = $derived(
    Array.from({ length: LEGEND_STEPS }, (_, k) =>
      opacityScale(dom[0] + ((dom[1] - dom[0]) * k) / (LEGEND_STEPS - 1)),
    ),
  )

  // Roving tabindex: the whole grid is one tab stop (DS-0161 / chart-nav.ts).
  let focusIndex = $state(0)
  const tabStop = $derived(Math.min(focusIndex, Math.max(0, cellCount - 1)))
  let gridEl = $state<SVGGElement | null>(null)

  function onCellKeydown(e: KeyboardEvent, i: number) {
    // SVG geometry does not mirror in RTL, so Left/Right stay physical.
    const next = chartNavStep(e.key, i, cellCount, cleanCols.length)
    if (next === null) return
    e.preventDefault()
    focusIndex = next
    gridEl?.querySelector<SVGElement>(`[data-index="${next}"]`)?.focus()
  }

  const autoSummary = $derived.by(() => {
    if (isEmpty) return 'No data'
    return `Heatmap, ${cleanRows.length} rows × ${cleanCols.length} columns.`
  })
  const srText = $derived(summary ?? autoSummary)

  const resolvedSize = $derived(resolveComponentSize('Chart', size))

  let active = $state<{ row: string; col: string; value: number; cx: number; cy: number } | null>(
    null,
  )
  function show(row: string, col: string, value: number, cx: number, cy: number) {
    if (tooltip) active = { row, col, value, cx, cy }
  }
  function hide() {
    active = null
  }
  function cellLabel(row: string, col: string, value: number | null): string {
    return `${row} vs ${col}: ${value === null ? 'no value' : fmt(value)}`
  }
</script>

<!-- Escape dismisses the tooltip wherever focus is, incl. one opened by hover (WCAG 1.4.13). -->
<svelte:window
  onkeydown={(e) => {
    if (active && e.key === 'Escape') hide()
  }}
/>

<div class="ss-heatmap" data-size-variant={resolvedSize} role="group" aria-label={srText}>
  {#if isEmpty}
    <span class="empty" aria-hidden="true">—</span>
    <span class="sr-only">No data</span>
  {:else}
    <div class="plot">
      <svg
        class="canvas"
        viewBox="0 0 {width} {height}"
        {width}
        {height}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <!-- column headers -->
        {#each cleanCols as col, c (c)}
          <text
            class="header col"
            x={headLeft + c * cellSize + cellSize / 2}
            y={headTop - 8}
            text-anchor="middle">{col}</text
          >
        {/each}

        <!-- row headers -->
        {#each cleanRows as row, r (r)}
          <text
            class="header row"
            x={headLeft - 8}
            y={headTop + r * cellSize + cellSize / 2}
            dy="0.32em"
            text-anchor="end">{row}</text
          >
        {/each}

        <!-- cells: role=grid > row > gridcell, one tab stop with arrow-key navigation -->
        <g role="grid" bind:this={gridEl}>
          {#each gridRows as cells, r (r)}
            <g role="row">
              {#each cells as cell (cell.i)}
                <rect
                  class="cell"
                  class:cell-empty={cell.value === null}
                  x={cell.x}
                  y={cell.y}
                  width={cellSize}
                  height={cellSize}
                  fill={cell.value === null ? undefined : 'var(--ss-primary)'}
                  fill-opacity={cell.value === null ? undefined : cell.opacity}
                  role="gridcell"
                  tabindex={cell.i === tabStop ? 0 : -1}
                  data-index={cell.i}
                  aria-label={cellLabel(cell.row, cell.col, cell.value)}
                  onfocus={() => {
                    focusIndex = cell.i
                    if (cell.value !== null)
                      show(cell.row, cell.col, cell.value, cell.x + cellSize / 2, cell.y)
                  }}
                  onblur={hide}
                  onkeydown={(e) => onCellKeydown(e, cell.i)}
                  onmouseenter={() => {
                    if (cell.value !== null)
                      show(cell.row, cell.col, cell.value, cell.x + cellSize / 2, cell.y)
                  }}
                  onmouseleave={hide}
                />
                {#if showValues && cell.value !== null}
                  <text
                    class="cell-text"
                    x={cell.x + cellSize / 2}
                    y={cell.y + cellSize / 2}
                    dy="0.32em"
                    text-anchor="middle"
                    aria-hidden="true">{fmt(cell.value)}</text
                  >
                {/if}
              {/each}
            </g>
          {/each}
        </g>

        <!-- axis captions -->
        {#if xLabel}
          <text class="axis-label x" x={headLeft + gridW / 2} y={height - 6} text-anchor="middle"
            >{xLabel}</text
          >
        {/if}
        {#if yLabel}
          <text
            class="axis-label y"
            transform="translate(12,{headTop + gridH / 2}) rotate(-90)"
            text-anchor="middle">{yLabel}</text
          >
        {/if}
      </svg>

      {#if tooltip && active}
        <div
          class="tooltip"
          aria-hidden="true"
          style="left:{(active.cx / width) * 100}%;top:{(active.cy / height) * 100}%"
        >
          <span class="t-label">{active.row} · {active.col}</span>
          <span class="t-val">{fmt(active.value)}</span>
        </div>
      {/if}
    </div>
    {#if !showValues}
      <!-- Visual-only scale key: every cell's aria-label already carries its value. -->
      <div class="legend" aria-hidden="true">
        <span class="legend-val">{fmt(dom[0])}</span>
        <span class="legend-ramp" aria-hidden="true">
          {#each legendStops as o, k (k)}
            <span class="legend-step" style="opacity:{o}"></span>
          {/each}
        </span>
        <span class="legend-val">{fmt(dom[1])}</span>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .ss-heatmap {
    display: inline-flex;
    flex-direction: column;
    gap: var(--ss-gap-sm);
    font-family: var(--ss-font-body);
    color: var(--ss-fg);
    max-width: 100%;

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

    .header {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .axis-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg-muted);
    }

    .cell {
      stroke: var(--ss-line);
      stroke-width: 1;
      cursor: default; // data marks are not clickable
      shape-rendering: crispEdges;
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

    .cell-empty {
      fill: none;
      cursor: default;
    }

    /* Value text: --ss-fg glyphs on a --ss-bg halo, so the glyph's immediate background is
       always --ss-bg whatever the cell opacity (≥13.9:1 in both themes; see DS-0164). A
       two-colour flip cannot reach 4.5:1 across the mid-opacity band. */
    .cell-text {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      fill: var(--ss-fg);
      stroke: var(--ss-bg);
      stroke-width: 0.3em;
      stroke-linejoin: round;
      paint-order: stroke fill;
      pointer-events: none;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: var(--ss-gap-xs);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
    }

    .legend-ramp {
      display: inline-flex;
      border: 1px solid var(--ss-line);
    }

    .legend-step {
      inline-size: var(--ss-icon);
      block-size: var(--ss-gap-sm);
      background: var(--ss-primary);
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
