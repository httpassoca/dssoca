<script lang="ts">
  import { scaleLinear } from 'd3-scale'
  import { extent } from 'd3-array'
  import { resolveComponentSize, type Size } from '../config.js'

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
    /** Render the value text inside each cell. Default true. */
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

  const cells = $derived.by(() =>
    cleanRows.flatMap((row, r) =>
      cleanCols.map((col, c) => {
        const v = valueAt(r, c)
        return {
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
  function cellLabel(row: string, col: string, value: number): string {
    return `${row} vs ${col}: ${fmt(value)}`
  }
</script>

<div
  class="ss-heatmap"
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
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <!-- column headers -->
        {#each cleanCols as col, c}
          <text
            class="header col"
            x={headLeft + c * cellSize + cellSize / 2}
            y={headTop - 8}
            text-anchor="middle">{col}</text
          >
        {/each}

        <!-- row headers -->
        {#each cleanRows as row, r}
          <text
            class="header row"
            x={headLeft - 8}
            y={headTop + r * cellSize + cellSize / 2}
            dy="0.32em"
            text-anchor="end">{row}</text
          >
        {/each}

        <!-- cells -->
        {#each cells as cell}
          {#if cell.value === null}
            <rect
              class="cell cell-empty"
              x={cell.x}
              y={cell.y}
              width={cellSize}
              height={cellSize}
              aria-hidden="true"
            />
          {:else}
            <rect
              class="cell"
              x={cell.x}
              y={cell.y}
              width={cellSize}
              height={cellSize}
              fill="var(--ss-primary)"
              fill-opacity={cell.opacity}
              tabindex="0"
              role="button"
              aria-label={cellLabel(cell.row, cell.col, cell.value)}
              onfocus={() => show(cell.row, cell.col, cell.value!, cell.x + cellSize / 2, cell.y)}
              onblur={hide}
              onmouseenter={() =>
                show(cell.row, cell.col, cell.value!, cell.x + cellSize / 2, cell.y)}
              onmouseleave={hide}
            />
            {#if showValues}
              <text
                class="cell-text"
                x={cell.x + cellSize / 2}
                y={cell.y + cellSize / 2}
                dy="0.32em"
                text-anchor="middle">{fmt(cell.value)}</text
              >
            {/if}
          {/if}
        {/each}

        <!-- axis captions -->
        {#if xLabel}
          <text
            class="axis-label x"
            x={headLeft + gridW / 2}
            y={height - 6}
            text-anchor="middle">{xLabel}</text
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
          role="status"
          style="left:{((active.cx) / width) * 100}%;top:{((active.cy) / height) * 100}%"
        >
          <span class="t-label">{active.row} · {active.col}</span>
          <span class="t-val">{fmt(active.value)}</span>
        </div>
      {/if}
    </div>
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
      cursor: pointer;
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

    .cell-text {
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
