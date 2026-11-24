import { type ComponentDoc, SIZE_PROP } from './types'

export const tabs: ComponentDoc = {
  name: 'Tabs',
  slug: 'tabs',
  htmlExample: {
    props: {
      tabs: [
        { id: 'overview', label: 'Overview' },
        { id: 'logs', label: 'Logs' },
        { id: 'shell', label: 'Shell' },
      ],
      value: 'overview',
      label: 'Service',
    },
    snippets: { panel: '<p>All systems nominal.</p>' },
    behaviour: 'js',
    note: 'Author one .panel per tab and leave the inactive ones hidden. vanilla.js moves the selection (click, arrows mirrored under RTL, Home/End), toggles hidden on the panels and emits ss:change with { value, index, reason } (value = the tab\'s data-value). Add data-activation="manual" on the root to select with Enter/Space only.',
  },
  tagline: 'Tab list that switches between panels.',
  description:
    'The WAI-ARIA tabs pattern in one tag: a row of tabs over a set of panels, of which only the selected one is shown. The selected tab carries a 2px underline (zero radius, the Topbar strip treatment). The tab list is a single tab stop: arrow / Home / End keys move across the tabs, disabled tabs are skipped, and the panel is reachable with the next Tab press.',
  storyId: 'components-tabs--default',
  usage: `<script>
  import { Tabs } from 'dssoca';
  let tab = $state('overview');
</script>

<Tabs
  label="Service"
  tabs={[
    { id: 'overview', label: 'Overview', icon: 'grid' },
    { id: 'logs', label: 'Logs', icon: 'logs' },
    { id: 'shell', label: 'Shell', disabled: true },
  ]}
  bind:value={tab}
  onChange={(id, { reason }) => console.log(id, reason)}
>
  {#snippet panel(active)}
    {#if active.id === 'overview'}
      <p>All systems nominal.</p>
    {:else}
      <p>Content for {active.label}.</p>
    {/if}
  {/snippet}
</Tabs>`,
  props: [
    {
      name: 'tabs',
      type: 'TabItem[]',
      default: '[]',
      desc: 'The tabs, in order: { id, label, icon?, disabled? }. Disabled tabs are skipped by the keyboard and cannot be selected.',
    },
    {
      name: 'value',
      type: 'string',
      desc: 'Id of the selected tab (bindable). When it matches no tab, the first enabled tab is shown.',
    },
    {
      name: 'label',
      type: 'string',
      desc: 'Accessible name for the tab list (required → aria-label on the tablist).',
    },
    {
      name: 'panel',
      type: 'Snippet<[TabItem]>',
      desc: 'Content of the selected panel; receives the active tab. Only the active panel is filled.',
    },
    {
      name: 'onChange',
      type: '(value: string, details: { reason: TabsReason }) => void',
      desc: "Fired when the selection changes, after `value` updates, with the new id and what moved it: `details.reason` is `'press'` (a tab was clicked) or `'key'` (arrow / Home / End, or Enter / Space with manual activation). Not fired when the parent changes a bound `value`.",
    },
    {
      name: 'activation',
      type: "'auto' | 'manual'",
      default: "'auto'",
      desc: "How the keyboard selects. `'auto'`: the tab that takes focus is selected. `'manual'`: arrows only move focus and Enter / Space select — use it when showing a panel is expensive.",
    },
    SIZE_PROP,
  ],
  notes:
    'WCAG 2.2 AA: `role="tablist"` (named by `label`) with `role="tab"` buttons carrying `aria-selected` and `aria-controls`; each panel is `role="tabpanel"`, named by its tab through `aria-labelledby`, and focusable (`tabindex="0"`) so its content is one Tab away even when it holds nothing focusable. Roving tabindex makes the list one tab stop; the stop is the selected tab, or the first enabled tab when the selected one is disabled. Left/Right follow the visual order: under RTL (`dir="rtl"` on any ancestor) ArrowLeft moves to the next tab; Up/Down are left to the page. Inactive panels carry `hidden`, so they leave the tab order and the accessibility tree. The selected state is an underline, not colour alone, and keyboard focus shows the solid `--ss-primary` ring inside the tab. A long tab list scrolls horizontally instead of wrapping. For picking a value rather than switching panels, use SegmentedControl.',
}
