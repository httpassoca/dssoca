<script lang="ts">
  // mdsvex layout: wraps every `.svx` page's Markdown in a token-styled prose
  // shell. The Markdown elements are rendered by the child page (a different
  // Svelte scope), so they're styled via `:global(...)` below.
  let { children } = $props()
</script>

<article class="prose">
  {@render children?.()}
</article>

<style lang="scss">
  .prose {
    max-width: 56rem;
    margin-inline: auto;

    :global(h1) {
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h1);
      color: var(--ss-fg-shine);
      letter-spacing: -0.01em;
      margin: 0 0 var(--ss-s-3);
    }
    :global(h2) {
      font-family: var(--ss-font-subhead);
      font-size: var(--ss-size-h2);
      color: var(--ss-fg-shine);
      margin: var(--ss-s-10) 0 var(--ss-s-3);
      padding-bottom: var(--ss-s-2);
      border-bottom: 1px solid var(--ss-line);
    }
    :global(h3) {
      font-size: var(--ss-size-h3);
      color: var(--ss-fg-shine);
      margin: var(--ss-s-6) 0 var(--ss-s-2);
    }
    :global(p),
    :global(li) {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg);
    }
    :global(p) {
      margin: 0 0 var(--ss-s-4);
    }
    :global(ul),
    :global(ol) {
      margin: 0 0 var(--ss-s-4);
      padding-left: var(--ss-s-6);
      display: flex;
      flex-direction: column;
      gap: var(--ss-s-1);
    }
    :global(a) {
      color: var(--ss-primary);
      text-decoration: none;
      border-bottom: 1px solid var(--ss-primary-soft);
    }
    :global(a:hover) {
      border-bottom-color: var(--ss-primary);
    }
    :global(strong) {
      color: var(--ss-fg-shine);
      font-weight: 600;
    }
    :global(code) {
      font-family: var(--ss-font-mono);
      font-size: 0.9em;
      background: var(--ss-bg-elev);
      border: 1px solid var(--ss-line);
      padding: 0.1em 0.4em;
      color: var(--ss-lime);
    }
    :global(pre) {
      background: var(--ss-code-bg);
      color: var(--ss-code-fg);
      border: 1px solid var(--ss-line);
      padding: var(--ss-s-4);
      overflow-x: auto;
      margin: 0 0 var(--ss-s-4);
    }
    :global(pre code) {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
      font-size: var(--ss-size-xs);
    }
    :global(blockquote) {
      margin: 0 0 var(--ss-s-4);
      padding: var(--ss-s-1) var(--ss-s-4);
      border-left: 2px solid var(--ss-primary);
      color: var(--ss-fg-muted);
    }
    :global(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 var(--ss-s-4);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-size-xs);
    }
    :global(th),
    :global(td) {
      text-align: left;
      padding: var(--ss-s-2) var(--ss-s-3);
      border: 1px solid var(--ss-line);
    }
    :global(th) {
      color: var(--ss-fg-faint);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--ss-bg-elev);
    }
    :global(hr) {
      border: none;
      border-top: 1px solid var(--ss-line);
      margin: var(--ss-s-8) 0;
    }
  }
</style>
