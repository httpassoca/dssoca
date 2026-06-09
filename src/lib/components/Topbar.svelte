<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Stat { key: string; value: string; title?: string }

  interface Props {
    active?: string
    user?: string
    tabs?: string[]
    onTab?: (tab: string) => void
    /** Fired when the command menu is opened (chip click or Cmd/Ctrl+K). */
    onCommand?: () => void
    /** Fired when the user chip is activated (when no `userMenu` snippet given). */
    onUser?: () => void
    /** Custom user/avatar control rendered on the right; overrides the default user button. */
    userMenu?: Snippet
    /** Custom brand mark + name; defaults to the built-in logo. */
    brand?: Snippet
    /** Right-aligned stat segments; defaults to the built-in homelab stats. */
    stats?: Stat[]
    /** Anchor the skip link jumps to. */
    skipTarget?: string
    /** When true, the header sticks to the top of the viewport. */
    sticky?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  const DEFAULT_STATS: Stat[] = [
    { key: 'cpu', value: '62%', title: 'cpu' },
    { key: 'mem', value: '3.8G', title: 'memory' },
    { key: 'net', value: '↓1.2 ↑0.3', title: 'network' },
  ]

  let {
    active = 'overview',
    user = 'admin@hub.home',
    tabs = ['overview', 'services', 'logs', 'shell'],
    onTab,
    onCommand,
    onUser,
    userMenu,
    brand,
    stats = DEFAULT_STATS,
    skipTarget = '#main',
    sticky = true,
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
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        onCommand?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(t)
      window.removeEventListener('keydown', onKey)
    }
  })

  const [h, m, s] = $derived(clock.split(':'))

  // Roving tabindex: arrow keys move focus across the tab strip (wrapping),
  // Home/End jump to the ends. The active tab is the single tab stop.
  let tabEls: HTMLButtonElement[] = $state([])
  function focusTab(i: number) {
    const n = tabs.length
    if (!n) return
    const idx = ((i % n) + n) % n
    tabEls[idx]?.focus()
  }
  function onTabKeydown(e: KeyboardEvent, i: number) {
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); focusTab(i + 1); break
      case 'ArrowLeft':  case 'ArrowUp':   e.preventDefault(); focusTab(i - 1); break
      case 'Home':                         e.preventDefault(); focusTab(0); break
      case 'End':                          e.preventDefault(); focusTab(tabs.length - 1); break
    }
  }
</script>

<header class="ss-topbar" class:sticky data-size-variant={resolveComponentSize('Topbar', size)}>
  <a class="skip" href={skipTarget}>Skip to content</a>

  <div class="seg logo">
    {#if brand}
      {@render brand()}
    {:else}
      <svg class="mark" viewBox="0 0 103 89" fill="var(--ss-primary)" width="14" height="14" aria-hidden="true">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M51.5 0L0 89H103L51.5 0ZM23.8643 80.151H87.6468L71.6884 52.5724L23.8643 80.151ZM65.5911 42.0354L60.7383 33.649L46.1956 42.0354H65.5911ZM56.14 25.7024L51.5 17.6837L42.2125 33.7339L56.14 25.7024ZM32.0977 51.2138L20.2949 71.6111L55.6656 51.2138H32.0977Z"
        />
      </svg>
      <span class="nm">hubssoca</span>
    {/if}
  </div>

  <nav class="ws" aria-label="Primary">
    {#each tabs as tab, i (tab)}
      <button
        bind:this={tabEls[i]}
        class="tab {tab === active ? 'active' : ''}"
        aria-current={tab === active ? 'page' : undefined}
        tabindex={tab === active ? 0 : -1}
        onclick={() => onTab?.(tab)}
        onkeydown={(e) => onTabKeydown(e, i)}
      >
        <span class="n" aria-hidden="true">{i + 1}</span>{tab}
      </button>
    {/each}
  </nav>

  <div class="grow"></div>

  <div class="seg right" title="services">
    <span class="dot" aria-hidden="true"></span>
    <span class="stat"><span class="v">6</span><span class="k">/7 up</span></span>
  </div>

  {#each stats as st (st.key)}
    <div class="seg right stat collapsible" title={st.title ?? st.key}>
      <span class="k">{st.key}</span><span class="v">{st.value}</span>
    </div>
  {/each}

  <button
    class="seg right click cmd"
    aria-keyshortcuts="Meta+K Control+K"
    aria-label="Open command menu"
    onclick={() => onCommand?.()}
  >
    <span class="kbd" aria-hidden="true">⌘K</span>
  </button>

  {#if userMenu}
    <div class="seg right user-slot">{@render userMenu()}</div>
  {:else}
    <button class="seg right click user-btn" onclick={() => onUser?.()}>{user}</button>
  {/if}

  <div class="seg right clock">
    <span>{h}</span><span class="sep">:</span><span>{m}</span><span class="sep">:</span><span>{s}</span>
  </div>
</header>

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
    position: relative; top: 0; z-index: 10;

    &.sticky { position: sticky; }

    // Skip link: visually hidden until focused, then it overlays the bar.
    .skip {
      position: absolute; left: var(--ss-s-1); top: var(--ss-s-1);
      z-index: 20;
      padding: var(--ss-badge-py) var(--ss-badge-px);
      background: var(--ss-primary); color: var(--ss-fg-on-primary);
      font: 500 var(--ss-ui-md) var(--ss-font-mono);
      text-decoration: none;
      transform: translateY(-200%);
      transition: transform var(--ss-dur-fast) var(--ss-ease);
      &:focus-visible, &:focus { transform: translateY(0); }
    }

    .seg {
      display: flex; align-items: center; gap: 8px;
      padding: 0 var(--ss-panel-head-px);
      border-right: 1px solid var(--ss-line);
      cursor: default;

      &.right { border-right: none; border-left: 1px solid var(--ss-line); }
      &.click { cursor: pointer; }
      &.click:hover { background: var(--ss-hover); color: var(--ss-fg); }
    }
    // Right-side controls authored as <button> reset their chrome.
    button.seg {
      background: transparent; border-top: 0; border-bottom: 0; border-right: 0;
      color: inherit; font: inherit;
      min-height: var(--ss-s-6); // ≥24px hit target at every size
    }
    button.seg.right { border-left: 1px solid var(--ss-line); }

    .logo {
      color: var(--ss-fg);
      .mark { display: block; }
      .nm { font-family: var(--ss-font-display); font-size: var(--ss-ui-lg); letter-spacing: 0.02em; line-height: 1; }
    }
    .ws {
      display: flex; align-items: stretch;
      .tab {
        display: flex; align-items: center;
        padding: 0 var(--ss-row-px);
        min-height: var(--ss-s-6); // ≥24px hit target at sm
        color: var(--ss-fg-faint);
        border-right: 1px solid var(--ss-line);
        cursor: pointer;
        font: 500 var(--ss-ui-md) var(--ss-font-mono);
        background: transparent; border-top: 0; border-bottom: 0; border-left: 0;
        transition: all var(--ss-dur-fast) var(--ss-ease);

        &:hover { color: var(--ss-fg); background: var(--ss-hover); }
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

    // Responsive collapse: drop the optional stat segments first, then the nav,
    // at narrow widths so the brand/clock/command/user controls stay reachable.
    @media (max-width: 720px) {
      .collapsible { display: none; }
    }
    @media (max-width: 520px) {
      .ws { display: none; }
    }
  }
</style>
