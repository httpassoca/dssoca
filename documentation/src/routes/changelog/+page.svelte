<script lang="ts">
  // /changelog (DS-0196): the repo-root CHANGELOG.md rendered release by release. Each component
  // page ends with its own slice of the same data.
  import { REPO_URL } from '$lib/changelog'
  import ChangeBadge from '$lib/components/ChangeBadge.svelte'

  let { data } = $props()
  const tagged = $derived(data.releases.filter((r) => /^\d+\.\d+\.\d+$/.test(r.version)))
</script>

<svelte:head>
  <title>Changelog — dssoca</title>
  <meta
    name="description"
    content="Every dssoca release: what was added, changed, fixed and removed."
  />
</svelte:head>

<article class="changelog">
  <header>
    <h1>Changelog</h1>
    <p class="lede">
      Every release of dssoca, newest first. The project follows
      <a href="https://semver.org/spec/v2.0.0.html" target="_blank" rel="noopener noreferrer"
        >Semantic Versioning</a
      >; until <code>1.0.0</code> a minor version may include breaking changes, and those are marked
      <strong>Breaking</strong>. Each component page ends with its own history.
    </p>
    <p class="links">
      <a href="{REPO_URL}/releases" target="_blank" rel="noopener noreferrer">GitHub releases</a>
      <a
        href="https://www.npmjs.com/package/dssoca?activeTab=versions"
        target="_blank"
        rel="noopener noreferrer">npm versions</a
      >
      <a href="{REPO_URL}/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer"
        >CHANGELOG.md</a
      >
    </p>
    <nav class="jump" aria-label="Releases">
      {#each tagged as r (r.id)}
        <a href="#{r.id}">{r.version}</a>
      {/each}
    </nav>
  </header>

  {#each data.releases as r (r.id)}
    <section class="release" id={r.id} aria-labelledby="{r.id}-title">
      <div class="head">
        <h2 id="{r.id}-title">
          <a class="anchor" href="#{r.id}">{r.version}</a>
          {#if r.title}<span class="title">{r.title}</span>{/if}
        </h2>
        <p class="meta">
          {#if r.date}<time datetime={r.date}>{r.date}</time>{/if}
          {#if r.url}
            <a href={r.url} target="_blank" rel="noopener noreferrer"
              >{r.url.includes('/compare/') ? 'Compare on GitHub' : 'Release on GitHub'}</a
            >
          {/if}
        </p>
      </div>

      <!-- Developer-authored Markdown from CHANGELOG.md, escaped by renderInline (trusted). -->
      {#each r.intro as p, i (i)}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <p class="intro">{@html p}</p>
      {/each}

      {#each r.sections as s, i (i)}
        <div class="section">
          <h3>
            {#if s.type}<ChangeBadge type={s.type} />{:else}{s.heading}{/if}
          </h3>
          {#each s.paragraphs as p, j (j)}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <p class="intro">{@html p}</p>
          {/each}
          {#if s.items.length}
            <ul>
              {#each s.items as item, j (j)}
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                <li>{@html item}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </section>
  {/each}
</article>

<style lang="scss">
  .changelog {
    max-width: 56rem;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-10);

    a {
      color: var(--ss-primary);
    }
    :global(code) {
      font-family: var(--ss-font-mono);
      font-size: 0.9em;
      color: var(--ss-lime);
      overflow-wrap: anywhere;
    }
    :global(strong) {
      color: var(--ss-fg-shine);
      font-weight: 600;
    }
    :global(li a),
    :global(.intro a) {
      color: var(--ss-primary);
    }
  }
  h1 {
    font-family: var(--ss-font-display);
    font-size: var(--ss-size-h1);
    color: var(--ss-fg-shine);
    margin: 0 0 var(--ss-s-3);
  }
  .lede,
  .intro,
  li {
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-sm);
    line-height: var(--ss-leading);
    color: var(--ss-fg);
    margin: 0;
  }
  .lede {
    color: var(--ss-fg-muted);
  }
  .links,
  .jump {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ss-s-2) var(--ss-s-4);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
    margin: var(--ss-s-4) 0 0;
  }
  .jump {
    padding: var(--ss-s-3);
    border: 1px solid var(--ss-line);
    gap: var(--ss-s-1) var(--ss-s-3);

    a {
      color: var(--ss-fg-muted);
      // 24px touch target without growing the text.
      min-block-size: var(--ss-s-6);
      display: inline-flex;
      align-items: center;

      &:hover {
        color: var(--ss-primary);
      }
    }
  }
  .release {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-4);
    // Anchored releases must clear the sticky top bar.
    scroll-margin-block-start: calc(var(--ss-shell-top-h) + var(--ss-s-4));
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--ss-s-2) var(--ss-s-4);
    padding-block-end: var(--ss-s-2);
    border-block-end: 1px solid var(--ss-line);
  }
  h2 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h2);
    color: var(--ss-fg-shine);
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--ss-s-2) var(--ss-s-3);

    .anchor {
      color: var(--ss-fg-shine);
      text-decoration: none;

      &:hover {
        color: var(--ss-primary);
      }
    }
    .title {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      color: var(--ss-fg-muted);
    }
  }
  .meta {
    display: flex;
    gap: var(--ss-s-4);
    margin: 0;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
    color: var(--ss-fg-muted);
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
  }
  h3 {
    margin: 0;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
    color: var(--ss-fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  ul {
    margin: 0;
    padding-inline-start: var(--ss-s-6);
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
  }
</style>
