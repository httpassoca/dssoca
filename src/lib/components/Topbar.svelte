<script module lang="ts">
  /**
   * One tab in the Topbar strip (DS-0080). The shorthand `string` form is
   * equivalent to `{ id: s, label: s }`.
   */
  export interface TopbarTab {
    /** Stable id — matched against `active` and passed to `onTab`. */
    id: string
    /** Visible label; defaults to `id` (decouple for localized labels). */
    label?: string
    /** Optional URL — when set the tab renders as a real `<a href>`. */
    href?: string
  }

  /** Services status summary shown in the right-side dot segment. */
  export interface TopbarServices {
    up: number
    total: number
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Stat {
    key: string
    value: string
    title?: string
  }

  interface Props {
    active?: string
    user?: string
    /** Tab strip: plain strings (id = label) or `{ id, label?, href? }` objects. */
    tabs?: Array<string | TopbarTab>
    /** Fired with the tab id when a tab is activated (also for `href` tabs). */
    onTab?: (tab: string) => void
    /** Fired when the command menu is opened (chip click or Cmd/Ctrl+K).
     *  The ⌘K chip and the shortcut only exist when this handler is provided. */
    onCommand?: () => void
    /** Fired when the user chip is activated (when no `userMenu` snippet given). */
    onUser?: () => void
    /** Custom user/avatar control rendered on the right; overrides the default user button. */
    userMenu?: Snippet
    /** Custom brand mark + name; defaults to the built-in logo. */
    brand?: Snippet
    /** Right-aligned stat segments; defaults to the built-in homelab stats. Pass `[]` to remove. */
    stats?: Stat[]
    /** Services status segment: `true` keeps the built-in 6/7 demo summary,
     *  `{ up, total }` renders real numbers, `false` removes the segment. */
    services?: boolean | TopbarServices
    /** Live clock segment; `false` removes it (and skips the interval). */
    clock?: boolean
    /** Anchor the skip link jumps to. */
    skipTarget?: string
    /** When true, the header sticks to the top of the viewport. */
    sticky?: boolean
    /** Accessible name for the tab-strip `<nav>` landmark (DS-0078). */
    ariaLabel?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  const DEFAULT_STATS: Stat[] = [
    { key: 'cpu', value: '62%', title: 'cpu' },
    { key: 'mem', value: '3.8G', title: 'memory' },
    { key: 'net', value: '↓1.2 ↑0.3', title: 'network' },
  ]

  const DEFAULT_SERVICES: TopbarServices = { up: 6, total: 7 }

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
    services = true,
    clock = true,
    skipTarget = '#main',
    sticky = true,
    ariaLabel = 'Primary',
    size,
  }: Props = $props()

  // SSR safety (DS-0067): same guard pattern as toast.svelte.ts — effects
  // normally don't run on the server, but the guard is the house convention
  // and protects against eager evaluation.
  const hasWindow = typeof window !== 'undefined'

  // DS-0080: normalize both tab shapes to one internal form. `string` tabs
  // keep id === label; object tabs default `label` to `id`.
  const items = $derived(
    tabs.map((t): { id: string; label: string; href?: string } =>
      typeof t === 'string'
        ? { id: t, label: t }
        : { id: t.id, label: t.label ?? t.id, href: t.href },
    ),
  )

  // DS-0081: resolve the services prop to data-or-nothing.
  const svc = $derived(services === true ? DEFAULT_SERVICES : services === false ? null : services)

  function pad(n: number) {
    return String(n).padStart(2, '0')
  }
  function nowStr() {
    const d = new Date()
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  let time = $state(nowStr())

  $effect(() => {
    const t = clock
      ? setInterval(() => {
          time = nowStr()
        }, 1000)
      : undefined
    const onKey = (e: KeyboardEvent) => {
      // Only claim the Cmd/Ctrl+K shortcut when a command handler exists
      // (DS-0081) — otherwise leave the browser's default alone.
      if (onCommand && (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        onCommand()
      }
    }
    if (hasWindow) window.addEventListener('keydown', onKey)
    return () => {
      if (t) clearInterval(t)
      if (hasWindow) window.removeEventListener('keydown', onKey)
    }
  })

  const [h, m, s] = $derived(time.split(':'))

  // Roving tabindex: arrow keys move focus across the tab strip (wrapping),
  // Home/End jump to the ends. Button tabs keep the active tab as the single
  // tab stop; link tabs stay in the natural tab order so they remain
  // keyboard-reachable without JS (SSR, DS-0080).
  let tabEls: (HTMLAnchorElement | HTMLButtonElement)[] = $state([])
  function focusTab(i: number) {
    const n = items.length
    if (!n) return
    const idx = ((i % n) + n) % n
    tabEls[idx]?.focus()
  }
  function onTabKeydown(e: KeyboardEvent, i: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        focusTab(i + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        focusTab(i - 1)
        break
      case 'Home':
        e.preventDefault()
        focusTab(0)
        break
      case 'End':
        e.preventDefault()
        focusTab(items.length - 1)
        break
    }
  }
</script>

<header class="ss-topbar" class:sticky data-size-variant={resolveComponentSize('Topbar', size)}>
  <a class="skip" href={skipTarget}>Skip to content</a>

  <div class="seg logo">
    {#if brand}
      {@render brand()}
    {:else}
      <svg
        class="mark"
        viewBox="0 0 103 89"
        fill="var(--ss-primary)"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M51.5 0L0 89H103L51.5 0ZM23.8643 80.151H87.6468L71.6884 52.5724L23.8643 80.151ZM65.5911 42.0354L60.7383 33.649L46.1956 42.0354H65.5911ZM56.14 25.7024L51.5 17.6837L42.2125 33.7339L56.14 25.7024ZM32.0977 51.2138L20.2949 71.6111L55.6656 51.2138H32.0977Z"
        />
      </svg>
      <span class="nm">hubssoca</span>
    {/if}
  </div>

  <nav class="ws" aria-label={ariaLabel}>
    {#each items as tab, i (tab.id)}
      {@const current = tab.id === active}
      {#if tab.href}
        <a
          bind:this={tabEls[i]}
          class="tab {current ? 'active' : ''}"
          href={tab.href}
          aria-current={current ? 'page' : undefined}
          onclick={() => onTab?.(tab.id)}
          onkeydown={(e) => onTabKeydown(e, i)}
        >
          <span class="n" aria-hidden="true">{i + 1}</span>{tab.label}
        </a>
      {:else}
        <button
          bind:this={tabEls[i]}
          type="button"
          class="tab {current ? 'active' : ''}"
          aria-current={current ? 'page' : undefined}
          tabindex={current ? 0 : -1}
          onclick={() => onTab?.(tab.id)}
          onkeydown={(e) => onTabKeydown(e, i)}
        >
          <span class="n" aria-hidden="true">{i + 1}</span>{tab.label}
        </button>
      {/if}
    {/each}
  </nav>

  <div class="grow"></div>

  {#if svc}
    <div class="seg right" title="services">
      <span class="dot" aria-hidden="true"></span>
      <span class="stat"><span class="v">{svc.up}</span><span class="k">/{svc.total} up</span></span
      >
    </div>
  {/if}

  {#each stats as st (st.key)}
    <div class="seg right stat collapsible" title={st.title ?? st.key}>
      <span class="k">{st.key}</span><span class="v">{st.value}</span>
    </div>
  {/each}

  {#if onCommand}
    <button
      class="seg right click cmd"
      aria-keyshortcuts="Meta+K Control+K"
      aria-label="Open command menu"
      onclick={() => onCommand?.()}
    >
      <span class="kbd" aria-hidden="true">⌘K</span>
    </button>
  {/if}

  {#if userMenu}
    <div class="seg right user-slot">{@render userMenu()}</div>
  {:else}
    <button class="seg right click user-btn" onclick={() => onUser?.()}>{user}</button>
  {/if}

  {#if clock}
    <div class="seg right clock">
      <span>{h}</span><span class="sep">:</span><span>{m}</span><span class="sep">:</span><span
        >{s}</span
      >
    </div>
  {/if}
</header>

<style lang="scss">
  // DS-0082 — documented responsive breakpoints. Media queries cannot read
  // CSS custom properties, so these are Sass constants; they are part of the
  // Topbar's documented API (see the Topbar docs page).
  $bp-stats-collapse: 720px; // optional stat segments hide below this
  $bp-tabs-collapse: 520px; // tab strip hides below this (pair with BottomNav)

  .ss-topbar {
    grid-column: 1 / -1;
    display: flex;
    align-items: stretch;
    background: var(--ss-bg);
    border-bottom: 1px solid var(--ss-line);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-md);
    color: var(--ss-fg-muted);
    user-select: none;
    position: relative;
    top: 0;
    z-index: 10;

    &.sticky {
      position: sticky;
    }

    // Skip link: visually hidden until focused, then it overlays the bar.
    .skip {
      position: absolute;
      left: var(--ss-s-1);
      top: var(--ss-s-1);
      z-index: 20;
      padding: var(--ss-badge-py) var(--ss-badge-px);
      background: var(--ss-primary);
      color: var(--ss-fg-on-primary);
      font: 500 var(--ss-ui-md) var(--ss-font-mono);
      text-decoration: none;
      transform: translateY(-200%);
      transition: transform var(--ss-dur-fast) var(--ss-ease);
      &:focus-visible,
      &:focus {
        transform: translateY(0);
      }
    }

    .seg {
      // DS-0068: existing spacing tokens instead of hardcoded px (8px = --ss-s-2).
      display: flex;
      align-items: center;
      gap: var(--ss-s-2);
      padding: 0 var(--ss-panel-head-px);
      border-right: 1px solid var(--ss-line);
      cursor: default;
      flex: none;

      &.right {
        border-right: none;
        border-left: 1px solid var(--ss-line);
      }
      &.click {
        cursor: pointer;
      }
      &.click:hover {
        background: var(--ss-hover);
        color: var(--ss-fg);
      }
    }
    // Right-side controls authored as <button> reset their chrome.
    button.seg {
      background: transparent;
      border-top: 0;
      border-bottom: 0;
      border-right: 0;
      color: inherit;
      font: inherit;
      min-height: var(--ss-s-6); // ≥24px hit target at every size
    }
    button.seg.right {
      border-left: 1px solid var(--ss-line);
    }

    .logo {
      color: var(--ss-fg);
      .mark {
        display: block;
      }
      .nm {
        font-family: var(--ss-font-display);
        font-size: var(--ss-ui-lg);
        letter-spacing: 0.02em;
        line-height: 1;
      }
    }
    .ws {
      display: flex;
      align-items: stretch;
      // DS-0082: the strip shrinks (min-width: 0) and scrolls horizontally
      // instead of pushing the right-side chrome off-canvas when the tabs
      // outgrow the available width. Tabs stay keyboard-reachable: focusing
      // an off-screen tab scrolls it into view natively.
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: thin;
      .tab {
        display: flex;
        align-items: center;
        flex: none;
        white-space: nowrap;
        padding: 0 var(--ss-row-px);
        min-height: var(--ss-s-6); // ≥24px hit target at sm
        color: var(--ss-fg-faint);
        border-right: 1px solid var(--ss-line);
        cursor: pointer;
        font: 500 var(--ss-ui-md) var(--ss-font-mono);
        background: transparent;
        border-top: 0;
        border-bottom: 0;
        border-left: 0;
        text-decoration: none;
        transition: all var(--ss-dur-fast) var(--ss-ease);

        &:hover {
          color: var(--ss-fg);
          background: var(--ss-hover);
        }
        .n {
          color: var(--ss-fg-faint);
          margin-right: 6px;
        }
        &.active {
          color: var(--ss-fg);
          background: rgba(102, 239, 115, 0.06);
          box-shadow: inset 0 -2px 0 var(--ss-primary);
        }
        &.active .n {
          color: var(--ss-primary);
        }
      }
    }
    .grow {
      flex: 1;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: var(--ss-primary);
      display: inline-block;
    }
    .stat {
      font-variant-numeric: tabular-nums;
      // DS-0068: 4px = --ss-s-1. The remaining hardcoded px in this block
      // (6px dot, 6px tab-number margin, 2px clock separators, 2px/5px kbd
      // padding) have no matching --ss-s-*/--ss-gap-* value at md and stay
      // literal rather than inventing new tokens.
      .k {
        color: var(--ss-fg-faint);
        margin-right: var(--ss-s-1);
      }
      .v {
        color: var(--ss-fg);
      }
    }
    .clock {
      color: var(--ss-fg);
      font-variant-numeric: tabular-nums;
      .sep {
        color: var(--ss-fg-faint);
        margin: 0 2px;
      }
    }
    .kbd {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
      border: 1px solid var(--ss-line);
      padding: 2px 5px;
      line-height: 1;
    }

    // Responsive collapse (DS-0082, documented breakpoints above): drop the
    // optional stat segments first, then the tab strip, at narrow widths so
    // the brand/clock/command/user controls stay reachable. Consumers wanting
    // tabs on small screens pair the Topbar with `BottomNav`; the strip itself
    // never overflows the bar (it scrolls — see `.ws`).
    @media (max-width: $bp-stats-collapse) {
      .collapsible {
        display: none;
      }
    }
    @media (max-width: $bp-tabs-collapse) {
      .ws {
        display: none;
      }
    }
  }
</style>
