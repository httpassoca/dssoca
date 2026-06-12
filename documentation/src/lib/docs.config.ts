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
}
export interface NavGroup {
  section: string
  items: NavItem[]
}

/** Left-nav structure — guide pages first, then a page per component. */
export const NAV: NavGroup[] = [
  {
    section: 'guide',
    items: [
      { label: 'Introduction', href: '/introduction', icon: 'book' },
      { label: 'Installation', href: '/installation', icon: 'terminal' },
      { label: 'Theming & config', href: '/theming', icon: 'settings' },
      { label: 'Tokens', href: '/tokens', icon: 'grid' },
      { label: 'All components', href: '/components', icon: 'database' },
    ],
  },
  {
    section: 'components',
    // Component links are intentionally icon-less (cleaner nav), and sorted
    // alphabetically by name so the sidebar is scannable (COMPONENTS itself
    // keeps its source/insertion order for the per-component prerender).
    items: [...COMPONENTS]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ label: c.name, href: `/components/${c.slug}` })),
  },
]
