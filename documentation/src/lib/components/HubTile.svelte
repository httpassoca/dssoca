<script lang="ts">
  /**
   * One live tile in the landing field. Owns its variant index + its own random
   * 0.5–2s cycler, so every tile changes independently (no two show the same
   * value) and the cycling can't be disturbed by the parent's resize/measure.
   * Each value change crossfades (the design system "breathing"); chrome tiles
   * update in place via their own transitions. Tiles fade + scale in on mount
   * (staggered). Frozen under reduced motion.
   */
  import { fade } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';
  import {
    Button, Input, SegmentedControl, Sidebar, Topbar, BottomNav, Menu, Link,
    Card, Accordion, Badge, MetricTile, ServiceCard, Sparkline, LogStream,
    EmptyState, Icon, type IconName, type SideGroup, type BottomNavItem,
    type MenuItem, type SegmentOption, type AccordionItem, type LogLine,
  } from 'dssoca';
  import { V, BLEED, CYCLE_MIN, CYCLE_MAX, type Variant } from '$lib/hub-data';

  let { slug }: { slug: string } = $props();

  const pool = $derived<Variant[]>(V[slug] ?? []);
  const chrome = $derived(BLEED.has(slug));
  // staggered entrance so the field "materialises" rather than popping in
  const enterDelay = Math.round(Math.random() * 450);

  // Static sub-data the cycling props slot into.
  const sideGroups: SideGroup[] = [
    { section: 'nav', items: [
      { id: 'hub', label: 'Hub', icon: 'grid', status: 'up' },
      { id: 'logs', label: 'Logs', icon: 'logs' },
      { id: 'auth', label: 'Auth', icon: 'user', status: 'deg' },
    ] },
  ];
  const bnItems: BottomNavItem[] = [
    { id: 'home', label: 'Home', icon: 'grid' },
    { id: 'data', label: 'Data', icon: 'database' },
    { id: 'activity', label: 'Activity', icon: 'activity', badge: 3 },
    { id: 'account', label: 'Account', icon: 'user' },
  ];
  const menuItems: MenuItem[] = [
    { id: 'edit', label: 'Edit', icon: 'note' },
    { id: 'dup', label: 'Duplicate', icon: 'grid' },
    { id: 'del', label: 'Delete', icon: 'logs' },
  ];
  const segOptions: SegmentOption[] = [
    { value: 'list', label: 'List', icon: 'logs' },
    { value: 'grid', label: 'Grid', icon: 'grid' },
    { value: 'map', label: 'Map' },
  ];
  const accItems: AccordionItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage', label: 'Usage', hint: '1 min' },
  ];
  const logLines: LogLine[] = [
    { t: '12:00:01', lvl: 'info', svc: '[hub]', msg: 'session refresh — user=admin' },
    { t: '12:00:03', lvl: 'ok', svc: '[movies-api]', msg: 'GET /movies — 4ms' },
    { t: '12:00:06', lvl: 'warn', svc: '[caddy]', msg: 'tls renewing hub.home' },
  ];
  const demoDate = new Date();

  const reduced = $derived(prefersReducedMotion.current);

  // this tile's current variant
  let vi = $state(0);
  const v = $derived<Variant>(pool.length ? pool[vi % pool.length] : {});
  // crossfade duration: 0 on first paint (the tile entrance covers it) and under
  // reduced motion; otherwise a gentle fade on each value change.
  let mounted = $state(false);
  $effect(() => {
    mounted = true;
  });
  const dur = $derived(reduced || !mounted ? 0 : 240);

  // Independent random 0.5–2s cycler. Depends only on `reduced` + the constant
  // pool, so it is immune to the parent's layout/resize churn.
  $effect(() => {
    if (reduced || pool.length < 2) return;
    let timer: ReturnType<typeof setTimeout>;
    const delay = (): number => CYCLE_MIN + Math.random() * (CYCLE_MAX - CYCLE_MIN);
    const tick = (): void => {
      let next = Math.floor(Math.random() * pool.length);
      if (next === vi) next = (next + 1) % pool.length;
      vi = next;
      timer = setTimeout(tick, delay());
    };
    timer = setTimeout(tick, delay());
    return () => clearTimeout(timer);
  });
</script>

