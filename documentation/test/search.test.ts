import { describe, it, expect } from 'vitest'
import { COMPONENTS, NAV, STORYBOOK_URL } from '../src/lib/docs.config'
import {
  buildSearchItems,
  pageItems,
  componentItems,
  actionItems,
  taglineWords,
  GROUP_PAGES,
  GROUP_COMPONENTS,
  GROUP_ACTIONS,
  GITHUB_URL,
} from '../src/lib/search'

// DS-0147: the site palette index is pure data — every page and component
// reachable, props searchable, actions present, nothing navigating the tab away.
describe('search index', () => {
  const items = buildSearchItems()

  it('has unique ids', () => {
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists pages, then components, then actions', () => {
    const groups = [...new Set(items.map((i) => i.group))]
    expect(groups).toEqual([GROUP_PAGES, GROUP_COMPONENTS, GROUP_ACTIONS])
  })

  it('includes the landing page and every guide nav entry as an href item', () => {
    const pages = pageItems()
    expect(pages[0]).toMatchObject({ label: 'Home', href: '/' })
    const guide = NAV.find((g) => g.section === 'guide')!.items
    for (const it of guide) {
      expect(
        pages.find((p) => p.href === it.href),
        it.href,
      ).toMatchObject({ label: it.label })
    }
  })

  it('every guide nav entry carries search keywords', () => {
    for (const it of NAV.find((g) => g.section === 'guide')!.items) {
      expect(it.keywords?.length, it.href).toBeGreaterThan(0)
    }
  })

  it('has exactly one item per component, linking to its page, sorted by name', () => {
    const comps = componentItems()
    expect(comps).toHaveLength(COMPONENTS.length)
    const names = comps.map((c) => c.label)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    for (const c of COMPONENTS) {
      const item = comps.find((i) => i.id === `component:${c.slug}`)
      expect(item, c.slug).toMatchObject({
        label: c.name,
        hint: c.tagline,
        href: `/components/${c.slug}`,
      })
    }
  })

  it('makes every prop name, the slug and the category searchable on its component', () => {
    const comps = componentItems()
    for (const c of COMPONENTS) {
      const kw = comps.find((i) => i.id === `component:${c.slug}`)!.keywords!
      expect(kw).toContain(c.slug)
      for (const p of c.props) expect(kw, `${c.slug}.${p.name}`).toContain(p.name)
    }
    const tooltip = comps.find((i) => i.id === 'component:tooltip')!
    expect(tooltip.keywords).toContain('avoidCollisions')
    expect(tooltip.keywords).toContain('feedback')
  })

  it('splits taglines into matchable words', () => {
    expect(taglineWords('Hover/focus hint for a trigger.')).toEqual([
      'hover',
      'focus',
      'hint',
      'for',
      'trigger',
    ])
  })

  it('ships the six actions; external links use `url` (new tab), never `href`', () => {
    const actions = actionItems()
    expect(actions.map((a) => a.id)).toEqual([
      'action:toggle-theme',
      'action:cycle-size',
      'action:open-help',
      'action:copy-install',
      'action:github',
      'action:storybook',
    ])
    for (const a of actions) {
      expect(a.group).toBe(GROUP_ACTIONS)
      expect(a.href, a.id).toBeUndefined()
      expect(Boolean(a.action) !== Boolean(a.url), `${a.id} is either an action or a url`).toBe(
        true,
      )
    }
    expect(actions.find((a) => a.id === 'action:github')!.url).toBe(GITHUB_URL)
    expect(actions.find((a) => a.id === 'action:storybook')!.url).toBe(STORYBOOK_URL)
    expect(actionItems('https://sb.example')[5].url).toBe('https://sb.example')
  })

  it('is importable without a DOM (prerender-safe) — no window/document access at build time', () => {
    expect(typeof globalThis.window).toBe('undefined')
    expect(() => buildSearchItems()).not.toThrow()
  })
})
