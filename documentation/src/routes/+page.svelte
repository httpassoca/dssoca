<script lang="ts">
  import { Button, Badge, Card } from 'dssoca';
  import { COMPONENTS } from '$lib/docs.config';
</script>

<svelte:head>
  <title>dssoca — a Svelte 5 design system</title>
</svelte:head>

<section class="hero">
  <div class="mark"><img src="/passoca-logo.svg" alt="" width="56" height="56" /></div>
  <h1>dssoca</h1>
  <p class="lede">
    A token-driven <strong>Svelte 5</strong> design system — signal green on near-black,
    monospace-forward, <strong>zero border-radius</strong> everywhere. One <code>theme.css</code> and
    {COMPONENTS.length} components, configured along two orthogonal axes.
  </p>
  <div class="cta">
    <a href="/introduction"><Button variant="primary">Get started</Button></a>
    <a href="/components/button"><Button variant="secondary">Browse components</Button></a>
  </div>
</section>

<section class="axes">
  <Card title="Color axis" meta="data-theme">
    <p>Flip <code>data-theme</code> on any ancestor — <code>dark</code> (default) or <code>light</code> — and everything below recolors.</p>
    <div class="badges"><Badge tone="up">dark</Badge><Badge tone="info">light</Badge></div>
  </Card>
  <Card title="Size axis" meta="data-size-variant">
    <p>Flip <code>data-size-variant</code> — <code>sm</code> · <code>md</code> (default) · <code>lg</code> — and the chrome rescales from token values.</p>
    <div class="badges"><Badge tone="info">sm</Badge><Badge tone="up">md</Badge><Badge tone="info">lg</Badge></div>
  </Card>
</section>

<section class="grid">
  <h2>Components</h2>
  <div class="cards">
    {#each COMPONENTS as c (c.slug)}
      <a class="tile" href={`/components/${c.slug}`}>
        <span class="tname">{c.name}</span>
        <span class="ttag">{c.tagline}</span>
      </a>
    {/each}
  </div>
</section>

<style lang="scss">
  .hero {
    max-width: 56rem;
    padding: var(--ss-s-12) 0 var(--ss-s-10);

    .mark {
      margin-bottom: var(--ss-s-4);

      img {
        display: block;
      }
    }
    h1 {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-display);
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-4);
    }
    .lede {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-body);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      max-width: 44rem;
      margin: 0 0 var(--ss-s-6);

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
    }
    .cta {
      display: flex;
      gap: var(--ss-s-2);

      a {
        text-decoration: none;
      }
    }
  }
  .axes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--ss-gap);
    margin-bottom: var(--ss-block-gap);

    p {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg);
      margin: 0 0 var(--ss-s-3);

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
    }
    .badges {
      display: flex;
      gap: var(--ss-s-1);
    }
  }
  .grid h2 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h2);
    color: var(--ss-fg-shine);
    margin: 0 0 var(--ss-s-4);
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--ss-gap);
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-1);
    padding: var(--ss-card-py) var(--ss-card-px);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    text-decoration: none;
    transition: border-color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      border-color: var(--ss-primary);
    }
    .tname {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      color: var(--ss-fg-shine);
    }
    .ttag {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
    }
  }
</style>
