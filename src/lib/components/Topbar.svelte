<script lang="ts">
  import PassocaMark from './PassocaMark.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    active?: string
    user?: string
    tabs?: string[]
    onTab?: (tab: string) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let {
    active = 'overview',
    user = 'rafael@hub.home',
    tabs = ['overview', 'services', 'logs', 'shell'],
    onTab,
    size,
  }: Props = $props()

  function pad(n: number) { return String(n).padStart(2, '0') }
  function nowStr() {
    const d = new Date()
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  let clock = $state(nowStr())
  $effect(() => {
    const t = setInterval(() => { clock = nowStr() }, 1000)
    return () => clearInterval(t)
  })

  const [h, m, s] = $derived(clock.split(':'))
</script>

<div class="ss-topbar" data-size-variant={resolveComponentSize('Topbar', size)}>
  <div class="seg logo">
    <PassocaMark px={14} />
    <span class="nm">hubssoca</span>
  </div>
  <div class="ws">
    {#each tabs as tab, i}
      <button
        class="tab {tab === active ? 'active' : ''}"
        onclick={() => onTab?.(tab)}
      >
        <span class="n">{i + 1}</span>{tab}
      </button>
    {/each}
  </div>
  <div class="grow"></div>
  <div class="seg right" title="services">
    <span class="dot"></span>
    <span class="stat"><span class="v">6</span><span class="k">/7 up</span></span>
  </div>
  <div class="seg right stat" title="cpu"><span class="k">cpu</span><span class="v">62%</span></div>
  <div class="seg right stat" title="memory"><span class="k">mem</span><span class="v">3.8G</span></div>
  <div class="seg right stat" title="network"><span class="k">net</span><span class="v">↓1.2 ↑0.3</span></div>
  <div class="seg right click"><span class="kbd">⌘K</span></div>
  <div class="seg right click">{user}</div>
  <div class="seg right clock">
    <span>{h}</span><span class="sep">:</span><span>{m}</span><span class="sep">:</span><span>{s}</span>
  </div>
</div>

<style lang="scss">
  .ss-topbar {
    grid-column: 1 / -1;
    display: flex; align-items: stretch;
    background: var(--ss-bg);
    border-bottom: 1px solid var(--ss-line);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-md);
    color: var(--ss-fg-muted);
    user-select: none;
    position: sticky; top: 0; z-index: 10;

    .seg {
      display: flex; align-items: center; gap: 8px;
      padding: 0 var(--ss-panel-head-px);
      border-right: 1px solid var(--ss-line);
      cursor: default;

      &.right { border-right: none; border-left: 1px solid var(--ss-line); }
      &.click { cursor: pointer; }
      &.click:hover { background: rgba(255,255,255,.03); color: var(--ss-fg); }
    }
    .logo {
      color: var(--ss-fg);
      .nm { font-family: var(--ss-font-display); font-size: var(--ss-ui-lg); letter-spacing: 0.02em; line-height: 1; }
    }
    .ws {
      display: flex; align-items: stretch;
      .tab {
        display: flex; align-items: center;
        padding: 0 var(--ss-row-px);
        color: var(--ss-fg-faint);
        border-right: 1px solid var(--ss-line);
        cursor: pointer;
        font: 500 var(--ss-ui-md) var(--ss-font-mono);
        background: transparent; border-top: 0; border-bottom: 0; border-left: 0;
        transition: all var(--ss-dur-fast) var(--ss-ease);

        &:hover { color: var(--ss-fg); background: rgba(255,255,255,.03); }
        .n { color: var(--ss-fg-faint); margin-right: 6px; }
        &.active { color: var(--ss-fg); background: rgba(102,239,115,.06); box-shadow: inset 0 -2px 0 var(--ss-primary); }
        &.active .n { color: var(--ss-primary); }
      }
    }
    .grow { flex: 1; }
    .dot { width: 6px; height: 6px; background: var(--ss-primary); display: inline-block; }
    .stat {
      font-variant-numeric: tabular-nums;
      .k { color: var(--ss-fg-faint); margin-right: 4px; }
      .v { color: var(--ss-fg); }
    }
    .clock {
      color: var(--ss-fg); font-variant-numeric: tabular-nums;
      .sep { color: var(--ss-fg-faint); margin: 0 2px; }
    }
    .kbd { font-family: var(--ss-font-mono); font-size: var(--ss-ui-sm); color: var(--ss-fg-muted); border: 1px solid var(--ss-line); padding: 2px 5px; line-height: 1; }
  }
</style>
