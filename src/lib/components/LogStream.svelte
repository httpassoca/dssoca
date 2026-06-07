<script lang="ts">
  import { tick, untrack } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface LogLine { id: number; t: string; lvl: string; svc: string; msg: string }

  interface Props {
    live?: boolean
    initialLines?: Omit<LogLine, 'id'>[]
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  const TEMPLATES = [
    { lvl: 'info', svc: '[movies-api]', msg: 'GET /movies?status=to_watch — 3 rows · 4ms' },
    { lvl: 'ok',   svc: '[hub]',        msg: 'GET /api/auth/session — 8ms' },
    { lvl: 'info', svc: '[hub]',        msg: 'session refresh — user=rafael' },
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

  let { live = true, initialLines, size }: Props = $props()

  const seed = untrack(() => initialLines ?? TEMPLATES)
  let counter = $state(seed.length)
  let lines = $state<LogLine[]>(seed.map((t, i) => ({ ...t, t: timeAgo(i * 4), id: i })))

  let el: HTMLDivElement | undefined

  $effect(() => {
    if (!live) return
    const interval = setInterval(async () => {
      const pick = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
      lines = [...lines.slice(-30), { ...pick, t: nowStr(), id: counter++ }]
      await tick()
      if (el) el.scrollTop = el.scrollHeight
    }, 1800)
    return () => clearInterval(interval)
  })
</script>

<div class="ss-logs" bind:this={el} data-size-variant={resolveComponentSize('LogStream', size)}>
  {#each lines as line (line.id)}
    <div class="ln">
      <span class="t">{line.t}</span>
      <span class="lvl {line.lvl}">{line.lvl.toUpperCase()}</span>
      <span class="svc">{line.svc}</span>
      <span>{line.msg}</span>
    </div>
  {/each}
</div>

<style lang="scss">
  .ss-logs {
    font-family: var(--ss-font-mono); font-size: var(--ss-ui-md);
    background: #0a0a0a; color: var(--ss-code-fg);
    padding: var(--ss-gap) var(--ss-panel-body-px);
    min-height: 160px; max-height: 240px; overflow: auto;

    .ln { display: flex; gap: 10px; line-height: 1.45; }
    .t  { color: var(--ss-fg-faint); min-width: 58px; }
    .lvl {
      min-width: 38px;
      &.info { color: var(--ss-cyan); }
      &.warn { color: var(--ss-yellow); }
      &.err  { color: var(--ss-red); }
      &.ok   { color: var(--ss-primary); }
    }
    .svc { color: var(--ss-purple); }
  }
</style>
