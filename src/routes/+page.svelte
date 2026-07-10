<script lang="ts">
  // The hub-dashboard showcase was removed in DS-0010 — the documentation site
  // (documentation/, run with `pnpm docs:dev`) is now the live preview, and
  // Storybook (`pnpm storybook`) is the interactive component explorer.
  // This stub keeps the library's SvelteKit app valid (sync/dev/Storybook).
</script>

<svelte:head>
  <title>dssoca</title>
</svelte:head>

<main>
  <h1>dssoca</h1>
  <p>Svelte 5 design system.</p>
  <ul>
    <li><strong>Docs site:</strong> <code>pnpm docs:dev</code> (in <code>documentation/</code>)</li>
    <li><strong>Storybook:</strong> <code>pnpm storybook</code></li>
  </ul>
</main>

<style>
  main {
    font-family: ui-monospace, monospace;
    max-width: 40rem;
    margin: 4rem auto;
    padding: 0 1.5rem;
    color: var(--ss-fg, #dae0da);
  }
  code {
    color: var(--ss-accent, #66ef73);
  }
</style>
