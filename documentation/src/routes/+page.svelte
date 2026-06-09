<script lang="ts">
  import { browser } from '$app/environment';
  import { Button } from 'dssoca';
  import { COMPONENTS } from '$lib/docs.config';
  import Hub from '$lib/components/Hub.svelte';
</script>

<svelte:head>
  <title>dssoca — a Svelte 5 design system</title>
</svelte:head>

<section class="landing">
  <!-- The live component "workstation" behind the hero (client-only). -->
  {#if browser}
    <div class="hub-bg"><Hub /></div>
  {/if}
  <div class="scrim" aria-hidden="true"></div>

  <div class="hero">
    <svg class="mark" viewBox="0 0 103 89" width="72" height="62" aria-hidden="true">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M51.5 0L0 89H103L51.5 0ZM23.8643 80.151H87.6468L71.6884 52.5724L23.8643 80.151ZM65.5911 42.0354L60.7383 33.649L46.1956 42.0354H65.5911ZM56.14 25.7024L51.5 17.6837L42.2125 33.7339L56.14 25.7024ZM32.0977 51.2138L20.2949 71.6111L55.6656 51.2138H32.0977Z"
        fill="currentColor"
      />
    </svg>
    <h1 class="wordmark">DSSOCA</h1>
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
  // Break out of the docs `.main` padding so the landing is full-bleed, and fill
  // the viewport below the top bar.
  .landing {
    position: relative;
    margin: calc(-1 * var(--ss-main-py)) calc(-1 * var(--ss-main-px));
    min-height: calc(100vh - var(--ss-shell-top-h));
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hub-bg {
    position: absolute;
    inset: 0;
  }

  // Vignette over the field so the hero stays legible; theme-safe via color-mix,
  // and transparent to pointer events so the field underneath stays hoverable.
  .scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(
      ellipse 70% 60% at 50% 46%,
      color-mix(in srgb, var(--ss-bg) 92%, transparent) 0%,
      color-mix(in srgb, var(--ss-bg) 70%, transparent) 42%,
      color-mix(in srgb, var(--ss-bg) 0%, transparent) 78%
    );
  }

  .hero {
    position: relative;
    z-index: 2;
    // Let hover fall through to the field behind; only the buttons opt back in.
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--ss-main-px);
    max-width: 50rem;

    .mark {
      color: var(--ss-primary);
      margin-bottom: var(--ss-s-5);
      filter: drop-shadow(0 0 24px rgba(var(--ss-primary-rgb), 0.35));
    }

    .wordmark {
      font-family: var(--ss-font-display);
      font-size: clamp(2.75rem, 8vw, var(--ss-size-display));
      letter-spacing: 0.14em;
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-4);
      // first letter sits flush; the tracking pushes the last one out
      padding-left: 0.14em;
    }

    .lede {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-body);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      margin: 0 0 var(--ss-s-7);
      max-width: 42rem;

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
      // re-enable interaction for the actions only
      pointer-events: auto;

      a {
        text-decoration: none;
      }
    }
  }

  @media (max-width: 560px) {
    .hero .cta { flex-direction: column; align-items: stretch; width: 100%; max-width: 18rem; }
  }
</style>