{#snippet body()}
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
        <Card title={v.title} meta={v.meta}><p class="cbody">All systems nominal.</p></Card>
      </div>
    {:else if slug === 'accordion'}
      <div class="w-full">
        <Accordion items={accItems} value={v.open}>
          {#snippet panel(item)}<p class="cbody">Content for {item.label}.</p>{/snippet}
        </Accordion>
      </div>
    {:else if slug === 'metric-tile'}
      <div class="w-full">
        <MetricTile label="req/min" value={v.val ?? '0'} delta={v.d} dir={v.dir}>
          {#snippet chart()}<Sparkline data={[3, 7, 4, 9, 6, 11]} trend="auto" fluid />{/snippet}
        </MetricTile>
      </div>
    {:else if slug === 'service-card'}
      <div class="w-full">
        <ServiceCard name="movies-api" host="movies.home" status={v.status} latency={v.lat} updatedAt={demoDate} />
      </div>
    {:else if slug === 'sparkline'}
      <div class="w-full"><Sparkline data={v.data ?? []} label="req/min, last 6h" variant="area" fluid /></div>
    {:else if slug === 'log-stream'}
      {#if reduced}<LogStream lines={logLines} />{:else}<LogStream demo />{/if}
    {:else if slug === 'empty-state'}
      <EmptyState title={v.title ?? ''} message={v.msg} icon={v.icon} />
    {:else if slug === 'icon'}
      <div class="row icons">
        {#each v.names ?? [] as n}<Icon name={n} px={20} />{/each}
      </div>
    {:else if slug === 'toaster'}
      <div class="toasts">
        <div class="ft"><span class="ft-g {v.k}">{v.g}</span><span>{v.t}</span></div>
        <div class="ft"><span class="ft-g info">i</span><span>3 services syncing…</span></div>
      </div>
    {/if}
    <!-- a single misbehaving tile must never take down the whole field -->
    {#snippet failed()}{/snippet}
  </svelte:boundary>
{/snippet}

<div class="tile" class:chrome data-slug={slug} style="--enter-delay: {enterDelay}ms">
  <div class="inner" inert>
    {#if chrome}
      <!-- chrome updates in place (its own transitions smooth the change) -->
      <div class="content">{@render body()}</div>
    {:else}
      {#key vi}
        <div class="content" in:fade={{ duration: dur }} out:fade={{ duration: dur }}>
          {@render body()}
        </div>
      {/key}
    {/if}
  </div>
</div>

<style lang="scss">
  @keyframes tile-in {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 0.2; transform: scale(1); }
  }

  .tile {
    position: relative;
    overflow: hidden;
    transform: translateZ(0); // containing block for any position:fixed child
    background: var(--ss-bg);
    opacity: 0.2;
    // staggered fade + scale entrance (backwards fill: hold the start during the
    // delay, then revert to the CSS opacity so :hover still works afterwards)
    animation: tile-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
    animation-delay: var(--enter-delay, 0ms);
    // smooth dim → full on hover (opacity only: GPU-friendly, never janky)
    transition: opacity 0.4s ease;

    &:hover {
      opacity: 1;
      z-index: 5; // pops above the page gradient + neighbours
    }
  }

  .inner {
    position: absolute;
    inset: 0;
    pointer-events: none; // the page underneath stays the interaction layer
  }

  // The content is absolutely positioned so the two copies overlap cleanly while
  // a value change crossfades (no layout shift).
  .content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ss-s-4);
  }

  // --- chrome components: adapt to the rectangular cell ---
  .tile.chrome .content { padding: 0; align-items: stretch; justify-content: stretch; }
  .tile[data-slug='sidebar'] :global(.ss-side) { width: 100%; height: 100%; }
  .tile[data-slug='topbar'] .content { align-items: flex-start; }
  .tile[data-slug='topbar'] :global(.ss-topbar) { width: 100%; }
  .tile[data-slug='log-stream'] :global(.ss-logs) { width: 100%; height: 100%; }

  .row { display: flex; align-items: center; gap: var(--ss-s-2); flex-wrap: wrap; justify-content: center; }
  .icons { gap: var(--ss-s-3); color: var(--ss-fg-muted); }
  .w-full { width: 100%; }
  .cbody { margin: 0; font-family: var(--ss-font-body); font-size: var(--ss-size-sm); color: var(--ss-fg-muted); }

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
    .tile { animation: none; }
  }
</style>
