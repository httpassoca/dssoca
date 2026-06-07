<script module lang="ts">
  export const PATHS: Record<string, string> = {
    grid:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    database: '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 4v5"/>',
    logs:     '<path d="M4 6h16M4 12h16M4 18h10"/>',
    terminal: '<rect x="3" y="5" width="18" height="14"/><path d="M3 9h18M7 14h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
    arrow:    '<path d="M5 12h14M13 5l7 7-7 7"/>',
    external: '<path d="M7 17L17 7M9 7h8v8"/>',
    film:     '<rect x="3" y="4" width="18" height="16"/><path d="M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>',
    note:     '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h6"/>',
    book:     '<path d="M6 4h11a1 1 0 011 1v15H7a1 1 0 01-1-1z"/><path d="M17 20a2 2 0 002-2V6a2 2 0 00-2-2"/><path d="M9 8h5"/>',
    check:    '<path d="M5 12l4 4L19 6"/>',
    cup:      '<path d="M4 8h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4z"/><path d="M16 10h2a2 2 0 010 4h-2M6 4v2M10 4v2M14 4v2"/>',
    wallet:   '<rect x="3" y="6" width="18" height="14"/><path d="M3 10h18M17 14h2"/>',
    target:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  }

  export type IconName = keyof typeof PATHS
</script>

<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    name: IconName
    /** Token-driven size (sm|md|lg); inherits the active size when unset. */
    size?: Size
    /** Explicit pixel size — overrides the token sizing. */
    px?: number
    class?: string
  }
  let { name, size, px, class: cls = '' }: Props = $props()

  const dim = $derived(px != null ? `${px}px` : 'var(--ss-icon)')
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="square"
  stroke-linejoin="miter"
  class={cls}
  data-size-variant={resolveComponentSize('Icon', size)}
  style="width:{dim};height:{dim}"
>
  {@html PATHS[name] ?? ''}
</svg>
