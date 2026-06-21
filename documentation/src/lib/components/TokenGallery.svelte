<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'

  // Token groups rendered live from the real --ss-* custom properties. The
  // swatch/preview itself reads the var via CSS (so it recolours/rescales with
  // the axes automatically); the resolved value text is read with
  // getComputedStyle and refreshed whenever the <html> axes change.
  const colorGroups: { title: string; tokens: string[] }[] = [
    {
      title: 'surfaces',
      tokens: [
        '--ss-bg',
        '--ss-bg-elev',
        '--ss-bg-elev-hover',
        '--ss-line',
        '--ss-line-strong',
        '--ss-hover',
      ],
    },
    {
      title: 'foreground',
      tokens: ['--ss-fg', '--ss-fg-shine', '--ss-fg-muted', '--ss-fg-faint', '--ss-fg-on-primary'],
    },
    {
      title: 'brand',
      tokens: ['--ss-primary', '--ss-primary-soft', '--ss-primary-hover', '--ss-lime'],
    },
    {
      title: 'status',
      tokens: ['--ss-red', '--ss-yellow', '--ss-blue', '--ss-cyan', '--ss-purple'],
    },
    {
      title: 'sentiment',
      tokens: [
        '--ss-success',
        '--ss-success-soft',
        '--ss-danger',
        '--ss-danger-hover',
        '--ss-danger-soft',
        '--ss-skeleton',
      ],
    },
    {
      title: 'log levels',
      tokens: ['--ss-log-info', '--ss-log-warn', '--ss-log-err', '--ss-log-ok'],
    },
    {
      title: 'badge tones',
      tokens: [
        '--ss-badge-brand-bg',
        '--ss-badge-neutral-bg',
        '--ss-badge-positive-bg',
        '--ss-badge-caution-bg',
        '--ss-badge-critical-bg',
        '--ss-badge-info-bg',
      ],
    },
    {
      title: 'code',
      tokens: [
        '--ss-code-bg',
        '--ss-code-fg',
        '--ss-code-string',
        '--ss-code-keyword',
        '--ss-code-func',
      ],
    },
  ]

  const typeScale = [
    '--ss-size-display',
    '--ss-size-h1',
    '--ss-size-h2',
    '--ss-size-h3',
    '--ss-size-body',
    '--ss-size-sm',
    '--ss-size-xs',
  ]

  const spacing = [
    '--ss-s-1',
    '--ss-s-2',
    '--ss-s-3',
    '--ss-s-4',
    '--ss-s-5',
    '--ss-s-6',
    '--ss-s-8',
    '--ss-s-10',
    '--ss-s-12',
    '--ss-s-16',
  ]

  // Size-axis tokens — these change when you flip data-size-variant.
  const sizeAxis = [
    '--ss-control-font',
    '--ss-control-py',
    '--ss-input-font',
    '--ss-card-px',
    '--ss-gap',
    '--ss-block-gap',
    '--ss-shell-side-w',
    '--ss-shell-top-h',
    '--ss-badge-dot',
    '--ss-badge-gap',
    '--ss-side-w',
    '--ss-side-w-rail',
    '--ss-spark-h',
    '--ss-spark-bar-w',
    '--ss-toast-ic',
    '--ss-toast-swipe',
    '--ss-empty-glyph',
    '--ss-empty-max-w',
  ]

  let version = $state(0)

  function val(name: string): string {
    if (!browser) return ''
    // `version` read makes resolved values recompute on axis change.
    version
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  onMount(() => {
    const obs = new MutationObserver(() => (version += 1))
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-size-variant'],
    })
    version += 1 // initial read after hydration
    return () => obs.disconnect()
  })
</script>

<div class="gallery">
  {#each colorGroups as group (group.title)}
    <section>
      <h3>{group.title}</h3>
      <div class="swatches">
        {#each group.tokens as token (token)}
          <div class="swatch">
            <div class="chip" style="background: var({token})"></div>
            <div class="meta">
              <code class="tok">{token}</code>
              <code class="resolved">{val(token) || '…'}</code>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/each}

  <section>
    <h3>type scale</h3>
    <div class="rows">
      {#each typeScale as token (token)}
        <div class="row">
          <span class="sample" style="font-size: var({token})">Aa</span>
          <code class="tok">{token}</code>
          <code class="resolved">{val(token) || '…'}</code>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3>spacing scale</h3>
    <div class="rows">
      {#each spacing as token (token)}
        <div class="row">
          <span class="bar" style="width: var({token})"></span>
          <code class="tok">{token}</code>
          <code class="resolved">{val(token) || '…'}</code>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h3>size axis <small>(changes with data-size-variant)</small></h3>
    <div class="rows">
      {#each sizeAxis as token (token)}
        <div class="row">
          <span class="bar" style="width: var({token})"></span>
          <code class="tok">{token}</code>
          <code class="resolved">{val(token) || '…'}</code>
        </div>
      {/each}
    </div>
  </section>
</div>

<style lang="scss">
  .gallery {
    display: flex;
    flex-direction: column;
    gap: var(--ss-block-gap);
  }
  h3 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h3);
    color: var(--ss-fg-shine);
    text-transform: lowercase;
    margin: 0 0 var(--ss-s-3);

    small {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
      text-transform: none;
    }
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--ss-gap);
  }
  .swatch {
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
  }
  .chip {
    height: 56px;
    border-bottom: 1px solid var(--ss-line);
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--ss-s-2) var(--ss-s-3);
  }
  .rows {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ss-line);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--ss-gap);
    padding: var(--ss-s-2) var(--ss-s-3);
    border-bottom: 1px solid var(--ss-line);

    &:last-child {
      border-bottom: none;
    }
  }
  .sample {
    color: var(--ss-fg-shine);
    font-family: var(--ss-font-display);
    line-height: 1;
    width: 80px;
    overflow: hidden;
  }
  .bar {
    display: inline-block;
    height: 12px;
    background: var(--ss-primary);
    flex: none;
  }
  code {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
  }
  .tok {
    color: var(--ss-fg);
  }
  .resolved {
    color: var(--ss-fg-faint);
    margin-left: auto;
  }
  .row .tok {
    min-width: 180px;
  }
</style>
