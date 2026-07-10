import { describe, it, expect } from 'vitest'
import { COMPONENTS, NAV, getComponent, storyUrl, storybookLink } from '../src/lib/docs.config'

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

  it('has a guide group with the expected pages', () => {
    const guide = NAV.find((g) => g.section === 'guide')
    const hrefs = guide?.items.map((i) => i.href) ?? []
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/introduction',
        '/installation',
        '/theming',
        '/color-theory',
        '/tokens',
        '/theme-builder',
      ]),
    )
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
      'Link',
      'LogStream',
      'Menu',
      'MetricTile',
      'Modal',
      'NumberField',
      'Pagination',
      'ScatterPlot',
      'SegmentedControl',
      'Select',
      'ServiceCard',
      'Sidebar',
      'Sparkline',
      'Spinner',
      'Switch',
      'Table',
      'Textarea',
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
