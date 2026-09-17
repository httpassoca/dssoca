/**
 * Documentation site config — the docs nav + Storybook embed helpers.
 *
 * The per-component reference content now lives **one file per component**
 * under `./component-docs/` (each exports a `ComponentDoc`), assembled into
 * `COMPONENTS` by `./component-docs/index.ts`. This module re-exports that list
 * and wires the left-nav, the slug lookup, and the live-story iframe URLs.
 *
 * Story IDs map to the dssoca Storybook build (title `Components/<Name>` →
 * `components-<name>--<story>`); the docs embed each one live via an iframe.
 */

import { COMPONENTS } from './component-docs'
import type { ComponentDoc } from './component-docs/types'

export { COMPONENTS }
export type { PropDoc, ComponentDoc } from './component-docs/types'

/**
 * Base URL of the running/built Storybook the per-component pages embed.
 * Local default points at `storybook dev -p 6006`. Override at build time with
 * `VITE_STORYBOOK_URL` (e.g. a co-deployed `/storybook`); deploy is out of
 * scope for the local-only setup.
 */
export const STORYBOOK_URL: string = import.meta.env.VITE_STORYBOOK_URL ?? 'http://localhost:6006'

/**
 * The Inspirations site (DS-0150): example websites built on the plain-HTML path, deployed to
 * GitHub Pages by `.github/workflows/pages.yml` — a fixed URL, so no env var.
 */
export const INSPIRATIONS_URL = 'https://httpassoca.github.io/dssoca/'

/** Live-story iframe URL for a given Storybook story id. */
export function storyUrl(id: string): string {
  return `${STORYBOOK_URL}/iframe.html?id=${id}&viewMode=story`
}

/** "Open in Storybook" deep link (full Storybook UI) for a story id. */
export function storybookLink(id: string): string {
  return `${STORYBOOK_URL}/?path=/story/${id}`
}

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug)
}

export interface NavItem {
  label: string
  href: string
  /** Optional leading glyph; component links render without one. */
  icon?: string
  /** Extra search terms for the site palette (DS-0147); labels are always matched. */
  keywords?: string[]
  /** Off-site link: rendered as a real new-tab anchor (Sidebar `external`), never routed. */
  external?: boolean
}
/**
 * Stable nav-group keys (DS-0156). Code keys on these — never on the rendered `label` — so the
 * wording can change without touching search or tests. Every non-component page belongs to
 * exactly one of the three guide groups:
 *
 * - `getting-started` — the necessary path: what it is, install it, use it without Svelte.
 * - `configuration`   — the knobs: theming/config, tokens, the palette builder, keyboard.
 * - `explore`         — browsable surfaces: example sites, colour theory, the component catalog.
 *
 * A new page MUST declare which group it belongs to (add it to that group's `items`).
 */
export type NavSection = 'getting-started' | 'configuration' | 'explore' | 'components'

/** The guide groups, in sidebar order (everything above the per-component list). */
export const GUIDE_SECTIONS = [
  'getting-started',
  'configuration',
  'explore',
] as const satisfies readonly NavSection[]

export interface NavGroup {
  /** Stable key — see {@link NavSection}. */
  section: NavSection
  /** Human label the sidebar renders as the group heading. */
  label: string
  items: NavItem[]
}

/** Every page item above the component list, paired with its group. */
export function guideEntries(nav: readonly NavGroup[] = NAV): { group: NavGroup; item: NavItem }[] {
  return nav
    .filter((g) => g.section !== 'components')
    .flatMap((group) => group.items.map((item) => ({ group, item })))
}

/**
 * Left-nav structure — three labelled guide groups (DS-0156), then a page per component.
 * Group membership is pinned by `test/docs.config.test.ts`.
 */
export const NAV: NavGroup[] = [
  {
    section: 'getting-started',
    label: 'Getting started',
    items: [
      {
        label: 'Introduction',
        href: '/introduction',
        icon: 'book',
        keywords: ['overview', 'principles', 'axes', 'getting started', 'what is dssoca'],
      },
      {
        label: 'Installation',
        href: '/installation',
        icon: 'terminal',
        keywords: ['install', 'setup', 'pnpm add', 'npm', 'import', 'theme.css', 'fonts', 'peer'],
      },
      {
        label: 'Plain HTML & CSS',
        href: '/vanilla',
        icon: 'terminal',
        keywords: [
          'vanilla',
          'vanilla.css',
          'vanilla.js',
          'no svelte',
          'static site',
          'cdn',
          'jsdelivr',
          '@scope',
          'plain html',
          'data-ss-modal',
          'toast',
        ],
      },
    ],
  },
  {
    section: 'configuration',
    label: 'Configuration',
    items: [
      {
        label: 'Theming & config',
        href: '/theming',
        icon: 'settings',
        keywords: [
          'data-theme',
          'data-size-variant',
          'dark',
          'light',
          'size',
          'applyDesignConfig',
          'manifest',
          'palette',
          'presets',
          'config',
        ],
      },
      {
        label: 'Tokens',
        href: '/tokens',
        icon: 'grid',
        keywords: [
          '--ss-',
          'css variables',
          'custom properties',
          'spacing',
          'typography',
          'colors',
        ],
      },
      {
        label: 'Theme Builder',
        href: '/theme-builder',
        icon: 'color-swatch',
        keywords: ['generator', 'custom palette', 'export', 'accent', 'contrast checks'],
      },
      {
        label: 'Keyboard',
        href: '/keyboard',
        icon: 'target',
        keywords: ['shortcuts', 'hotkeys', 'a11y', 'accessibility', 'wcag', 'registry', 'focus'],
      },
    ],
  },
  {
    section: 'explore',
    label: 'Explore',
    items: [
      {
        label: 'Inspirations',
        href: INSPIRATIONS_URL,
        icon: 'film',
        external: true,
        keywords: [
          'examples',
          'example sites',
          'templates',
          'showcase',
          'demo',
          'gallery',
          'dashboard',
          'landing page',
          'blog',
          'chat',
          'store',
          'github pages',
        ],
      },
      {
        label: 'Color theory',
        href: '/color-theory',
        icon: 'note',
        keywords: ['oklch', 'terminal', 'ansi', '16 colors', 'contrast', 'slots', 'accent'],
      },
      {
        label: 'All components',
        href: '/components',
        icon: 'database',
        keywords: ['gallery', 'overview', 'catalog', 'list'],
      },
    ],
  },
  {
    section: 'components',
    label: 'Components',
    // Component links are intentionally icon-less (cleaner nav), and sorted
    // alphabetically by name so the sidebar is scannable (COMPONENTS itself
    // keeps its source/insertion order for the per-component prerender).
    items: [...COMPONENTS]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ label: c.name, href: `/components/${c.slug}` })),
  },
]
