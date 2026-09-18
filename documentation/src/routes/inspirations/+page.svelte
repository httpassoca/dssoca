<script lang="ts">
  // Inspirations gallery inside the docs (DS-0158). The cards come from the same manifest the
  // GitHub Pages gallery is rendered from (`inspirations/manifest.json`, via the
  // `@dssoca/inspirations` alias) so nothing is written twice; the example sites themselves —
  // and their screenshot thumbnails — stay on the Pages host, since that is where the
  // plain-HTML pages are served. Thumbnails are hot-linked from there; when one is missing (a
  // site added since the last Pages deploy) the token-striped placeholder shows instead.
  import { onMount } from 'svelte'
  import { Badge, Card } from 'dssoca'
  import manifest from '@dssoca/inspirations/manifest.json'
  import { INSPIRATIONS_URL } from '$lib/docs.config'

  interface Site {
    slug: string
    title: string
    kind: string
    blurb: string
    components: string[]
  }
  const sites: Site[] = manifest

  const siteUrl = (slug: string) => `${INSPIRATIONS_URL}${slug}/`
  const thumbUrl = (slug: string) => `${INSPIRATIONS_URL}thumbs/${slug}.png`
  const alt = (site: Site) => `Screenshot of the ${site.title.toLowerCase()} example`

  // Slugs whose thumbnail failed to load. The page is prerendered, so an image can error before
  // hydration attaches `onerror` — the mount check covers that window.
  let missing = $state<Record<string, boolean>>({})
  let grid: HTMLElement | undefined = $state()
  onMount(() => {
    for (const img of grid?.querySelectorAll<HTMLImageElement>('img[data-slug]') ?? []) {
      if (img.complete && img.naturalWidth === 0) missing[img.dataset.slug!] = true
    }
  })
</script>

<svelte:head>
  <title>Inspirations · dssoca</title>
</svelte:head>

<section class="intro">
  <h1>Inspirations</h1>
  <p class="lede">
    {sites.length} kinds of website, each written by hand in plain HTML with
    <code>dssoca/vanilla.css</code> and <code>dssoca/vanilla.js</code> — no framework, no build step.
    Every card opens its example in a new tab; view the source, copy what you like. The pages follow the
    same two design axes as this site.
  </p>
  <p class="standalone">
    The examples are served from the standalone
    <a href={INSPIRATIONS_URL} target="_blank" rel="noopener noreferrer"
      >Inspirations site on GitHub Pages</a
    >, rebuilt from the current source on every release. See the
    <a href="/vanilla">Plain HTML &amp; CSS</a> guide for the path they are built on.
  </p>
</section>

<ul class="grid" aria-label="Example sites" bind:this={grid}>
  {#each sites as site (site.slug)}
    <li>
      <Card
        title={site.title}
        description={site.kind}
        meta="↗"
        titleLevel={2}
        href={siteUrl(site.slug)}
        external
      >
        {#snippet media()}
          <div class="thumb" class:missing={missing[site.slug]}>
            <img
              src={thumbUrl(site.slug)}
              alt={alt(site)}
              loading="lazy"
              width="1280"
              height="800"
              data-slug={site.slug}
              onerror={() => (missing[site.slug] = true)}
            />
            <span class="placeholder" aria-hidden="true">{site.slug}</span>
          </div>
        {/snippet}
        <p class="blurb">{site.blurb}</p>
        <div class="chips">
          {#each site.components as c (c)}
            <Badge tone="neutral">{c}</Badge>
          {/each}
        </div>
      </Card>
    </li>
  {/each}
</ul>

<style lang="scss">
  .intro {
    margin: 0 0 var(--ss-block-gap);

    h1 {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h1);
      color: var(--ss-fg-shine);
      letter-spacing: -0.01em;
      margin: 0 0 var(--ss-s-3);
    }
    .lede,
    .standalone {
      max-width: 64ch;
      margin: 0;
      color: var(--ss-fg-muted);
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: 1.6;
    }
    .standalone {
      margin-top: var(--ss-s-3);
    }
    code {
      font-family: var(--ss-font-mono);
      font-size: 0.92em;
      color: var(--ss-fg);
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ss-gap);
    list-style: none;
    margin: 0;
    padding: 0;

    > li {
      display: contents;
    }

    // Two rows, not two columns (DS-0158): title with the ↗ at its end, then the kind on its
    // own line. Mirrors `.insp-grid .ss-card .head` in inspirations/site.css so the two
    // galleries can't diverge.
    :global(.ss-card .head) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
    }
    :global(.ss-card .head .heading) {
      display: contents;
    }
    :global(.ss-card .head .title) {
      grid-column: 1;
      grid-row: 1;
    }
    :global(.ss-card .head .actions) {
      grid-column: 2;
      grid-row: 1;
    }
    :global(.ss-card .head .desc) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
  }

  .thumb {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: var(--ss-bg);
    border-bottom: 1px solid var(--ss-line);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      transition: transform var(--ss-dur-slow) var(--ss-ease);
    }
    // Token-striped stand-in when the Pages host has no screenshot for this slug yet.
    .placeholder {
      position: absolute;
      inset: 0;
      display: none;
      place-items: center;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ss-fg-faint);
      background: repeating-linear-gradient(
        135deg,
        color-mix(in oklab, var(--ss-primary) 8%, transparent) 0 8px,
        transparent 8px 16px
      );
    }
    &.missing img {
      display: none;
    }
    &.missing .placeholder {
      display: grid;
    }
  }
  // `.thumb` is this page's own class inside the (global) Card root, so the whole chain is
  // global here — a `:global()` can't sit mid-selector.
  .grid :global(.ss-card:hover .thumb img) {
    transform: scale(1.02);
  }

  .blurb {
    margin: 0;
    color: var(--ss-fg-muted);
    font-size: var(--ss-ui-md);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ss-gap-xs);
    margin-top: var(--ss-s-2);
  }

  @media (max-width: 1000px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
