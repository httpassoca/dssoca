<script lang="ts">
  import { browser } from '$app/environment'
  import {
    Button,
    Input,
    SegmentedControl,
    Sidebar,
    Topbar,
    BottomNav,
    Menu,
    Link,
    Card,
    Accordion,
    Badge,
    MetricTile,
    ServiceCard,
    Sparkline,
    LogStream,
    EmptyState,
    Icon,
    Image,
    Heading,
    Container,
    Textarea,
    Spinner,
  } from 'dssoca'
  import { componentsByCategory } from '$lib/categories'
  import { COMPONENTS } from '$lib/docs.config'

  const groups = componentsByCategory()

  // Previews are non-interactive (the whole card is a link) and render only in
  // the browser — they never run through SSR/prerender, so a component that
  // touches the DOM at render time can't break the static build.
  // Chrome/full-bleed components fill the stage; everything else is centered.
  const BLEED = new Set(['sidebar', 'topbar', 'bottom-nav', 'log-stream'])

  // --- representative sample data for the previews ------------------------
  const spark = [3, 7, 4, 9, 6, 11]
  const demoDate = new Date()
  const sideGroups = [
    {
      section: 'nav',
      items: [
        { id: 'hub', label: 'Hub', icon: 'grid' as const, status: 'up' as const },
        { id: 'logs', label: 'Logs', icon: 'logs' as const },
        { id: 'auth', label: 'Auth', icon: 'user' as const, status: 'deg' as const },
      ],
    },
  ]
  const bnItems = [
    { id: 'home', label: 'Home', icon: 'grid' as const },
    { id: 'data', label: 'Data', icon: 'database' as const },
    { id: 'activity', label: 'Activity', icon: 'activity' as const, badge: 3 },
    { id: 'account', label: 'Account', icon: 'user' as const },
  ]
  const menuItems = [
    { id: 'edit', label: 'Edit', icon: 'note' as const },
    { id: 'dup', label: 'Duplicate', icon: 'grid' as const },
    { id: 'del', label: 'Delete', icon: 'logs' as const },
  ]
  const segOptions = [
    { value: 'list', label: 'List', icon: 'logs' as const },
    { value: 'grid', label: 'Grid', icon: 'grid' as const },
    { value: 'map', label: 'Map' },
  ]
  const accItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'usage', label: 'Usage', hint: '1 min' },
  ]
  const logLines = [
    { t: '12:00:01', lvl: 'info' as const, svc: '[hub]', msg: 'session refresh — user=admin' },
    { t: '12:00:03', lvl: 'ok' as const, svc: '[movies-api]', msg: 'GET /movies — 3 rows · 4ms' },
    { t: '12:00:06', lvl: 'warn' as const, svc: '[caddy]', msg: 'tls renewing hub.home' },
    { t: '12:00:08', lvl: 'err' as const, svc: '[tasks-api]', msg: 'EADDRINUSE :3004' },
  ]
  // A real photograph (Lorem Picsum, fixed id) instead of a flat gradient —
  // mirrors the Image Storybook story; the fixed id keeps the preview stable.
  const imgSrc = 'https://picsum.photos/id/1018/480/270'
</script>

<svelte:head>
  <title>Components — dssoca</title>
  <meta
    name="description"
    content="Every dssoca component, grouped by category, with a live preview."
  />
</svelte:head>

<section class="intro">
  <h1>Components</h1>
  <p class="lede">
    All {COMPONENTS.length} components, grouped by purpose. Each card previews the live component — select
    one to open its full page (props, usage, demo).
  </p>
</section>

