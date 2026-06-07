<script lang="ts">
  import TokenGallery from '$lib/components/TokenGallery.svelte';
</script>

<svelte:head>
  <title>Tokens — dssoca</title>
</svelte:head>

<div class="page">
  <header>
    <h1>Tokens</h1>
    <p>
      Every value below is a live <code>--ss-*</code> custom property read from this page's
      <code>&lt;html&gt;</code>. Flip the <strong>theme</strong> and <strong>size</strong> controls in
      the top bar and watch the swatches and scales update — that's the whole system.
    </p>
  </header>
  <TokenGallery />
</div>

<style lang="scss">
  .page {
    max-width: 56rem;
  }
  header {
    margin-bottom: var(--ss-block-gap);

    h1 {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h1);
      color: var(--ss-fg-shine);
      margin: 0 0 var(--ss-s-3);
    }
    p {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      margin: 0;

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
      strong {
        color: var(--ss-fg-shine);
      }
    }
  }
</style>
