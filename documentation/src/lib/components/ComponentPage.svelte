<script lang="ts">
  import type { ComponentDoc } from '$lib/docs.config'
  import StoryEmbed from './StoryEmbed.svelte'
  import CodeBlock from './CodeBlock.svelte'
  import PropsTable from './PropsTable.svelte'

  let { doc }: { doc: ComponentDoc } = $props()
</script>

<article>
  <header>
    <h1>{doc.name}</h1>
    <p class="tagline">{doc.tagline}</p>
    <p class="desc">{doc.description}</p>
  </header>

  <section>
    <h2>Demo</h2>
    <StoryEmbed storyId={doc.storyId} title={doc.name} />
  </section>

  <section>
    <h2>Usage</h2>
    <CodeBlock code={doc.usage} lang="svelte" />
    {#if doc.notes}
      <p class="notes">{doc.notes}</p>
    {/if}
  </section>

  <section>
    <h2>Props</h2>
    <PropsTable props={doc.props} />
  </section>
</article>

<style lang="scss">
  article {
    max-width: 56rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: var(--ss-block-gap);
  }
  header h1 {
    font-family: var(--ss-font-display);
    font-size: var(--ss-size-h1);
    color: var(--ss-fg-shine);
    margin: 0 0 var(--ss-s-2);
  }
  .tagline {
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-body);
    color: var(--ss-primary);
    margin: 0 0 var(--ss-s-3);
  }
  .desc {
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-sm);
    line-height: var(--ss-leading);
    color: var(--ss-fg-muted);
    margin: 0;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-3);
  }
  h2 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h2);
    color: var(--ss-fg-shine);
    margin: 0;
  }
  .notes {
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-sm);
    line-height: var(--ss-leading);
    color: var(--ss-fg-muted);
    margin: 0;
  }
</style>