{#each groups as { category, components } (category.id)}
  <section class="cat">
    <h2>{category.label}</h2>
    <div class="grid">
      {#each components as c (c.slug)}
        <a class="card" href={`/components/${c.slug}`}>
          <!-- inert pulls the preview's focusable controls out of the tab order
               and the a11y tree (the card's <a> is the only interactive element);
               aria-hidden alone would leave them keyboard-reachable. -->
          <div class="stage" class:bleed={BLEED.has(c.slug)} inert aria-hidden="true">
            {#if browser}{@render preview(c.slug)}{/if}
          </div>
          <div class="meta">
            <span class="name">{c.name}</span>
            <span class="tag">{c.tagline}</span>
          </div>
        </a>
      {/each}
    </div>
  </section>
{/each}

{#snippet preview(slug: string)}
  {#if slug === 'button'}
    <div class="row">
      <Button variant="primary">deploy</Button>
      <Button variant="secondary">cancel</Button>
    </div>
  {:else if slug === 'input'}
    <div class="w-full">
      <Input label="email" value="admin@hub.home" hint="we never share it" />
    </div>
  {:else if slug === 'segmented-control'}
    <SegmentedControl label="View mode" options={segOptions} value="grid" />
  {:else if slug === 'sidebar'}
    <Sidebar active="hub" groups={sideGroups} />
  {:else if slug === 'topbar'}
    <Topbar active="overview" tabs={['overview', 'logs']} user="admin@hub.home" />
  {:else if slug === 'bottom-nav'}
    <BottomNav items={bnItems} active="home" />
  {:else if slug === 'menu'}
    <Menu items={menuItems} label="Actions" open={false}>Actions</Menu>
  {:else if slug === 'link'}
    <!-- real docs routes (the stage is inert, but keep hrefs honest) -->
    <div class="row">
      <Link href="/introduction">introduction</Link>
      <Link variant="button" href="/installation">get started</Link>
    </div>
  {:else if slug === 'card'}
    <div class="w-full">
      <Card title="Services" meta="6 of 7 healthy" description="last sync 2m ago">
        <p class="card-body">All systems nominal.</p>
      </Card>
    </div>
  {:else if slug === 'accordion'}
    <div class="w-full">
      <Accordion items={accItems} defaultValue="overview">
        {#snippet panel(item)}<p class="card-body">Content for {item.label}.</p>{/snippet}
      </Accordion>
    </div>
  {:else if slug === 'badge'}
    <div class="row">
      <Badge tone="up" dot>up</Badge>
      <Badge tone="down">down</Badge>
      <Badge tone="info">to_watch</Badge>
    </div>
  {:else if slug === 'metric-tile'}
    <div class="w-full">
      <MetricTile label="req/min" value="142" delta="12%" dir="up" deltaLabel="vs prev 7d">
        {#snippet chart()}<Sparkline data={spark} trend="auto" fluid />{/snippet}
      </MetricTile>
    </div>
  {:else if slug === 'service-card'}
    <div class="w-full">
      <ServiceCard
        name="movies-api"
        host="movies.home"
        status="up"
        latency="4ms"
        updatedAt={demoDate}
      />
    </div>
  {:else if slug === 'sparkline'}
    <div class="w-full">
      <Sparkline data={spark} label="req/min, last 6h" variant="area" fluid />
    </div>
  {:else if slug === 'log-stream'}
    <LogStream lines={logLines} />
  {:else if slug === 'empty-state'}
    <EmptyState title="No services yet" message="Add one to get started." icon="∅" />
  {:else if slug === 'icon'}
    <div class="row icons">
      <Icon name="activity" px={20} /><Icon name="settings" px={20} /><Icon name="check" px={20} />
      <Icon name="user" px={20} /><Icon name="grid" px={20} /><Icon name="logs" px={20} />
    </div>
  {:else if slug === 'image'}
    <div class="img-preview">
      <Image src={imgSrc} alt="A mountain landscape at dawn" ratio={16 / 9} />
    </div>
  {:else if slug === 'heading'}
    <div class="heading-preview"><Heading level={2} size="sm">hub_dashboard</Heading></div>
  {:else if slug === 'container'}
    <Container>
      <p class="card-body container-demo">Centered, max-width page content.</p>
    </Container>
  {:else if slug === 'textarea'}
    <div class="w-full">
      <Textarea label="message" value="Markdown is fine." rows={2} hint="we read every word" />
    </div>
  {:else if slug === 'spinner'}
    <Spinner variant="squareCorners" label="Fetching services…" showLabel />
  {:else if slug === 'toaster'}
    <!-- Toaster reads the global toast store and is position:fixed, so a live
         instance would be empty / escape the card; show a faithful static stand-in. -->
    <div class="toasts">
      <div class="ft"><span class="ft-g ok">✓</span><span>saved!</span></div>
      <div class="ft"><span class="ft-g info">i</span><span>3 services syncing…</span></div>
    </div>
  {/if}
{/snippet}

<style lang="scss">
  .intro {
    // Full content width, left-aligned (matches the tokens page) so the heading
    // and lede share the grids' left edge instead of floating centered+narrow.
    margin: 0 0 var(--ss-block-gap);

    h1 {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h1);
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-2);
    }
    .lede {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-body);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      margin: 0;
      max-width: 44rem;
    }
  }
  .cat {
    margin: 0 0 var(--ss-block-gap);

    h2 {
      font-family: var(--ss-font-subhead);
      font-size: var(--ss-size-h2);
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-4);
      padding-bottom: var(--ss-s-2);
      border-bottom: 1px solid var(--ss-line);
    }
  }
  .grid {
    display: grid;
    // Three per line on wide; degrade gracefully on narrower viewports.
    // minmax(0, 1fr) (not the implicit minmax(auto, 1fr)) forces every track to
    // an equal share: without the 0 floor a wide, non-wrapping preview — e.g.
    // Topbar's tabs + user email — blows its column past 1/3 and squeezes its
    // row-mates. The stage clips the overflow.
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ss-gap);
  }
  @media (max-width: 880px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 560px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    text-decoration: none;
    transition: border-color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      border-color: var(--ss-primary);
    }
    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
    }
  }

  .stage {
    // Fixed box keeps the grid stable no matter what the preview renders.
    // A transform turns this into the containing block for any position:fixed /
    // absolute descendant (BottomNav, Menu popover), so previews never escape.
    position: relative;
    height: 168px;
    overflow: hidden;
    transform: translateZ(0);
    pointer-events: none; // the whole card is the link; previews are illustrative
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--ss-s-4);
    background:
      linear-gradient(0deg, rgba(var(--ss-primary-rgb), 0.015), rgba(var(--ss-primary-rgb), 0.015)),
      var(--ss-bg);
    border-bottom: 1px solid var(--ss-line);

    // Full-bleed chrome (sidebar/topbar/bottom-nav/log-stream) fills the stage.
    &.bleed {
      padding: 0;
      align-items: stretch;
      justify-content: stretch;
    }
    &.bleed :global(.ss-side),
    &.bleed :global(.ss-topbar),
    &.bleed :global(.ss-logs) {
      width: 100%;
    }
    // Topbar is a horizontal bar, not a vertical fill like Sidebar/LogStream:
    // it has no intrinsic height (the app shell sizes it via its grid row), so
    // `align-items: stretch` blew it up to the full stage. Pin it to the top at
    // its real shell height, same as the docs top bar.
    &.bleed :global(.ss-topbar) {
      align-self: flex-start;
      height: var(--ss-shell-top-h);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--ss-s-2);
      flex-wrap: wrap;
      justify-content: center;
    }
    .icons {
      gap: var(--ss-s-3);
      color: var(--ss-fg-muted);
    }
    .w-full {
      width: 100%;
    }
    // Cap the Image preview so its 16/9 frame fits the stage (168px − 2×16px
    // padding = 136px tall → 136 × 16/9 ≈ 242px) instead of overflowing to full
    // height; the stage centers it, so it sits proportionally with breathing room.
    .img-preview {
      width: 100%;
      max-width: 220px;
    }
    // Heading preview: kill the display margin so the oversized type centers
    // in the fixed stage instead of pushing itself off-balance.
    .heading-preview :global(.ss-heading) {
      margin: 0;
    }
    // Container preview: dashed outline makes the (invisible) width wrapper legible.
    .container-demo {
      text-align: center;
      border: 1px dashed var(--ss-line-strong);
      padding: var(--ss-s-3);
    }
    .card-body {
      margin: 0;
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      color: var(--ss-fg-muted);
    }

    // static Toaster stand-in
    .toasts {
      display: flex;
      flex-direction: column;
      gap: var(--ss-s-2);
      width: 100%;
    }
    .ft {
      display: inline-flex;
      align-items: center;
      gap: var(--ss-s-2);
      padding: var(--ss-s-2) var(--ss-s-3);
      border: 1px solid var(--ss-line);
      background: var(--ss-bg-elev-hover);
      font-family: var(--ss-font-body);
      font-size: var(--ss-ui-md);
      color: var(--ss-fg);
    }
    .ft-g {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      font-weight: 700;
    }
    .ft-g.ok {
      color: var(--ss-primary);
    }
    .ft-g.info {
      color: var(--ss-cyan);
    }
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--ss-card-py) var(--ss-card-px);

    .name {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      color: var(--ss-fg-shine);
    }
    .tag {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
    }
  }
</style>
