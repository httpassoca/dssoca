<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import TokenGallery from '$lib/components/TokenGallery.svelte'

  // ------------------------------------------------------------------
  // Full inventory — everything public that the curated gallery above
  // doesn't visualise, so this page reflects the complete --ss-* surface
  // (same inventory as docs/tokens.md). Core tokens live in
  // src/styles/_tokens.scss; component tokens live in per-component
  // partials under src/styles/components/*.scss, joined by _index.scss.
  // ------------------------------------------------------------------
  const inventory: { title: string; note?: string; tokens: string[] }[] = [
    {
      title: 'remaining color tokens',
      note: 'theme axis (data-theme); washes are color-mix() derivations of the terminal slots',
      tokens: [
        '--ss-bg-inset',
        '--ss-fg-on-primary',
        '--ss-fg-on-danger',
        '--ss-selection-bg',
        '--ss-selection-fg',
        '--ss-code-number',
        '--ss-code-comment',
        '--ss-code-overlay',
        '--ss-badge-brand-border',
        '--ss-badge-neutral-border',
        '--ss-badge-positive-border',
        '--ss-badge-caution-border',
        '--ss-badge-critical-border',
        '--ss-badge-info-border',
      ],
    },
    {
      title: 'fonts',
      note: 'static',
      tokens: [
        '--ss-font-display',
        '--ss-font-subhead',
        '--ss-font-body',
        '--ss-font-alt',
        '--ss-font-mono',
      ],
    },
    {
      title: 'radii · elevation · motion',
      note: 'static — every radius is 0 (house rule); --ss-dur-* zero under reduced motion',
      tokens: [
        '--ss-radius-0',
        '--ss-radius-1',
        '--ss-radius-2',
        '--ss-radius-pill',
        '--ss-shadow-0',
        '--ss-shadow-1',
        '--ss-shadow-2',
        '--ss-shadow-pop',
        '--ss-shadow-glow',
        '--ss-ease',
        '--ss-dur-fast',
        '--ss-dur',
        '--ss-dur-slow',
        '--ss-dur-xslow',
        '--ss-icon-spin-dur',
      ],
    },
    {
      title: 'remaining size-axis tokens',
      note: 'size axis (data-size-variant)',
      tokens: [
        '--ss-leading',
        '--ss-ui-xs',
        '--ss-ui-sm',
        '--ss-ui-md',
        '--ss-ui-lg',
        '--ss-icon',
        '--ss-control-px',
        '--ss-input-py',
        '--ss-input-px',
        '--ss-panel-head-py',
        '--ss-panel-head-px',
        '--ss-panel-body-py',
        '--ss-panel-body-px',
        '--ss-card-py',
        '--ss-metric-val',
        '--ss-row-py',
        '--ss-row-px',
        '--ss-badge-px',
        '--ss-chip-py',
        '--ss-gap-sm',
        '--ss-main-py',
        '--ss-main-px',
        '--ss-side-badge-py',
        '--ss-side-badge-px',
        '--ss-empty-glyph-compact',
        '--ss-spark-gap',
      ],
    },
    {
      title: 'component tokens — Menu',
      note: 'size axis · src/styles/components/_menu.scss',
      tokens: [
        '--ss-menu-pad',
        '--ss-menu-item-py',
        '--ss-menu-item-px',
        '--ss-menu-item-gap',
        '--ss-menu-min-w',
        '--ss-menu-offset',
      ],
    },
    {
      title: 'component tokens — SegmentedControl',
      note: 'size axis · src/styles/components/_segmented-control.scss',
      tokens: ['--ss-seg-font', '--ss-seg-py', '--ss-seg-px', '--ss-seg-gap'],
    },
    {
      title: 'component tokens — Accordion',
      note: 'size axis · src/styles/components/_accordion.scss',
      tokens: [
        '--ss-acc-head-py',
        '--ss-acc-head-px',
        '--ss-acc-body-py',
        '--ss-acc-body-px',
        '--ss-acc-chevron',
        '--ss-acc-gap',
      ],
    },
    {
      title: 'component tokens — BottomNav',
      note: 'derived from the shell/spacing scale · src/styles/components/_bottom-nav.scss',
      tokens: [
        '--ss-bottom-nav-h',
        '--ss-bottom-nav-px',
        '--ss-bottom-nav-tab-py',
        '--ss-bottom-nav-gap',
        '--ss-bottom-nav-label-fs',
        '--ss-bottom-nav-badge-top',
        '--ss-bottom-nav-badge-dx',
        '--ss-bottom-nav-badge-min-w',
        '--ss-bottom-nav-badge-h',
        '--ss-bottom-nav-badge-fs',
        '--ss-bottom-nav-badge-px',
      ],
    },
    {
      title: 'component tokens — LogStream',
      note: 'viewport + column metrics (DS-0068) · src/styles/components/_log-stream.scss',
      tokens: ['--ss-log-min-h', '--ss-log-max-h', '--ss-log-t-w', '--ss-log-lvl-w'],
    },
    {
      title: 'component tokens — Image',
      note: 'size axis (chrome) + static/theme-aware washes · src/styles/components/_image.scss',
      tokens: [
        '--ss-image-glyph',
        '--ss-image-fallback-min',
        '--ss-image-close',
        '--ss-image-frame-bg',
        '--ss-image-shimmer',
        '--ss-image-shimmer-dur',
        '--ss-image-focus-w',
        '--ss-image-caption-gap',
        '--ss-image-backdrop',
        '--ss-image-lightbox-z',
        '--ss-image-lightbox-pad',
      ],
    },
    {
      title: 'component tokens — Heading',
      note: 'size axis · src/styles/components/_heading.scss',
      tokens: ['--ss-heading-size', '--ss-heading-mb', '--ss-heading-shadow'],
    },
    {
      title: 'component tokens — Container',
      note: 'size axis · src/styles/components/_container.scss',
      tokens: ['--ss-container-max-w', '--ss-container-px', '--ss-container-page-py'],
    },
    {
      title: 'component tokens — Spinner',
      note: 'size axis (font) + static color · src/styles/components/_spinner.scss',
      tokens: ['--ss-spinner-font', '--ss-spinner-color'],
    },
  ]

  let version = $state(0)

  function val(name: string): string {
    if (!browser) return ''
    version // re-read when the axes flip
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  onMount(() => {
    const obs = new MutationObserver(() => (version += 1))
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-size-variant'],
    })
    version += 1
    return () => obs.disconnect()
  })
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

  <section class="inventory">
    <h2>full inventory</h2>
    <p class="lede">
      The gallery above visualises the most-used tokens; the lists below complete the public
      <code>--ss-*</code> surface, live-resolved the same way. Core tokens are defined in
      <code>src/styles/_tokens.scss</code>;
      <strong>component tokens live in per-component partials</strong>
      under <code>src/styles/components/*.scss</code>, joined by
      <code>_index.scss</code>. Full reference (per-tier values, purpose):
      <code>docs/tokens.md</code> in the repo. The legacy <code>.hs-*</code> typography classes
      shipped by <code>theme.css</code> are <strong>deprecated</strong> — don't use them in new code.
    </p>
    {#each inventory as group (group.title)}
      <h3>
        {group.title}
        {#if group.note}<small>({group.note})</small>{/if}
      </h3>
      <div class="rows">
        {#each group.tokens as token (token)}
          <div class="row">
            <code class="tok">{token}</code>
            <code class="resolved">{val(token) || '…'}</code>
          </div>
        {/each}
      </div>
    {/each}
  </section>
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

  .inventory {
    margin-top: var(--ss-block-gap);

    h2 {
      font-family: var(--ss-font-subhead);
      font-size: var(--ss-size-h2);
      color: var(--ss-fg-shine);
      text-transform: lowercase;
      margin: 0 0 var(--ss-s-3);
      padding-bottom: var(--ss-s-2);
      border-bottom: 1px solid var(--ss-line);
    }
    .lede {
      font-family: var(--ss-font-body);
      font-size: var(--ss-size-sm);
      line-height: var(--ss-leading);
      color: var(--ss-fg-muted);
      margin: 0 0 var(--ss-s-4);

      code {
        font-family: var(--ss-font-mono);
        color: var(--ss-lime);
      }
      strong {
        color: var(--ss-fg-shine);
      }
    }
    h3 {
      font-family: var(--ss-font-subhead);
      font-size: var(--ss-size-h3);
      color: var(--ss-fg-shine);
      text-transform: lowercase;
      margin: var(--ss-s-6) 0 var(--ss-s-3);

      small {
        font-family: var(--ss-font-mono);
        font-size: var(--ss-ui-xs);
        color: var(--ss-fg-faint);
        text-transform: none;
      }
    }
    .rows {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--ss-line);
    }
    .row {
      display: flex;
      align-items: baseline;
      gap: var(--ss-gap);
      padding: var(--ss-s-2) var(--ss-s-3);
      border-bottom: 1px solid var(--ss-line);

      &:last-child {
        border-bottom: none;
      }
    }
    code {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
    }
    .tok {
      color: var(--ss-fg);
      min-width: 220px;
    }
    .resolved {
      color: var(--ss-fg-faint);
      margin-left: auto;
      text-align: right;
      overflow-wrap: anywhere;
    }
  }
</style>
