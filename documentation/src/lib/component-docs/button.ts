import { type ComponentDoc, SIZE_PROP } from './types'

export const button: ComponentDoc = {
  name: 'Button',
  slug: 'button',
  tagline: 'The primary action control.',
  description:
    'Four variants — primary, secondary, ghost, danger. Square edges, token-driven padding. Supports a `loading` state that renders the shared `Spinner` (aria-busy, stays focusable) and accepts `true` (the configured default variant) or a `SpinnerVariant` string, leading/trailing icon snippets that never change the control height, `iconOnly` and `fullWidth` layouts, a bindable element ref, and forwards any remaining native button attributes.',
  storyId: 'components-button--primary',
  usage: `<script>
  import { Button } from 'dssoca';
</script>

<Button variant="primary" onclick={() => {}}>deploy</Button>
<Button variant="secondary">cancel</Button>
<Button variant="danger" loading loadingLabel="deleting…">delete</Button>
<Button variant="primary" loading="pipe" loadingLabel="saving…">save</Button>
<Button variant="ghost">forgot?</Button>`,
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'danger'",
      default: "'secondary'",
      desc: 'Visual emphasis.',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      desc: 'Native button type.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the button.' },
    {
      name: 'loading',
      type: 'boolean | SpinnerVariant',
      default: 'false',
      desc: 'Loading state, rendered with the shared Spinner: `true` uses the configured default variant, a SpinnerVariant string picks a glyph, `false` is off. Blocks clicks, sets aria-busy; the button stays focusable. (BREAKING since 0.x: was a plain boolean and a bespoke ring spinner.)',
    },
    {
      name: 'loadingLabel',
      type: 'string',
      desc: 'Accessible name while loading (keeps the name stable when the label is hidden).',
    },
    {
      name: 'iconOnly',
      type: 'boolean',
      default: 'false',
      desc: 'Square icon-only button; `label` is required and becomes the aria-label.',
    },
    { name: 'label', type: 'string', desc: 'Accessible name; required for icon-only buttons.' },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      desc: 'Stretch to fill the inline axis and centre the content.',
    },
    { name: 'leading', type: 'Snippet', desc: 'Icon snippet rendered before children.' },
    { name: 'trailing', type: 'Snippet', desc: 'Icon snippet rendered after children.' },
    {
      name: 'onclick',
      type: '(e: MouseEvent) => void',
      desc: 'Click handler (suppressed while loading/disabled).',
    },
    {
      name: 'el',
      type: 'HTMLButtonElement',
      desc: 'Bindable reference to the underlying <button>.',
    },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Button label.' },
    {
      name: '...rest',
      type: 'HTMLButtonAttributes',
      desc: 'Any remaining native button attributes / handlers are forwarded.',
    },
  ],
}
