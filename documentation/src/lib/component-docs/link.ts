import { type ComponentDoc, SIZE_PROP } from './types';

export const link: ComponentDoc = {
  name: 'Link',
  slug: 'link',
  tagline: 'Navigation, with an animated underline.',
  description:
    'A semantic `<a>` for navigation. The default `inline` variant draws an animated underline that reveals on hover/focus with a primary-tinted glow; the `button` variant styles the link as a solid primary action (no underline) without duplicating Button’s API. Off-site `http(s)` URLs are auto-detected as external — they open in a new tab with `rel="noopener noreferrer"`, gain a trailing external-link glyph, and announce “opens in a new tab”. Forwards any remaining native anchor attributes.',
  storyId: 'components-link--default',
  usage: `<script>
  import { Link } from 'dssoca';
</script>

<Link href="/about">about</Link>
<Link href="https://example.com">external docs</Link>
<Link variant="button" href="/get-started">get started</Link>`,
  props: [
    { name: 'href', type: 'string', desc: 'Destination URL.' },
    { name: 'variant', type: "'inline' | 'button'", default: "'inline'", desc: 'Animated-underline link (inline) or solid primary button-styled link (button).' },
    { name: 'external', type: 'boolean', desc: 'Open in a new tab + safe rel + external glyph. Auto-detected for absolute http(s) URLs when left undefined; pass false to force same-tab.' },
    { name: 'el', type: 'HTMLAnchorElement', desc: 'Bindable reference to the underlying <a>.' },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Link label.' },
    { name: '...rest', type: 'HTMLAnchorAttributes', desc: 'Any remaining native anchor attributes / handlers are forwarded (including an explicit target/rel that override the external defaults).' },
  ],
  notes:
    'Use Link for navigation (renders an `<a>`, gets the browser’s link affordances and keyboard model) and Button for in-page actions (renders a `<button>`). The `button` variant is purely visual — reach for an actual Button when there is no destination URL. Honours reduced motion (the `--ss-dur-*` tokens collapse to 0ms), shows a visible `:focus-visible` ring (not just the underline), and dims visited inline links.',
};
