<script lang="ts">
  /**
   * The landing "workstation": a tiled field of live dssoca components behind the
   * hero. Each tile is dimmed and lifts to full opacity on hover (its own card
   * only). Every tile's props cycle on an independent random 0.5–2s timer so the
   * field feels alive — but each tile is a fixed-size, overflow-clipped box, so a
   * mutating prop never shifts the layout. Frozen under prefers-reduced-motion.
   *
   * The pool is randomized and sized to fill the viewport (components repeat); the
   * grid lands ~5 tiles per row at 1920px. Rendered client-only by the page, so the
   * components never hit SSR/prerender. Pool + variant data live in `$lib/hub-data`.
   */
  import { prefersReducedMotion } from 'svelte/motion';
  import {
    Button, Input, SegmentedControl, Sidebar, Topbar, BottomNav, Menu, Link,
    Card, Accordion, Badge, MetricTile, ServiceCard, Sparkline, LogStream,
    EmptyState, Icon,
  } from 'dssoca';
  import { buildTilePool, V, BLEED, CYCLE_MIN, CYCLE_MAX } from '$lib/hub-data';

  // Grid metrics (kept in sync with the CSS below): ~5 cols at 1920px.
  const TILE_MIN_W = 360;
  const TILE_H = 176;
  const MAX_TILES = 64; // perf cap; fills full-HD/1440p, clipped beyond

  // Stable randomized pool (built once on the client → no SSR mismatch).
  const POOL = buildTilePool(MAX_TILES);

  // Static sub-data the cycling props slot into.
  const sideGroups = [
    { section: 'nav', items: [
      { id: 'hub', label: 'Hub', icon: 'grid' as const, status: 'up' as const },
      { id: 'logs', label: 'Logs', icon: 'logs' as const },
      { id: 'auth', label: 'Auth', icon: 'user' as const, status: 'deg' as const },
    ] },
  ];
  const bnItems = [
    { id: 'home', label: 'Home', icon: 'grid' as const },
    { id: 'data', label: 'Data', icon: 'database' as const },
    { id: 'activity', label: 'Activity', icon: 'activity' as const, badge: 3 },
    { id: 'account', label: 'Account', icon: 'user' as const },
  ];
  const menuItems = [
    { id: 'edit', label: 'Edit', icon: 'note' as const },
    { id: 'dup', label: 'Duplicate', icon: 'grid' as const },
    { id: 'del', label: 'Delete', icon: 'logs' as const },
  ];
  const segOptions = [
    { value: 'list', label: 'List', icon: 'logs' as const },
    { value: 'grid', label: 'Grid', icon: 'grid' as const },
    { value: 'map', label: 'Map' },
  ];
  const accItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage', label: 'Usage', hint: '1 min' },
  ];
  const demoDate = new Date();

  const reduced = $derived(prefersReducedMotion.current);
  // static log snapshot so the LogStream tile also freezes under reduced motion
  // (its own demo ticker doesn't honour the OS setting).
  const logLines = [
    { t: '12:00:01', lvl: 'info' as const, svc: '[hub]', msg: 'session refresh — user=admin' },
    { t: '12:00:03', lvl: 'ok' as const, svc: '[movies-api]', msg: 'GET /movies — 4ms' },
    { t: '12:00:06', lvl: 'warn' as const, svc: '[caddy]', msg: 'tls renewing hub.home' },
  ];

  // How many tiles to actually render — just enough to fill the viewport.
  let count = $state(MAX_TILES);
  $effect(() => {
    const measure = () => {
      const cols = Math.max(1, Math.floor(window.innerWidth / TILE_MIN_W));
      const rows = Math.ceil(window.innerHeight / TILE_H) + 1;
      count = Math.min(MAX_TILES, cols * rows);
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  });
  const visible = $derived(POOL.slice(0, count));

  // current variant index per tile (keyed by tile position so repeats cycle apart)
  let idx = $state<number[]>(POOL.map(() => 0));

  // Independent random 0.5–2s cyclers for the visible tiles; frozen (and torn
  // down) under reduced motion, re-armed when `count` changes on resize.
  $effect(() => {
    if (prefersReducedMotion.current) return;
    const n = count;
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    const delay = () => CYCLE_MIN + Math.random() * (CYCLE_MAX - CYCLE_MIN);
    for (let i = 0; i < n; i++) {
      const pool = V[POOL[i]];
      if (!pool || pool.length < 2) continue;
      const tick = () => {
        let next = Math.floor(Math.random() * pool.length);
        if (next === idx[i]) next = (next + 1) % pool.length;
        idx[i] = next;
        timers.set(i, setTimeout(tick, delay()));
      };
      timers.set(i, setTimeout(tick, delay()));
    }
    return () => timers.forEach(clearTimeout);
  });

  const variant = (slug: string, i: number): any => {
    const pool = V[slug];
    return pool && pool.length ? pool[i % pool.length] : {};
  };
</script>

<div class="hub" aria-hidden="true">
  {#each visible as slug, i (i)}
    {@const v = variant(slug, idx[i])}
    <div class="tile" class:chrome={BLEED.has(slug)} data-slug={slug}>
      <!-- inert: the live components are decorative; keep their focusable controls
           out of the tab order + a11y tree. It sits on .inner (not .tile) so the
           per-card :hover reveal still works. -->
      <div class="inner" inert>
        <svelte:boundary>
        {#if slug === 'button'}
          <Button variant={v.variant}>{v.t}</Button>
        {:else if slug === 'badge'}
          <div class="row">
            <Badge tone={v.tone} dot={v.dot}>{v.t}</Badge>
            <Badge tone="neutral" count={7} label="open" />
          </div>
        {:else if slug === 'input'}
          <div class="w-full"><Input label={v.label} value={v.val} clearable /></div>
        {:else if slug === 'segmented-control'}
          <SegmentedControl label="View" options={segOptions} value={v.val} />
        {:else if slug === 'sidebar'}
          <Sidebar active={v.active} groups={sideGroups} />
        {:else if slug === 'topbar'}
          <Topbar active={v.active} tabs={['overview', 'logs', 'services']} user="admin@hub.home" />
        {:else if slug === 'bottom-nav'}
          <BottomNav items={bnItems} active={v.active} />
        {:else if slug === 'menu'}
          <Menu items={menuItems} label={v.t} open={false}>{v.t}</Menu>
        {:else if slug === 'link'}
          <div class="row"><Link href="/components">{v.t}</Link></div>
        {:else if slug === 'card'}
          <div class="w-full">
            <Card title={v.title} meta={v.meta}><p class="body">All systems nominal.</p></Card>
          </div>
        {:else if slug === 'accordion'}
          <div class="w-full">
            <Accordion items={accItems} value={v.open}>
              {#snippet panel(item)}<p class="body">Content for {item.label}.</p>{/snippet}
            </Accordion>
          </div>
        {:else if slug === 'metric-tile'}
          <div class="w-full">
            <MetricTile label="req/min" value={v.val} delta={v.d} dir={v.dir}>
              {#snippet chart()}<Sparkline data={[3, 7, 4, 9, 6, 11]} trend="auto" fluid />{/snippet}
            </MetricTile>
          </div>
        {:else if slug === 'service-card'}
          <div class="w-full">
            <ServiceCard name="movies-api" host="movies.home" status={v.status} latency={v.lat} updatedAt={demoDate} />
          </div>
        {:else if slug === 'sparkline'}
          <div class="w-full"><Sparkline data={v.data} label="req/min, last 6h" variant="area" fluid /></div>
        {:else if slug === 'log-stream'}
          {#if reduced}<LogStream lines={logLines} />{:else}<LogStream demo />{/if}
        {:else if slug === 'empty-state'}
          <EmptyState title={v.title} message={v.msg} icon={v.icon} />
        {:else if slug === 'icon'}
          <div class="row icons">
            {#each v.names as n}<Icon name={n} px={20} />{/each}
          </div>
        {:else if slug === 'image'}
          <div class="w-full"><img class="img" src={v.src} alt="" /></div>
        {:else if slug === 'toaster'}
          <div class="toasts">
            <div class="ft"><span class="ft-g {v.k}">{v.g}</span><span>{v.t}</span></div>
            <div class="ft"><span class="ft-g info">i</span><span>3 services syncing…</span></div>
          </div>
        {/if}
        <!-- a single misbehaving tile must never take down the whole field -->
        {#snippet failed()}{/snippet}
        </svelte:boundary>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .hub {
    position: absolute;
    inset: 0;
    overflow: hidden;
    display: grid;
    // ~5 columns at 1920px; auto-fills to the viewport width.
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    grid-auto-rows: 176px;
    gap: 1px;
    // transparent so the page's radial gradient shows through the dimmed tiles
    // (and the 1px gaps); NOT a stacking context, so a hovered tile can rise.
    background: transparent;
  }

  .tile {
    position: relative;
    overflow: hidden;
    transform: translateZ(0); // containing block for any position:fixed child
    background: var(--ss-bg);
    opacity: 0.28;
    filter: saturate(0.8);
    transition:
      opacity 0.4s ease,
      filter 0.4s ease;

    // On hover the tile becomes fully opaque (covers the gradient behind it) and
    // lifts above its neighbours — its own card only.
    &:hover {
      opacity: 1;
      filter: none;
      z-index: 5;
    }
  }

  .inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ss-s-4);
    pointer-events: none; // the page underneath stays the interaction layer
  }

  // --- chrome components (sidebar/topbar/bottom-nav/log-stream): adapt to the
  //     rectangular cell rather than floating awkwardly in it ---
  .tile.chrome .inner { padding: 0; align-items: stretch; justify-content: stretch; }
  // sidebar → full-cell nav panel (override its fixed rail width, fill height)
  .tile[data-slug='sidebar'] :global(.ss-side) { width: 100%; height: 100%; }
  // topbar → bar pinned to the top edge, full width
  .tile[data-slug='topbar'] .inner { align-items: flex-start; }
  .tile[data-slug='topbar'] :global(.ss-topbar) { width: 100%; }
  // log-stream → fill the cell
  .tile[data-slug='log-stream'] :global(.ss-logs) { width: 100%; height: 100%; }
  // bottom-nav is position:fixed → contained by the tile transform; sits at the bottom.

  .row { display: flex; align-items: center; gap: var(--ss-s-2); flex-wrap: wrap; justify-content: center; }
  .icons { gap: var(--ss-s-3); color: var(--ss-fg-muted); }
  .w-full { width: 100%; }
  .body { margin: 0; font-family: var(--ss-font-body); font-size: var(--ss-size-sm); color: var(--ss-fg-muted); }
  .img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }

  .toasts { display: flex; flex-direction: column; gap: var(--ss-s-2); width: 100%; }
  .ft {
    display: inline-flex; align-items: center; gap: var(--ss-s-2);
    padding: var(--ss-s-2) var(--ss-s-3);
    border: 1px solid var(--ss-line); background: var(--ss-bg-elev-hover);
    font-family: var(--ss-font-body); font-size: var(--ss-ui-md); color: var(--ss-fg);
  }
  .ft-g {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); font-weight: 700;
  }
  .ft-g.ok { color: var(--ss-primary); }
  .ft-g.info { color: var(--ss-cyan); }
  .ft-g.err { color: var(--ss-red); }

  @media (prefers-reduced-motion: reduce) {
    .tile { transition: none; }
  }
</style>
