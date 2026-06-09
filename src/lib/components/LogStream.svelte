<script module lang="ts">
  /** A single log severity level. */
  export type LogLevel = 'info' | 'warn' | 'err' | 'ok'

  /** A controlled log line. `id` is optional — when omitted the index is used as the key. */
  export interface LogLine {
    id?: string | number
    /** Timestamp string (e.g. "12:00:01"); rendered verbatim. */
    t?: string
    lvl: LogLevel
    /** Service / source tag (e.g. "[hub]"). */
    svc?: string
    msg: string
  }

  const LEVELS: LogLevel[] = ['info', 'warn', 'err', 'ok']
</script>

<script lang="ts">
  import { tick, untrack, type Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import EmptyState from './EmptyState.svelte'

  interface Props {
    /** Controlled lines. When provided, the component renders exactly these (capped to `maxLines`). */
    lines?: LogLine[]
    /** Seed lines for the built-in demo stream (only used when `lines` is undefined). */
    initialLines?: Omit<LogLine, 'id'>[]
    /** Generate a random demo stream. Defaults true ONLY when `lines` is not supplied. */
    demo?: boolean
    /** Back-compat alias for `demo` — drives the built-in ticker. */
    live?: boolean
    /** Max number of lines kept in the buffer (oldest dropped). */
    maxLines?: number
    /** Show the controls toolbar (filters, search, wrap, copy, clear). */
    controls?: boolean
    /** Replace the built-in toolbar entirely. */
    toolbar?: Snippet
    /** Wrap long messages (pre-wrap) vs. horizontal scroll (pre). */
    wrap?: boolean
    /** aria-live politeness for the log region. */
    announce?: 'off' | 'polite' | 'assertive'
    /** Accessible label for the log region. */
    ariaLabel?: string
    /** Show a connecting/loading indicator. */
    loading?: boolean
    /** Custom empty state. */
    empty?: Snippet
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  const TEMPLATES: Omit<LogLine, 'id'>[] = [
    { lvl: 'info', svc: '[movies-api]', msg: 'GET /movies?status=to_watch — 3 rows · 4ms' },
    { lvl: 'ok',   svc: '[hub]',        msg: 'GET /api/auth/session — 8ms' },
    { lvl: 'info', svc: '[hub]',        msg: 'session refresh — user=admin' },
    { lvl: 'warn', svc: '[caddy]',      msg: 'tls internal renewing hub.home' },
    { lvl: 'err',  svc: '[tasks-api]',  msg: 'EADDRINUSE :3004 — retrying in 2s' },
    { lvl: 'info', svc: '[notes-api]',  msg: 'slow query · 182ms · SELECT * FROM notes' },
    { lvl: 'ok',   svc: '[meals-api]',  msg: 'POST /meals — created id=m_a4f1 · 6ms' },
    { lvl: 'info', svc: '[movies-api]', msg: 'drizzle migrated 0002 · runtime 12ms' },
  ]

  function pad(n: number) { return String(n).padStart(2, '0') }
  function nowStr() {
    const d = new Date()
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }
  function timeAgo(s: number) {
    const d = new Date(Date.now() - s * 1000)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  let {
    lines,
    initialLines,
    demo,
    live,
    maxLines = 30,
    controls = true,
    toolbar,
    wrap = true,
    announce = 'polite',
    ariaLabel = 'Log output',
    loading = false,
    empty,
    size,
  }: Props = $props()

  // Controlled mode: `lines` (or empty array) supplied → render those, demo off.
  const controlled = $derived(lines !== undefined)
  // Demo defaults on only when uncontrolled. `live`/`demo` either flips it.
  const demoOn = $derived(!controlled && (demo ?? live ?? true))

  // Internal demo buffer.
  const seed = untrack(() => initialLines ?? TEMPLATES)
  let counter = $state(seed.length)
  let demoLines = $state<LogLine[]>(
    seed.map((t, i) => ({ ...t, t: t.t || timeAgo(i * 4), id: i }))
  )

  // The source of truth, capped to maxLines.
  const allLines = $derived(
    (controlled ? (lines as LogLine[]) : demoLines).slice(-maxLines)
  )

  // --- toolbar state ---
  let activeLevels = $state<Set<LogLevel>>(new Set(LEVELS))
  let query = $state('')
  let wrapOn = $state(untrack(() => wrap))
  $effect(() => { wrapOn = wrap })

  const visibleLines = $derived(
    allLines.filter((l) => {
      if (!activeLevels.has(l.lvl)) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        const hay = `${l.t ?? ''} ${l.lvl} ${l.svc ?? ''} ${l.msg}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  )

  function toggleLevel(lvl: LogLevel) {
    const next = new Set(activeLevels)
    if (next.has(lvl)) next.delete(lvl)
    else next.add(lvl)
    activeLevels = next
  }

  async function copyVisible() {
    const text = visibleLines
      .map((l) => `${l.t ?? ''} ${l.lvl.toUpperCase()} ${l.svc ?? ''} ${l.msg}`.trim())
      .join('\n')
    try {
      await navigator.clipboard?.writeText(text)
    } catch {
      /* clipboard unavailable (e.g. insecure context) — no-op */
    }
  }

  function clear() {
    if (controlled) return
    demoLines = []
  }

  // --- follow-tail ---
  let el: HTMLDivElement | undefined
  let following = $state(true)
  const NEAR = 24 // px from bottom considered "at bottom"

  function atBottom() {
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR
  }

  function onScroll() {
    following = atBottom()
  }

  async function jumpToBottom() {
    following = true
    await tick()
    if (el) el.scrollTop = el.scrollHeight
  }

  // Auto-scroll on new content only when following.
  $effect(() => {
    // re-run whenever the visible set changes
    void visibleLines.length
    if (!following) return
    tick().then(() => {
      if (el && untrack(() => following)) el.scrollTop = el.scrollHeight
    })
  })

  // Demo ticker.
  $effect(() => {
    if (!demoOn) return
    const interval = setInterval(() => {
      const pick = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
      demoLines = [...demoLines.slice(-maxLines), { ...pick, t: nowStr(), id: counter++ }]
    }, 1800)
    return () => clearInterval(interval)
  })

  function keyFor(line: LogLine, i: number) {
    return line.id ?? i
  }
</script>

<div class="ss-logs" data-size-variant={resolveComponentSize('LogStream', size)}>
  {#if controls}
    {#if toolbar}
      <div class="bar">{@render toolbar()}</div>
    {:else}
      <div class="bar">
        <div class="filters" role="group" aria-label="Filter by level">
          {#each LEVELS as lvl (lvl)}
            <button
              type="button"
              class="chip {lvl}"
              aria-pressed={activeLevels.has(lvl)}
              onclick={() => toggleLevel(lvl)}
            >{lvl.toUpperCase()}</button>
          {/each}
        </div>
        <input
          class="search"
          type="text"
          placeholder="Filter…"
          aria-label="Filter log text"
          bind:value={query}
        />
        <button
          type="button"
          class="chip"
          aria-pressed={wrapOn}
          onclick={() => (wrapOn = !wrapOn)}
        >WRAP</button>
        <button type="button" class="chip" onclick={copyVisible}>COPY</button>
        {#if !controlled}
          <button type="button" class="chip" onclick={clear}>CLEAR</button>
        {/if}
      </div>
    {/if}
  {/if}

  <div class="viewport">
    <div
      class="scroll"
      class:nowrap={!wrapOn}
      bind:this={el}
      onscroll={onScroll}
      role="log"
      aria-label={ariaLabel}
      aria-live={announce}
      aria-busy={loading}
    >
      {#if loading}
        <div class="status" aria-hidden="true">
          <span class="dot"></span> connecting…
        </div>
      {/if}

      {#if visibleLines.length === 0}
        {#if empty}
          {@render empty()}
        {:else}
          <EmptyState
            title="No log lines"
            message={allLines.length ? 'No lines match the current filters.' : 'Waiting for output…'}
            {size}
          />
        {/if}
      {:else}
        {#each visibleLines as line, i (keyFor(line, i))}
          <div class="ln">
            {#if line.t}<span class="t">{line.t}</span>{/if}
            <span class="lvl {line.lvl}">{line.lvl.toUpperCase()}</span>
            {#if line.svc}<span class="svc">{line.svc}</span>{/if}
            <span class="msg">{line.msg}</span>
          </div>
        {/each}
      {/if}
    </div>

    {#if !following}
      <button type="button" class="jump" onclick={jumpToBottom}>
        Jump to bottom
      </button>
    {/if}
  </div>
</div>

<style lang="scss">
  .ss-logs {
    font-family: var(--ss-font-mono);
    background: var(--ss-code-bg);
    color: var(--ss-code-fg);
    border: 1px solid var(--ss-line);
    display: flex;
    flex-direction: column;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ss-gap-sm);
    padding: var(--ss-gap-sm) var(--ss-panel-body-px);
    border-bottom: 1px solid var(--ss-line);
  }

  .filters {
    display: flex;
    gap: var(--ss-gap-sm);
  }

  .chip {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-sm);
    line-height: 1;
    padding: var(--ss-badge-py) var(--ss-badge-px);
    border: 1px solid var(--ss-line);
    background: transparent;
    color: var(--ss-code-fg);
    cursor: pointer;
    transition: all var(--ss-dur-fast) var(--ss-ease);

    &:hover { border-color: var(--ss-line-strong); }
    &[aria-pressed='true'] { border-color: var(--ss-line-strong); }
    &[aria-pressed='false'] { opacity: 0.45; }

    &.info[aria-pressed='true'] { color: var(--ss-log-info); }
    &.warn[aria-pressed='true'] { color: var(--ss-log-warn); }
    &.err[aria-pressed='true']  { color: var(--ss-log-err); }
    &.ok[aria-pressed='true']   { color: var(--ss-log-ok); }
  }

  .search {
    flex: 1 1 8ch;
    min-width: 8ch;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-sm);
    padding: var(--ss-badge-py) var(--ss-gap-sm);
    border: 1px solid var(--ss-line);
    background: transparent;
    color: var(--ss-code-fg);

    &:focus-visible { outline: 2px solid var(--ss-primary); outline-offset: 1px; }
    &::placeholder { color: var(--ss-fg-faint); }
  }

  .viewport { position: relative; }

  .scroll {
    font-size: var(--ss-ui-md);
    padding: var(--ss-gap) var(--ss-panel-body-px);
    min-height: 160px;
    max-height: 240px;
    overflow: auto;

    .ln {
      display: flex;
      gap: var(--ss-gap-sm);
      line-height: 1.45;
      white-space: pre-wrap;
    }
    &.nowrap .ln {
      white-space: pre;
    }
    .msg { white-space: inherit; }

    .t   { color: var(--ss-fg-faint); min-width: 58px; flex: none; }
    .lvl {
      min-width: 38px;
      flex: none;
      &.info { color: var(--ss-log-info); }
      &.warn { color: var(--ss-log-warn); }
      &.err  { color: var(--ss-log-err); }
      &.ok   { color: var(--ss-log-ok); }
    }
    .svc { color: var(--ss-code-keyword); flex: none; }
  }

  .status {
    display: flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    color: var(--ss-fg-faint);
    font-size: var(--ss-ui-sm);
    padding-bottom: var(--ss-gap-sm);

    .dot {
      width: var(--ss-s-2);
      height: var(--ss-s-2);
      background: var(--ss-primary);
      animation: pulse var(--ss-dur-xslow) var(--ss-ease) infinite;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50%      { opacity: 1; }
  }

  .jump {
    position: absolute;
    right: var(--ss-gap);
    bottom: var(--ss-gap);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-sm);
    line-height: 1;
    padding: var(--ss-badge-py) var(--ss-badge-px);
    border: 1px solid var(--ss-line-strong);
    background: var(--ss-bg-elev);
    color: var(--ss-fg);
    cursor: pointer;
    box-shadow: var(--ss-shadow-2);

    &:hover { border-color: var(--ss-primary); }
    &:focus-visible { outline: 2px solid var(--ss-primary); outline-offset: 1px; }
  }
</style>
