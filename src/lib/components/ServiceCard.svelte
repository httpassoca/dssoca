<script lang="ts">
  import type { Snippet } from 'svelte'
  import Badge from './Badge.svelte'
  import Sparkline from './Sparkline.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  type Status = 'up' | 'deg' | 'down' | 'maint'

  interface Props {
    name: string
    host: string
    status?: Status
    latency?: string
    /** Sparkline series. Defaults to `[]` (an honest "No data" state, not a made-up trend). */
    spark?: number[]
    /** Makes the card interactive via a stretched overlay `<button>` (native Enter/Space). */
    onclick?: () => void
    /** When set, the card's overlay is a real `<a>` that navigates here (native Enter). */
    href?: string
    /** Render skeleton placeholders and mark the card `aria-busy`; suppresses interaction. */
    loading?: boolean
    /** Inert variant: `aria-disabled`, no focus/pointer, no onclick/href. */
    disabled?: boolean
    /** "Last checked" instant; rendered as relative time in a `<time datetime>` footer slot. */
    updatedAt?: Date | string
    /**
     * Optional extra metadata rows (version, IP, tags…) below the head. Sits above the card's
     * overlay control, so links/buttons in it stay separately focusable and clickable.
     */
    meta?: Snippet
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let {
    name,
    host,
    status = 'up',
    latency = '',
    spark = [],
    onclick,
    href,
    loading = false,
    disabled = false,
    updatedAt,
    meta,
    size,
  }: Props = $props()

  const sparkColor = $derived(
    status === 'deg'
      ? 'var(--ss-yellow)'
      : status === 'down'
        ? 'var(--ss-red)'
        : status === 'maint'
          ? 'var(--ss-blue)'
          : 'var(--ss-primary)',
  )

  // Spell the status out for assistive tech (the abbreviations are opaque).
  const statusLabel = $derived(
    status === 'deg' ? 'degraded' : status === 'maint' ? 'maintenance' : status,
  )

  // Map the service status onto a Badge semantic tone (DS-0119).
  const badgeTone = $derived(
    status === 'deg'
      ? 'caution'
      : status === 'down'
        ? 'critical'
        : status === 'maint'
          ? 'brand'
          : 'positive',
  )

  // Fallback name while loading (the name/host/badge aren't rendered, so nothing to reference).
  const cardLabel = $derived(`${name}, ${statusLabel}`)

  // Stable ids so the card is named by its visible name + status (aria-labelledby) and described
  // by the rest of its visible content (aria-describedby) instead of an aria-label that replaced
  // it (DS-0192).
  const uid = $props.id()
  const nameId = `${uid}-name`
  const statusId = `${uid}-status`
  const hostId = `${uid}-host`
  const latencyId = `${uid}-latency`
  const metaId = `${uid}-meta`
  const trendId = `${uid}-trend`
  const updatedId = `${uid}-updated`

  // Interactive only when there is something to do: a bare card (no `href`/`onclick`) is a static
  // group, not a dead role=button (DS-0192). `loading`/`disabled` still suppress interaction.
  const interactive = $derived(!loading && !disabled && Boolean(href || onclick))

  // --- relative "last checked" timestamp -------------------------------------
  const updatedDate = $derived(
    updatedAt == null ? undefined : updatedAt instanceof Date ? updatedAt : new Date(updatedAt),
  )
  const updatedValid = $derived(!!updatedDate && !Number.isNaN(updatedDate.getTime()))
  const updatedISO = $derived(updatedValid ? updatedDate!.toISOString() : undefined)

  function relativeTime(d: Date): string {
    const secs = Math.round((d.getTime() - Date.now()) / 1000)
    const abs = Math.abs(secs)
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'narrow' })
    if (abs < 60) return rtf.format(Math.round(secs), 'second')
    if (abs < 3600) return rtf.format(Math.round(secs / 60), 'minute')
    if (abs < 86400) return rtf.format(Math.round(secs / 3600), 'hour')
    return rtf.format(Math.round(secs / 86400), 'day')
  }
  const updatedLabel = $derived(updatedValid ? relativeTime(updatedDate!) : '')

  const labelledBy = `${nameId} ${statusId}`
  const describedBy = $derived(
    [
      hostId,
      latency ? latencyId : '',
      meta ? metaId : '',
      spark.length ? trendId : '',
      updatedValid ? updatedId : '',
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

{#snippet body()}
  <div class="head">
    <div>
      {#if loading}
        <div class="sk sk-name" aria-hidden="true"></div>
        <div class="sk sk-host" aria-hidden="true"></div>
      {:else}
        <div class="name" id={nameId}>{name}</div>
        <div class="host" id={hostId}>{host}</div>
      {/if}
    </div>
  </div>
  <div class="status">
    {#if loading}
      <div class="sk sk-badge" aria-hidden="true"></div>
    {:else}
      <Badge tone={badgeTone}><span id={statusId}>{statusLabel}</span></Badge>
      <div class="latency" id={latency ? latencyId : undefined}>{latency}</div>
    {/if}
  </div>
  {#if meta && !loading}
    <div class="meta" id={metaId}>{@render meta()}</div>
  {/if}
  <div class="footer">
    {#if loading}
      <div class="sk sk-spark" aria-hidden="true"></div>
    {:else}
      <div class="trend" id={trendId}><Sparkline data={spark} color={sparkColor} /></div>
      <div class="foot-meta">
        {#if updatedValid}
          <time class="updated" id={updatedId} datetime={updatedISO}>{updatedLabel}</time>
        {/if}
        {#if interactive}
          <!-- Visual cue only: the overlay control carries the role and name. -->
          <span class="latency open" aria-hidden="true">▸ open</span>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<!--
  The root is never itself interactive (DS-0192, mirroring Card's DS-0183): an interactive card
  renders ONE stretched overlay control (an <a> for `href`, a <button> for `onclick`) named by the
  visible name + status and described by the rest of the card, so `meta` controls are never nested
  inside a link or button. A static card is a named, described group.
-->
<div
  class="ss-svc"
  class:interactive
  class:loading
  class:disabled
  role={interactive ? undefined : 'group'}
  aria-label={!interactive && loading ? cardLabel : undefined}
  aria-labelledby={!interactive && !loading ? labelledBy : undefined}
  aria-describedby={!interactive && !loading ? describedBy : undefined}
  aria-busy={loading ? 'true' : undefined}
  aria-disabled={disabled ? 'true' : undefined}
  data-size-variant={resolveComponentSize('ServiceCard', size)}
>
  {@render body()}
  {#if interactive && href}
    <a class="overlay" {href} {onclick} aria-labelledby={labelledBy} aria-describedby={describedBy}
    ></a>
  {:else if interactive}
    <button
      type="button"
      class="overlay"
      {onclick}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    ></button>
  {/if}
</div>

<style lang="scss">
  .ss-svc {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--ss-gap);
    padding: var(--ss-card-py) var(--ss-card-px);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    color: var(--ss-fg);
    text-decoration: none;
    transition: all var(--ss-dur-fast) var(--ss-ease);

    .head {
      // gap-sm (DS-0068): md = the former 10px; rescales with the size axis.
      display: flex;
      align-items: center;
      gap: var(--ss-gap-sm);
      .name {
        font-family: var(--ss-font-display);
        font-size: var(--ss-ui-lg);
        letter-spacing: -0.005em;
      }
      .host {
        font-family: var(--ss-font-mono);
        font-size: var(--ss-ui-sm);
        color: var(--ss-fg-muted);
      }
    }
    .status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    // Sits above the overlay control so links/buttons inside `meta` stay clickable.
    .meta {
      position: relative;
      z-index: 1;
      grid-column: 1 / -1;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
      display: flex;
      flex-direction: column;
      gap: var(--ss-s-1);
    }
    .footer {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ss-gap-sm);
      margin-top: 2px;
    }
    .foot-meta {
      display: flex;
      align-items: center;
      gap: var(--ss-gap-sm);
    }
    .latency {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
    }
    .updated {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
    }
  }

  /* Interactive card: hover affordance on the card, pointer via the overlay. */
  .ss-svc.interactive:hover {
    border-color: var(--ss-line-strong);
    background: var(--ss-bg-elev-hover);
  }

  // Single primary link/button stretched over the whole card. It is absolutely positioned so it
  // takes no grid cell, and is visually empty (named by aria-labelledby), so its own focus ring
  // outlines the card — the same 2px primary ring as the global :focus-visible style in
  // _base.scss, kept inline so it also applies without the global sheet.
  .overlay {
    position: absolute;
    inset: 0;
    z-index: 0;
    appearance: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
    }
  }

  .trend {
    display: contents;
  }

  /* Disabled: inert, no affordance. */
  .ss-svc.disabled {
    cursor: default;
    opacity: 0.55;
  }

  /* Loading: no affordance, shimmer placeholders. */
  .ss-svc.loading {
    cursor: default;
  }

  .sk {
    background: var(--ss-bg-elev-hover);
    position: relative;
    overflow: hidden;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, var(--ss-hover), transparent);
      animation: ss-svc-shimmer var(--ss-dur-xslow) var(--ss-ease) infinite;
    }
  }
  .sk-name {
    width: 120px;
    height: var(--ss-ui-lg);
    margin-bottom: var(--ss-s-1);
  }
  .sk-host {
    width: 90px;
    height: var(--ss-ui-sm);
  }
  .sk-badge {
    width: 64px;
    height: calc(var(--ss-ui-xs) + (var(--ss-chip-py) * 2));
  }
  .sk-spark {
    width: 100%;
    height: var(--ss-icon);
  }

  @keyframes ss-svc-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sk::after {
      animation: none;
    }
  }

  // theme.css draws an animated underline under every <a> (`a::before`). These anchors are
  // component chrome, not prose links — cancel it here so the reset also ships in vanilla.css
  // (DS-0150; the specificity of a scoped class beats the global element rule).
  .overlay::before,
  .ss-svc::before {
    content: none;
  }
</style>
