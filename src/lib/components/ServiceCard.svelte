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
    spark?: number[]
    onclick?: () => void
    /** When set, the card renders as a real `<a>` and navigates here (native Enter). */
    href?: string
    /** Render skeleton placeholders and mark the card `aria-busy`; suppresses interaction. */
    loading?: boolean
    /** Non-interactive variant: `aria-disabled`, no focus/pointer, no onclick. */
    disabled?: boolean
    /** "Last checked" instant; rendered as relative time in a `<time datetime>` footer slot. */
    updatedAt?: Date | string
    /** Optional extra metadata rows (version, IP, tags…) below the head. */
    meta?: Snippet
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }
  let {
    name,
    host,
    status = 'up',
    latency = '',
    spark = [4, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 10, 12],
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

  // Status is decorative on the dot/badge, but meaningful — fold it into the label.
  const cardLabel = $derived(`${name}, ${statusLabel}`)

  // The card is interactive (focusable, activatable) unless explicitly inert.
  // This preserves the original default (a bare card was a role=button); `href`,
  // `loading`, and `disabled` are the only things that change the element.
  const interactive = $derived(!loading && !disabled)

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
</script>

{#snippet body()}
  <div class="head">
    <div>
      {#if loading}
        <div class="sk sk-name" aria-hidden="true"></div>
        <div class="sk sk-host" aria-hidden="true"></div>
      {:else}
        <div class="name">{name}</div>
        <div class="host">{host}</div>
      {/if}
    </div>
  </div>
  <div class="status">
    {#if loading}
      <div class="sk sk-badge" aria-hidden="true"></div>
    {:else}
      <Badge tone={status}>{statusLabel}</Badge>
      <div class="latency">{latency}</div>
    {/if}
  </div>
  {#if meta && !loading}
    <div class="meta">{@render meta()}</div>
  {/if}
  <div class="footer">
    {#if loading}
      <div class="sk sk-spark" aria-hidden="true"></div>
    {:else}
      <Sparkline data={spark} color={sparkColor} />
      <div class="foot-meta">
        {#if updatedValid}
          <time class="updated" datetime={updatedISO}>{updatedLabel}</time>
        {/if}
        {#if interactive}
          <span class="latency open"><span aria-hidden="true">▸</span> open</span>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#if href && interactive}
  <a
    class="ss-svc"
    class:loading
    {href}
    aria-label={cardLabel}
    data-size-variant={resolveComponentSize('ServiceCard', size)}
    {onclick}
  >
    {@render body()}
  </a>
{:else if interactive}
  <div
    class="ss-svc"
    role="button"
    tabindex="0"
    aria-label={cardLabel}
    data-size-variant={resolveComponentSize('ServiceCard', size)}
    {onclick}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onclick?.()
      }
    }}
  >
    {@render body()}
  </div>
{:else}
  <div
    class="ss-svc"
    class:loading
    class:disabled
    role="group"
    aria-label={cardLabel}
    aria-busy={loading ? 'true' : undefined}
    aria-disabled={disabled ? 'true' : undefined}
    data-size-variant={resolveComponentSize('ServiceCard', size)}
  >
    {@render body()}
  </div>
{/if}

<style lang="scss">
  .ss-svc {
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
    .meta {
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

  /* Interactive variants (anchor + role=button div) get the affordance. */
  a.ss-svc,
  [role='button'].ss-svc {
    cursor: pointer;

    &:hover {
      border-color: var(--ss-line-strong);
      background: var(--ss-bg-elev-hover);
    }
    // Focus ring (DS-0068): intentionally mirrors the global :focus-visible
    // style in _base.scss (2px primary outline, 2px offset) — kept inline so
    // the role=button <div> variant gets it even without the global sheet.
    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
    }
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
      animation: sk-shimmer var(--ss-dur-xslow) var(--ss-ease) infinite;
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
    height: calc(var(--ss-ui-xs) + (var(--ss-badge-py) * 2));
  }
  .sk-spark {
    width: 100%;
    height: var(--ss-icon);
  }

  @keyframes sk-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .sk::after {
      animation: none;
    }
  }
</style>
