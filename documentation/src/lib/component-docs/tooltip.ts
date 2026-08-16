import { type ComponentDoc, SIZE_PROP } from './types'

export const tooltip: ComponentDoc = {
  name: 'Tooltip',
  slug: 'tooltip',
  tagline: 'Hover/focus hint for a trigger.',
  description:
    'A lightweight tooltip that wraps any trigger and shows a short hint on hover or focus. It follows the WAI-ARIA tooltip pattern: the popup has `role="tooltip"`, the trigger wrapper gets `aria-describedby` only while open, and it dismisses on Escape. Position it with `placement` (top/bottom/left/right); the transition respects `prefers-reduced-motion`. `text` takes a plain string or a snippet, so the tip can hold a small rendered template (a `<code>` path, a `Kbd` chip, an emphasised word).',
  storyId: 'components-tooltip--default',
  usage: `<script>
  import { Tooltip, Button, Kbd } from 'dssoca';
</script>

<Tooltip text="Restart the service">
  <Button>Restart</Button>
</Tooltip>

<Tooltip text="Opens in a new tab" placement="bottom">
  <button>Docs</button>
</Tooltip>

<!-- A snippet tip: a small rendered template instead of a flat string -->
{#snippet copyTip()}
  <strong>Copy path</strong> <code>/srv/app</code> <Kbd keys="mod+c" size="sm" />
{/snippet}

<Tooltip text={copyTip}>
  <Button>Copy</Button>
</Tooltip>`,
  props: [
    {
      name: 'text',
      type: 'string | Snippet',
      desc: 'Required. The tooltip content and accessible description: a string, or a snippet for a small rendered template (phrasing content only, nothing interactive).',
    },
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
    'Show on `mouseenter`/`focusin`, hide on `mouseleave`/`focusout` and Escape. The tooltip element stays in the DOM but is `hidden` (and never announced) while closed; `aria-describedby` is wired only while open. A snippet `text` renders inside that same element, so whatever it contains is the accessible description — keep it to phrasing content (`code`, `strong`, `kbd`, `br`, `Icon`) and never put links, buttons or other interactive elements in a tip: the tip is `pointer-events: none`, and interactive hints belong in a click-triggered toggletip/popover instead. Widen a long tip with `--ss-tooltip-max-w` (default `240px`).',
}
