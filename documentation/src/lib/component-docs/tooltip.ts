import { type ComponentDoc, SIZE_PROP } from './types'

export const tooltip: ComponentDoc = {
  name: 'Tooltip',
  slug: 'tooltip',
  htmlExample: {
    props: { text: 'Copy to clipboard' },
    children: '<button class="ss-btn secondary" type="button">copy</button>',
    behaviour: 'js',
    note: "vanilla.js shows the tip on hover/focus and hides on leave/blur and on Escape pressed anywhere; while open it adds the tip id to the focusable trigger's aria-describedby. data-placement is used as-is (no collision flipping).",
  },
  tagline: 'Hover/focus hint for a trigger.',
  description:
    'A lightweight tooltip that wraps any trigger and shows a short hint on hover or focus. It follows the WAI-ARIA tooltip pattern: the popup has `role="tooltip"`, the focusable trigger inside it gets `aria-describedby` pointing at the tip only while open, and Escape dismisses it wherever focus is. `placement` (top/bottom/left/right) is the preferred side: when it has no room the tooltip flips and shifts to stay visible. The transition respects `prefers-reduced-motion`. `text` takes a plain string or a snippet, so the tip can hold a small rendered template (a `<code>` path, a `Kbd` chip, an emphasised word).',
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
      desc: 'Preferred side the tooltip attaches to relative to the trigger; collision avoidance may move it.',
    },
    {
      name: 'avoidCollisions',
      type: 'boolean',
      default: 'true',
      desc: 'Flip to the opposite or a perpendicular side, and shift along the edge, when the preferred side does not fit inside the viewport or an overflow-clipping ancestor. `false` pins the tip to `placement`.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Required. The trigger content, wrapped in an inline-block container.',
    },
    SIZE_PROP,
  ],
  notes:
    'Show on `mouseenter`/`focusin`, hide on `mouseleave`/`focusout` and on Escape (a document-level listener while open, so a tip opened by hover can be dismissed too). The tooltip element stays in the DOM but is `hidden` (and never announced) while closed. While open, the tip id is added to `aria-describedby` on the focused trigger (or, for a hover, the first focusable element in the trigger), next to any description the trigger already has, and removed again on close. The open tip is hoverable: the pointer can move onto it without closing it (WCAG 1.4.13). A snippet `text` renders inside that same element, so whatever it contains is the accessible description — keep it to phrasing content (`code`, `strong`, `kbd`, `br`, `Icon`) and never put links, buttons or other interactive elements in a tip: the tip never takes focus, and interactive hints belong in a click-triggered toggletip/popover instead. Widen a long tip with `--ss-tooltip-max-w` (default `240px`). Collision avoidance is on by default: on open (and on scroll/resize while open) the tip measures the room around the trigger inside the viewport and any ancestor that clips `overflow`, tries the preferred side, then the opposite side, then the perpendicular side with more room (or the roomiest side if nothing fits), and finally slides along the cross axis so it never overhangs the edge. The resolved side is exposed as `data-placement` on the root. Pass `avoidCollisions={false}` to keep the tip on `placement` regardless.',
}
