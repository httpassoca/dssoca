import { type ComponentDoc, SIZE_PROP } from './types'

export const tooltip: ComponentDoc = {
  name: 'Tooltip',
  slug: 'tooltip',
  tagline: 'Hover/focus hint for a trigger.',
  description:
    'A lightweight tooltip that wraps any trigger and shows a short hint on hover or focus. It follows the WAI-ARIA tooltip pattern: the popup has `role="tooltip"`, the trigger wrapper gets `aria-describedby` only while open, and it dismisses on Escape. Position it with `placement` (top/bottom/left/right); the transition respects `prefers-reduced-motion`.',
  storyId: 'components-tooltip--default',
  usage: `<script>
  import { Tooltip, Button } from 'dssoca';
</script>

<Tooltip text="Restart the service">
  <Button>Restart</Button>
</Tooltip>

<Tooltip text="Opens in a new tab" placement="bottom">
  <button>Docs</button>
</Tooltip>`,
  props: [
    { name: 'text', type: 'string', desc: 'Required. The tooltip text / accessible description.' },
    {
      name: 'placement',
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "'top'",
      desc: 'Side the tooltip attaches to relative to the trigger.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Required. The trigger content, wrapped in an inline-block container.',
    },
    SIZE_PROP,
  ],
  notes:
    'Show on `mouseenter`/`focusin`, hide on `mouseleave`/`focusout` and Escape. The tooltip element stays in the DOM but is `hidden` (and never announced) while closed; `aria-describedby` is wired only while open.',
}
