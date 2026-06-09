<script lang="ts">
  /**
   * One live tile in the landing field. Owns its variant index + its own random
   * 0.5–2s cycler, so every tile changes independently (no two show the same
   * value) and the cycling can't be disturbed by the parent's resize/measure.
   * Each value change crossfades (the design system "breathing"); chrome tiles
   * update in place via their own transitions. Frozen under reduced motion.
   */
  import { fade } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';
  import {
    Button, Input, SegmentedControl, Sidebar, Topbar, BottomNav, Menu, Link,
    Card, Accordion, Badge, MetricTile, ServiceCard, Sparkline, LogStream,
    EmptyState, Icon,
  } from 'dssoca';
  import { V, BLEED, CYCLE_MIN, CYCLE_MAX } from '$lib/hub-data';

  let { slug }: { slug: string } = $props();

  const pool = V[slug] ?? [];
  const chrome = BLEED.has(slug);

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
  const logLines = [
    { t: '12:00:01', lvl: 'info' as const, svc: '[hub]', msg: 'session refresh — user=admin' },
    { t: '12:00:03', lvl: 'ok' as const, svc: '[movies-api]', msg: 'GET /movies — 4ms' },
    { t: '12:00:06', lvl: 'warn' as const, svc: '[caddy]', msg: 'tls renewing hub.home' },
  ];
  const demoDate = new Date();

  const reduced = $derived(prefersReducedMotion.current);

  // this tile's current variant
  let vi = $state(0);
  const v = $derived<any>(pool.length ? pool[vi % pool.length] : {});
  const dur = $derived(reduced ? 0 : 240);

  // Independent random 0.5–2s cycler. Depends only on `reduced` + the constant
  // pool, so it is immune to the parent's layout/resize churn.
  $effect(() => {
    if (reduced || pool.length < 2) return;
    let timer: ReturnType<typeof setTimeout>;
    const delay = () => CYCLE_MIN + Math.random() * (CYCLE_MAX - CYCLE_MIN);
    const tick = () => {
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
      <img class="img" src={v.src} alt="" loading="lazy" decoding="async" />
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

<div class="tile" class:chrome data-slug={slug}>
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
  .tile {
    position: relative;
    overflow: hidden;
    transform: translateZ(0); // containing block for any position:fixed child
    background: var(--ss-bg);
    opacity: 0.28;
    // smooth dim → full on hover (opacity only: GPU-friendly, never janky)
    transition: opacity 0.4s ease;

    &:hover {
      opacity: 1;
      z-index: 5; // pops above neighbours (and above the page gradient)
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

  // Image tiles fill the cell with a random photo at lower opacity.
  .tile[data-slug='image'] .content { padding: 0; }
  .img { display: block; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }

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
</style>
