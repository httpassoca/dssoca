<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from 'dssoca';
  import { COMPONENTS } from '$lib/docs.config';
  import Hub from '$lib/components/Hub.svelte';
</script>

<svelte:head>
  <title>dssoca — a Svelte 5 design system</title>
</svelte:head>

<!-- Full-screen branded landing. The docs shell (top bar + sidebar) is hidden on
     this route by +layout.svelte; data-theme is pinned dark for the gradient. -->
<section class="landing" data-theme="dark">
  <!-- The live component "workstation" behind the hero (client-only). -->
  {#if browser}
    <div class="hub-bg"><Hub /></div>
  {/if}

  <div class="hero">
    <div class="brand">
      <svg class="mark" viewBox="0 0 103 89" aria-hidden="true">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M51.5 0L0 89H103L51.5 0ZM23.8643 80.151H87.6468L71.6884 52.5724L23.8643 80.151ZM65.5911 42.0354L60.7383 33.649L46.1956 42.0354H65.5911ZM56.14 25.7024L51.5 17.6837L42.2125 33.7339L56.14 25.7024ZM32.0977 51.2138L20.2949 71.6111L55.6656 51.2138H32.0977Z"
          fill="currentColor"
        />
      </svg>
      <h1 class="wordmark">DSSOCA</h1>
    </div>

    <p class="lede">
      A token-driven <strong>Svelte&nbsp;5</strong> design system — signal green on near-black,
      monospace-forward, <strong>zero border-radius</strong> everywhere. One <code>theme.css</code>
      and {COMPONENTS.length} components, configured along two orthogonal axes.
    </p>

    <div class="cta">
      <a href="/introduction"><Button variant="primary">Get started</Button></a>
      <a href="/components"><Button variant="secondary">Browse components</Button></a>
    </div>
  </div>
</section>

<style lang="scss">
  .landing {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    // The requested page gradient sits *behind* the dimmed tiles (which show it
    // through their opacity) — so a hovered tile becomes opaque and pops to full.
    background:
      radial-gradient(circle, rgba(0, 0, 0, 0.83) 0%, rgba(0, 0, 0, 0.4) 100%),
      var(--ss-bg);
  }

  .hub-bg {
    position: absolute;
    inset: 0;
    // no stacking context here, so a hovered tile can lift above its neighbours
  }

  .hero {
    position: relative;
    z-index: 10; // above every tile (incl. a hovered one at z:5)
    // Let hover fall through to the field behind; only the buttons opt back in.
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--ss-main-px);
    max-width: 54rem;

    // logo + wordmark, side by side
    .brand {
      display: flex;
      align-items: center;
      gap: var(--ss-s-4);
      margin-bottom: var(--ss-s-6);
    }
    .mark {
      flex: 0 0 auto;
      width: clamp(48px, 7vw, 76px);
      height: auto;
      color: var(--ss-primary);
      filter: drop-shadow(0 0 22px rgba(var(--ss-primary-rgb), 0.45));
    }
    .wordmark {
      margin: 0;
      font-family: var(--ss-font-display);
      font-size: clamp(2.5rem, 7vw, var(--ss-size-display));
      letter-spacing: 0.12em;
      padding-left: 0.12em; // balance the tracking on the trailing letter
      color: var(--ss-fg-shine);
      text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
    }

    .lede {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-body);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      max-width: 42rem;
      // clear separation between the description and the buttons
      margin: 0 0 var(--ss-s-8);
      // a dark halo so the text stays legible over a bright hovered tile
      text-shadow: 0 1px 12px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.85);

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
      strong {
        color: var(--ss-fg);
        font-weight: 600;
      }
    }

    .cta {
      display: flex;
      gap: var(--ss-s-3);
      flex-wrap: wrap;
      justify-content: center;
      pointer-events: auto; // re-enable interaction for the actions only

      a {
        text-decoration: none;
      }
    }
  }

  // Mobile: drop the component field entirely — just the hero on the gradient.
  @media (max-width: 640px) {
    .hub-bg {
      display: none;
    }
  }
  @media (max-width: 560px) {
    .hero .cta {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      max-width: 18rem;
    }
  }
</style>
