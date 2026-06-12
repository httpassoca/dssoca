import { describe, it, expect, beforeEach } from 'vitest'
import { createRawSnippet, type Component } from 'svelte'
import { render } from '@testing-library/svelte'
import { applyDesignConfig, defaultDesignConfig, type Size } from '$lib/config'

import Badge from '$lib/components/Badge.svelte'
import Button from '$lib/components/Button.svelte'
import Card from '$lib/components/Card.svelte'
import Container from '$lib/components/Container.svelte'
import EmptyState from '$lib/components/EmptyState.svelte'
import Heading from '$lib/components/Heading.svelte'
import Input from '$lib/components/Input.svelte'
import Link from '$lib/components/Link.svelte'
import LogStream from '$lib/components/LogStream.svelte'
import MetricTile from '$lib/components/MetricTile.svelte'
import SegmentedControl from '$lib/components/SegmentedControl.svelte'
import ServiceCard from '$lib/components/ServiceCard.svelte'
import Sidebar from '$lib/components/Sidebar.svelte'
import Sparkline from '$lib/components/Sparkline.svelte'
import Spinner from '$lib/components/Spinner.svelte'
import Textarea from '$lib/components/Textarea.svelte'
import Toaster from '$lib/components/Toaster.svelte'
import Topbar from '$lib/components/Topbar.svelte'

// DS-0070 — parameterized size-variant coverage. Every sized component must
// stamp the explicit `size` prop onto its root as [data-size-variant], for all
// three axis values. Table-driven: component + minimal required props + root
// identity selector (always select by identity class, never by the attribute,
// so nested sized children — e.g. Link's external Icon — can't shadow the root).

const text = createRawSnippet(() => ({ render: () => '<span>content</span>' }))

interface SizeCase {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Component<any>
  props: Record<string, unknown>
  selector: string
  /** Axis values to assert; defaults to all three. */
  sizes?: Size[]
}

const CASES: SizeCase[] = [
  { name: 'Badge', component: Badge, props: { children: text }, selector: '.ss-badge' },
  { name: 'Button', component: Button, props: { children: text }, selector: '.ss-btn' },
  { name: 'Card', component: Card, props: { children: text }, selector: '.ss-card' },
  {
    name: 'EmptyState',
    component: EmptyState,
    props: { title: 'Nothing yet' },
    selector: '.ss-empty',
  },
  { name: 'Input', component: Input, props: { label: 'Email' }, selector: '.ss-field' },
  { name: 'Link', component: Link, props: { href: '/home', children: text }, selector: '.ss-link' },
  {
    name: 'LogStream',
    component: LogStream,
    // Controlled lines → demo ticker stays off (no timers under the test).
    props: { lines: [{ lvl: 'info', msg: 'boot ok' }] },
    selector: '.ss-logs',
  },
  {
    name: 'MetricTile',
    component: MetricTile,
    props: { label: 'cpu', value: 62 },
    selector: '.ss-metric',
  },
  {
    name: 'ServiceCard',
    component: ServiceCard,
    props: { name: 'movies', host: 'movies.home' },
    selector: '.ss-svc',
  },
  { name: 'Sidebar', component: Sidebar, props: {}, selector: '.ss-side' },
  {
    name: 'Sparkline',
    component: Sparkline,
    props: { data: [1, 2, 3], label: 'trend' },
    selector: '.ss-spark',
  },
  { name: 'Toaster', component: Toaster, props: {}, selector: '.ss-toaster' },
  { name: 'Topbar', component: Topbar, props: {}, selector: '.ss-topbar' },
  {
    // `sm` is already covered in SegmentedControl's own test file — md+lg here.
    name: 'SegmentedControl',
    component: SegmentedControl,
    props: {
      label: 'View',
      options: [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ],
    },
    selector: '.ss-segmented',
    sizes: ['md', 'lg'],
  },
  // Components added later in this release — optional per DS-0070 but cheap to cover.
  { name: 'Heading', component: Heading, props: { children: text }, selector: '.ss-heading' },
  { name: 'Container', component: Container, props: { children: text }, selector: '.ss-container' },
  { name: 'Textarea', component: Textarea, props: { label: 'Notes' }, selector: '.ss-textarea' },
  { name: 'Spinner', component: Spinner, props: {}, selector: '.ss-spinner' },
]

const ALL_SIZES: Size[] = ['sm', 'md', 'lg']

describe('size variants — data-size-variant per component (DS-0070)', () => {
  beforeEach(() => {
    // Neutral module config so resolveComponentSize sees no componentsSize noise.
    applyDesignConfig({ ...defaultDesignConfig }, document.documentElement)
  })

  describe.each(CASES)('$name', ({ component, props, selector, sizes }) => {
    it.each(sizes ?? ALL_SIZES)('applies size="%s" as data-size-variant on the root', (size) => {
      const { container } = render(component, { ...props, size })
      const root = container.querySelector(selector)
      expect(root).not.toBeNull()
      expect(root).toHaveAttribute('data-size-variant', size)
    })

    it('omits data-size-variant when no size is set (inherits the cascade)', () => {
      const { container } = render(component, { ...props })
      const root = container.querySelector(selector)!
      expect(root).not.toBeNull()
      expect(root).not.toHaveAttribute('data-size-variant')
    })
  })
})
