/**
 * Icon glyph table + runtime registry (DS-0148).
 *
 * Lives outside `Icon.svelte` so framework-free consumers (`dssoca/vanilla.js`) and node
 * scripts can share the exact same paths as the Svelte component. `Icon.svelte` re-exports
 * everything here, so existing imports from the component path keep working.
 */
/** Curated glyph set. `target`'s centre dot is a filled circle in the *outline*
 *  variant — handled by the `variant` switch in markup, not a per-glyph fill hack. */
const BUILTIN_PATHS = {
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  database: '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 4v5"/>',
  logs: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  terminal: '<rect x="3" y="5" width="18" height="14"/><path d="M3 9h18M7 14h4"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  chevron: '<path d="M8 10l4 4 4-4"/>',
  external: '<path d="M7 17L17 7M9 7h8v8"/>',
  film: '<rect x="3" y="4" width="18" height="16"/><path d="M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>',
  note: '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h6"/>',
  book: '<path d="M6 4h11a1 1 0 011 1v15H7a1 1 0 01-1-1z"/><path d="M17 20a2 2 0 002-2V6a2 2 0 00-2-2"/><path d="M9 8h5"/>',
  check: '<path d="M5 12l4 4L19 6"/>',
  cup: '<path d="M4 8h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4z"/><path d="M16 10h2a2 2 0 010 4h-2M6 4v2M10 4v2M14 4v2"/>',
  wallet: '<rect x="3" y="6" width="18" height="14"/><path d="M3 10h18M17 14h2"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" class="ss-icon-dot"/>',
  spinner: '<path d="M12 3a9 9 0 1 0 9 9" stroke-linecap="round"/>',
  home: '<path d="M4 11l8-8 8 8"/><path d="M6 9v12h12V9"/><path d="M10 21v-6h4v6"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13"/><path d="M9 7V4h6v3M3 12h18"/>',
  folder: '<path d="M3 5h7l2 3h9v13H3z"/><path d="M3 8h9"/>',
  github:
    '<path d="M7 3h10l2 2v6l-2 3h-4l1 2v5h-4v-5l1-2H7l-2-3V5l2-2z"/><path d="M9 8h1M14 8h1"/>',
  linkedin:
    '<rect x="3" y="3" width="18" height="18"/><path d="M8 16v-5M8 8v.01M12 16v-5h2l2 2v3"/>',
  language: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3L8 12l4 9M12 3l4 9-4 9"/>',
  'color-swatch':
    '<rect x="3" y="3" width="8" height="18"/><path d="M7 17v.01"/><path d="M11 19l8-8 2 2-8 8"/><path d="M13 21h8"/>',
} as const

export type IconName = keyof typeof BUILTIN_PATHS

/**
 * The curated built-in glyphs plus any runtime-registered ones.
 * (`PATHS` is kept as the public name for backward compatibility.)
 */
export const PATHS: Record<string, string> = { ...BUILTIN_PATHS }

/**
 * Register (or override) a glyph at runtime so `<Icon name="foo" />` resolves
 * raw SVG inner markup that isn't part of the curated {@link IconName} union.
 * The markup is rendered verbatim inside the icon's `<svg viewBox="0 0 24 24">`.
 *
 *   registerIcon('heart', '<path d="M12 21 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7z"/>')
 *   <Icon name={'heart' as IconName} />
 */
export function registerIcon(name: string, paths: string): void {
  PATHS[name] = paths
}

/** Look a glyph up; built-ins first, then runtime registrations. */
export function resolveIcon(name: string): string | undefined {
  return PATHS[name]
}
