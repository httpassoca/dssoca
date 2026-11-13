<script lang="ts">
  // "Changelog" section at the end of a component page (DS-0196): what changed in THIS component,
  // release by release. The data is assembled at build time — see lib/component-changelog.
  import type { ComponentReleaseView } from '$lib/server/changelog'
  import ChangeBadge from './ChangeBadge.svelte'

  let { releases, name }: { releases: ComponentReleaseView[]; name: string } = $props()
</script>

{#if releases.length === 0}
  <p class="empty">No changes recorded for {name} yet.</p>
{:else}
  <ol class="releases" aria-label="{name} changes by release">
    {#each releases as r (r.version)}
      <li class="release">
        <div class="head">
          {#if r.href}
            <a class="version" href={r.href}>{r.version}</a>
          {:else}
            <span class="version">{r.version}</span>
          {/if}
          {#if r.date}<time datetime={r.date}>{r.date}</time>{/if}
        </div>
        <ul class="changes">
          {#each r.changes as c, i (i)}
            <li>
              <span class="badges"><ChangeBadge type={c.type} breaking={c.breaking} /></span>
              <!-- Developer-authored Markdown, escaped and rendered by renderInline (trusted). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              <span class="text">{@html c.html}</span>
              {#if c.refs.length}
                <span class="refs">
                  {#each c.refs as ref (ref.label)}
                    {#if ref.url}
                      <a href={ref.url} target="_blank" rel="noopener noreferrer"
                        >{ref.label}<span class="sr"> (opens in a new tab)</span></a
                      >
                    {:else}
                      <span>{ref.label}</span>
                    {/if}
                  {/each}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ol>
{/if}
<p class="more">Every release, across all components: <a href="/changelog">Changelog</a>.</p>

<style lang="scss">
  .releases,
  .changes {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .releases {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ss-line);
  }
  .release {
    display: grid;
    grid-template-columns: 8rem 1fr;
    gap: var(--ss-s-4);
    padding: var(--ss-s-4);

    & + .release {
      border-block-start: 1px solid var(--ss-line);
    }
  }
  .head {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-1);
    font-family: var(--ss-font-mono);
  }
  .version {
    font-size: var(--ss-size-sm);
    font-weight: 600;
    color: var(--ss-fg-shine);
  }
  a.version {
    color: var(--ss-primary);
  }
  time {
    font-size: var(--ss-size-xs);
    color: var(--ss-fg-muted);
  }
  .changes {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-3);
    min-inline-size: 0;

    li {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg);
    }
  }
  .badges {
    display: inline-flex;
    gap: var(--ss-s-1);
    margin-inline-end: var(--ss-s-2);
    vertical-align: middle;
  }
  .text {
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
    :global(a) {
      color: var(--ss-primary);
    }
  }
  .refs {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--ss-s-2);
    margin-inline-start: var(--ss-s-1);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
    color: var(--ss-fg-muted);

    a {
      color: var(--ss-fg-muted);

      &:hover {
        color: var(--ss-primary);
      }
    }
  }
  .sr {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .empty,
  .more {
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-sm);
    line-height: var(--ss-leading);
    color: var(--ss-fg-muted);
    margin: 0;
  }
  .more a {
    color: var(--ss-primary);
  }
  @media (max-width: 720px) {
    .release {
      grid-template-columns: 1fr;
      gap: var(--ss-s-2);
    }
    .head {
      flex-direction: row;
      align-items: baseline;
      gap: var(--ss-s-3);
    }
  }
</style>
