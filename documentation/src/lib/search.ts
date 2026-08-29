/**
 * Site search index for the docs `SearchPalette` (DS-0147).
 *
 * Pure data: pages (the guide nav), one item per component (props + tagline
 * words as keywords so `avoidCollisions` lands on Tooltip), and a handful of
 * actions. The palette's built-in filter matches `label` + `keywords`
 * case/diacritic-insensitively, so this module only has to supply good terms —
 * it never runs its own matching. Kept free of DOM/`window` so the node-only
 * docs test suite and the prerender can both import it.
 */
import type { SearchPaletteItem } from 'dssoca'
import { COMPONENTS, NAV, STORYBOOK_URL, type ComponentDoc, type NavGroup } from './docs.config'
import { CATEGORIES } from './categories'

export type DocsAction = 'toggle-theme' | 'cycle-size' | 'open-help' | 'copy-install'

export interface DocsSearchItem extends SearchPaletteItem {
  /**
   * External URL opened in a new tab (GitHub, Storybook). Deliberately not
   * `href`: the palette activates `href` items through their real anchor,
   * which would navigate the current tab away from the docs.
   */
  url?: string
  /** Runs in the app instead of navigating. */
  action?: DocsAction
}

export const GROUP_PAGES = 'Pages'
export const GROUP_COMPONENTS = 'Components'
export const GROUP_ACTIONS = 'Actions'

export const GITHUB_URL = 'https://github.com/httpassoca/dssoca'
export const INSTALL_COMMAND = 'pnpm add dssoca'

/** Split a tagline into lowercase words worth matching ("Hover/focus hint" → hover, focus, hint). */
export function taglineWords(tagline: string): string[] {
  return tagline
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length > 2)
}

function categoryOf(slug: string): string | undefined {
  return CATEGORIES.find((c) => c.slugs.includes(slug))?.label
}

export function pageItems(nav: NavGroup[] = NAV): DocsSearchItem[] {
  const guide = nav.find((g) => g.section === 'guide')?.items ?? []
  return [
    { id: 'page:/', label: 'Home', hint: 'Landing page', href: '/', group: GROUP_PAGES },
    ...guide.map((it) => ({
      id: `page:${it.href}`,
      label: it.label,
      hint: 'Guide',
      href: it.href,
      group: GROUP_PAGES,
      keywords: it.keywords ?? [],
    })),
  ]
}

export function componentItems(components: readonly ComponentDoc[] = COMPONENTS): DocsSearchItem[] {
  return [...components]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => {
      const category = categoryOf(c.slug)
      return {
        id: `component:${c.slug}`,
        label: c.name,
        hint: c.tagline,
        href: `/components/${c.slug}`,
        group: GROUP_COMPONENTS,
        keywords: [
          c.slug,
          ...(category ? [category.toLowerCase()] : []),
          ...c.props.map((p) => p.name),
          ...taglineWords(c.tagline),
        ],
      }
    })
}

export function actionItems(storybookUrl: string = STORYBOOK_URL): DocsSearchItem[] {
  return [
    {
      id: 'action:toggle-theme',
      label: 'Toggle theme',
      hint: 'dark ⇄ light',
      group: GROUP_ACTIONS,
      action: 'toggle-theme',
      keywords: ['dark', 'light', 'color', 'appearance', 'data-theme'],
    },
    {
      id: 'action:cycle-size',
      label: 'Cycle size',
      hint: 'sm → md → lg',
      group: GROUP_ACTIONS,
      action: 'cycle-size',
      keywords: ['small', 'medium', 'large', 'density', 'data-size-variant'],
    },
    {
      id: 'action:open-help',
      label: 'Keyboard shortcuts',
      hint: 'Open the shortcuts overlay',
      group: GROUP_ACTIONS,
      action: 'open-help',
      keywords: ['help', 'hotkeys', 'keys', '?'],
    },
    {
      id: 'action:copy-install',
      label: 'Copy install command',
      hint: INSTALL_COMMAND,
      group: GROUP_ACTIONS,
      action: 'copy-install',
      keywords: ['pnpm', 'npm', 'install', 'clipboard'],
    },
    {
      id: 'action:github',
      label: 'GitHub repository',
      hint: 'httpassoca/dssoca',
      url: GITHUB_URL,
      group: GROUP_ACTIONS,
      keywords: ['source', 'code', 'issues', 'repo'],
    },
    {
      id: 'action:storybook',
      label: 'Storybook',
      hint: 'Component playground',
      url: storybookUrl,
      group: GROUP_ACTIONS,
      keywords: ['stories', 'playground', 'demo'],
    },
  ]
}

/** The full palette list: pages, components, then actions. */
export function buildSearchItems(
  components: readonly ComponentDoc[] = COMPONENTS,
  nav: NavGroup[] = NAV,
  storybookUrl: string = STORYBOOK_URL,
): DocsSearchItem[] {
  return [...pageItems(nav), ...componentItems(components), ...actionItems(storybookUrl)]
}
