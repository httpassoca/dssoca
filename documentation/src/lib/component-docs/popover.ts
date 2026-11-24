import { type ComponentDoc, SIZE_PROP } from './types'

export const popover: ComponentDoc = {
  name: 'Popover',
  slug: 'popover',
  htmlExample: {
    props: { label: 'Filters' },
    snippets: { trigger: 'Filters' },
    children:
      '<p>Status, region and owner.</p>\n<button class="ss-btn" type="button">Apply</button>',
    behaviour: 'js',
    note: 'vanilla.js opens/closes the panel, moves focus into it, closes on Escape (focus back on the trigger), outside click and tab-out, keeps the closed panel inert, and emits ss:openchange with { open, reason }.',
  },
  tagline: 'Non-modal floating panel anchored to a trigger.',
  description:
    "A trigger button that opens a floating panel for arbitrary content: filters, a short form, extra details. It is Menu's sibling (same CSS-only `side` / `align` placement, zero radius, --ss-shadow-pop) for content that is not a list of actions. The panel is non-modal: the page stays usable, and the popover dismisses itself on Escape, an outside press, or when focus tabs out of it.",
  storyId: 'components-popover--default',
  usage: `<script>
  import { Popover, Button, Switch } from 'dssoca';

  let open = $state(false);
  let onlyFailing = $state(false);
</script>

<Popover
  bind:open
  align="end"
  label="Filters"
  onOpenChange={(open, { reason }) => console.log(open, reason)}
>
  {#snippet trigger()}Filters{/snippet}

  <Switch label="Only failing" bind:checked={onlyFailing} />
  <Button onclick={() => (open = false)}>Done</Button>
</Popover>`,
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      desc: 'Bindable open state. Omit `bind:` for an uncontrolled popover the trigger toggles itself.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean, details: { reason: PopoverReason }) => void',
      desc: "Fired when the popover opens or closes itself, with the new state and why. `details.reason` is one of `'trigger'` (trigger press), `'escape'`, `'outside'` (pointer down outside) or `'tab'` (focus tabbed out). Not fired when the parent changes a bound `open`.",
    },
    {
      name: 'side',
      type: "'bottom' | 'top'",
      default: "'bottom'",
      desc: 'Vertical side the panel opens toward.',
    },
    {
      name: 'align',
      type: "'start' | 'end'",
      default: "'start'",
      desc: 'Horizontal edge the panel aligns to relative to the trigger.',
    },
    {
      name: 'label',
      type: 'string',
      desc: 'Accessible name for the panel (`role="dialog"`). When omitted the panel is named by the trigger text via `aria-labelledby`.',
    },
    {
      name: 'trigger',
      type: 'Snippet',
      desc: 'Trigger content rendered inside the toggle button. Keep it to text and icons: the button must not hold interactive content.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Panel content.',
    },
    SIZE_PROP,
  ],
  notes:
    'The trigger is a `<button>` with aria-haspopup="dialog" + aria-expanded/aria-controls; the panel is a non-modal role="dialog" (no aria-modal, no focus trap, no scroll lock), named by `label`, else by the trigger through aria-labelledby. Opening moves focus into the panel: its first focusable element, or the panel itself when it holds none (a popover rendered already open does not grab focus). Escape closes and returns focus to the trigger; an outside pointerdown closes without pulling focus back; tabbing out of the popover closes it and lets focus go on. Moving between the trigger and the panel, or switching windows, keeps it open. While closed the panel is `inert` and `visibility: hidden`, so its content leaves the tab order and the accessibility tree. Placement is CSS-only and does not flip at the viewport edge: pick `side` / `align` for where the trigger sits. RTL-aware: `align` uses logical insets. Plain HTML: vanilla.js adds aria-labelledby → trigger to an unnamed panel on first open. For a list of actions use Menu; for a blocking surface use Modal. WCAG 2.2 AA.',
}
