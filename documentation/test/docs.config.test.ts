import { describe, it, expect } from 'vitest'
import {
  COMPONENTS,
  NAV,
  GUIDE_SECTIONS,
  INSPIRATIONS_URL,
  getComponent,
  guideEntries,
  storyUrl,
  storybookLink,
} from '../src/lib/docs.config'

describe('docs.config — components', () => {
  it('has entries with the required, non-empty fields', () => {
    expect(COMPONENTS.length).toBeGreaterThan(0)
    for (const c of COMPONENTS) {
      expect(c.name, 'name').toBeTruthy()
      expect(c.slug, `slug for ${c.name}`).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(c.tagline, `tagline for ${c.name}`).toBeTruthy()
      expect(c.usage, `usage for ${c.name}`).toContain('dssoca')
      expect(c.props.length, `props for ${c.name}`).toBeGreaterThan(0)
    }
  })

  it('has unique slugs and unique names', () => {
    const slugs = COMPONENTS.map((c) => c.slug)
    const names = COMPONENTS.map((c) => c.name)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('uses well-formed Storybook story ids', () => {
    for (const c of COMPONENTS) {
      expect(c.storyId, c.name).toMatch(/^components-[a-z0-9]+--[a-z0-9-]+$/)
    }
  })

  it('resolves a component by slug (and nothing for unknown)', () => {
    expect(getComponent(COMPONENTS[0].slug)?.name).toBe(COMPONENTS[0].name)
    expect(getComponent('does-not-exist')).toBeUndefined()
  })
})

describe('docs.config — nav', () => {
  it('has a component nav item per component, pointing at its page', () => {
    const componentsGroup = NAV.find((g) => g.section === 'components')
    expect(componentsGroup).toBeDefined()
    expect(componentsGroup!.items.length).toBe(COMPONENTS.length)
    for (const c of COMPONENTS) {
      const item = componentsGroup!.items.find((i) => i.href === `/components/${c.slug}`)
      expect(item, `nav item for ${c.name}`).toBeDefined()
    }
  })

  // DS-0156: the pages above the component list are split into three labelled
  // groups. Membership and order are pinned exactly so the IA can't silently
  // regress — moving a page is a deliberate edit here too.
  it('splits the guide pages into getting-started / configuration / explore, in that order', () => {
    expect(NAV.map((g) => g.section)).toEqual([...GUIDE_SECTIONS, 'components'])
    const byGroup = Object.fromEntries(NAV.map((g) => [g.section, g.items.map((i) => i.href)]))
    expect(byGroup).toMatchObject({
      'getting-started': ['/introduction', '/installation', '/vanilla'],
      configuration: ['/theming', '/tokens', '/theme-builder', '/keyboard'],
      explore: ['/inspirations', '/color-theory', '/components'],
    })
  })

  it('gives every group a distinct, human heading label', () => {
    const labels = NAV.map((g) => g.label)
    expect(labels).toEqual(['Getting started', 'Configuration', 'Explore', 'Components'])
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('lists every guide page exactly once, each with an href, icon and keywords', () => {
    const entries = guideEntries()
    const hrefs = entries.map((e) => e.item.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(hrefs).toHaveLength(10)
    for (const { group, item } of entries) {
      expect(GUIDE_SECTIONS, item.href).toContain(group.section)
      expect(item.icon, `icon for ${item.href}`).toBeTruthy()
      expect(item.keywords?.length, `keywords for ${item.href}`).toBeGreaterThan(0)
    }
    // DS-0158: every guide page is internal now (Inspirations lives at /inspirations and links
    // the Pages host from the page itself).
    expect(entries.filter((e) => e.item.external)).toEqual([])
    expect(entries.map((e) => e.item.href).every((h) => h.startsWith('/'))).toBe(true)
    expect(INSPIRATIONS_URL).toMatch(/^https:\/\/httpassoca\.github\.io\/dssoca\/$/)
  })

  it('lists the components alphabetically by name', () => {
    const componentsGroup = NAV.find((g) => g.section === 'components')!
    const labels = componentsGroup.items.map((i) => i.label)
    // Pin the exact expected order (not a self-referential re-sort), so a wrong
    // sort key would be caught. Source/insertion order started with Icon.
    expect(labels).toEqual([
      'Accordion',
      'Avatar',
      'Badge',
      'BottomNav',
      'BoxPlot',
      'BumpChart',
      'Button',
      'Card',
      'Chart',
      'Container',
      'DateField',
      'EmptyState',
      'FileDrop',
      'Heading',
      'Heatmap',
      'Icon',
      'Image',
      'Input',
      'Kbd',
      'Link',
      'LogStream',
      'Menu',
      'MetricTile',
      'Modal',
      'NumberField',
      'Pagination',
      'ScatterPlot',
      'SearchPalette',
      'SegmentedControl',
      'Select',
      'ServiceCard',
      'ShortcutsHelp',
      'Sidebar',
      'Sparkline',
      'Spinner',
      'Switch',
      'Table',
      'Textarea',
      'TierList',
      'Toaster',
      'Tooltip',
      'Topbar',
    ])
  })
})

describe('docs.config — storybook links', () => {
  it('builds an iframe url and a UI deep link from a story id', () => {
    expect(storyUrl('components-button--primary')).toContain(
      '/iframe.html?id=components-button--primary',
    )
    expect(storybookLink('components-button--primary')).toContain(
      '/?path=/story/components-button--primary',
    )
  })
})
