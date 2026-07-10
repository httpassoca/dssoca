<script module lang="ts">
  import { CHART_PALETTE } from '../palette.js'

  // Deterministic palette for the initials tile background (DS-0099). A given
  // `name` always maps to the same entry via a simple string hash, so the same
  // person reads with a stable colour across the app — CHART_PALETTE's order
  // and length are stable API for exactly this reason.
  const PALETTE = CHART_PALETTE

  /** Up to two leading initials, uppercased: "Ada Lovelace" → "AL", "Cher" → "C". */
  export function avatarInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
  }

  /** djb2-ish string hash → palette index. Stable for a given `name`. */
  export function avatarColor(name: string): string {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
    return PALETTE[Math.abs(h) % PALETTE.length]
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Avatar (DS-0099). A SQUARE tile (zero radius — house rule) showing either an
  // image or deterministic initials. If `src` is set we render an <img>; on a
  // load error we fall back to the initials tile. The root carries role="img" +
  // aria-label={name} so the name is exposed once; the visual initials are
  // aria-hidden to avoid a doubled accessible name.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Person/entity name — drives the initials, the deterministic colour, and the accessible name. */
    name: string
    /** Optional image URL; when set, rendered as an <img> that falls back to initials on error. */
    src?: string
    /** Image alt text; defaults to `name`. */
    alt?: string
    /** Token size (sm|md|lg); inherits the global size when unset. Controls the tile box. */
    size?: Size
  }

  let { name, src, alt, size }: Props = $props()

  const initials = $derived(avatarInitials(name))
  const bg = $derived(avatarColor(name))

  // Show the image until/unless it errors, then fall back to the initials tile.
  let failed = $state(false)
  const showImage = $derived(!!src && !failed)

  function onError() {
    failed = true
  }
</script>

<span
  class="ss-avatar"
  data-size-variant={resolveComponentSize('Avatar', size)}
  role="img"
  aria-label={name}
  style:--ss-avatar-bg={showImage ? undefined : bg}
>
  {#if showImage}
    <img class="img" {src} alt={alt ?? name} onerror={onError} />
  {:else}
    <span class="initials" aria-hidden="true">{initials}</span>
  {/if}
</span>

<style lang="scss">
  // Box metrics authored here (scoped) so they ship without touching the shared
  // token sheet; they cascade like any --ss-* custom property. Default mirrors
  // the `md` size; sm/lg rescale via the size axis.
  .ss-avatar {
    --ss-avatar-size: var(--ss-avatar-size-md, 36px);

    &[data-size-variant='sm'] {
      --ss-avatar-size: var(--ss-avatar-size-sm, 28px);
    }
    &[data-size-variant='lg'] {
      --ss-avatar-size: var(--ss-avatar-size-lg, 48px);
    }

    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ss-avatar-size);
    height: var(--ss-avatar-size);
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 0; // square — house rule, never a circle
    background: var(--ss-avatar-bg, var(--ss-bg-elev));
    color: var(--ss-fg-on-primary, var(--ss-bg));
    user-select: none;
    vertical-align: middle;
  }

  .img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .initials {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-avatar-font, calc(var(--ss-avatar-size) * 0.4));
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.02em;
  }
</style>
