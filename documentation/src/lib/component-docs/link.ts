import { type ComponentDoc, SIZE_PROP } from './types'

export const link: ComponentDoc = {
  name: 'Link',
  slug: 'link',
  htmlExample: {
    props: { href: 'https://example.com' },
    children: 'external docs',
    behaviour: 'css',
  },
  tagline: 'Navigation, always underlined.',
  description:
    'A semantic `<a>` for navigation. The default `inline` variant is always underlined (a 1px line at rest, so it never relies on colour alone) and the line thickens with a primary-tinted glow on hover/focus; the `button` variant styles the link as a solid primary action (no underline) without duplicating Button’s API. Off-site `http(s)` URLs are auto-detected as external — they open in a new tab and gain a trailing external-link glyph. Any link that opens a new tab (auto-detected or an explicit `target="_blank"`) gets `noopener noreferrer` merged into its `rel` and announces “opens in a new tab”. Forwards any remaining native anchor attributes.',
  storyId: 'components-link--default',
  usage: `<script>
  import { Link } from 'dssoca';
</script>

<Link href="/about">about</Link>
<Link href="https://example.com">external docs</Link>
<Link variant="button" href="/get-started">get started</Link>`,
  props: [
    { name: 'href', type: 'string', desc: 'Destination URL.' },
    {
      name: 'variant',
      type: "'inline' | 'button'",
      default: "'inline'",
      desc: 'Underlined link that thickens on hover/focus (inline) or solid primary button-styled link (button).',
    },
    {
      name: 'external',
      type: 'boolean',
      desc: 'Open in a new tab + external glyph. Auto-detected for absolute http(s) URLs when left undefined; pass false to force same-tab.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Render the link inert: the href is dropped (no navigation, out of the tab order via tabindex="-1"), link semantics are kept with role="link" + aria-disabled="true", forwarded onclick handlers do not fire, and the external affordances are suppressed.',
    },
    { name: 'el', type: 'HTMLAnchorElement', desc: 'Bindable reference to the underlying <a>.' },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Link label.' },
    {
      name: '...rest',
      type: 'HTMLAnchorAttributes',
      desc: 'Any remaining native anchor attributes / handlers are forwarded (an explicit target overrides the external default; a custom rel is merged with `noopener noreferrer` whenever the resolved target is `_blank`).',
    },
  ],
  notes:
    'Use Link for navigation (renders an `<a>`, gets the browser’s link affordances and keyboard model) and Button for in-page actions (renders a `<button>`). The `button` variant is purely visual — reach for an actual Button when there is no destination URL. Honours reduced motion (the `--ss-dur-*` tokens collapse to 0ms), shows a visible `:focus-visible` ring (not just the underline), and dims visited inline links. The component cancels theme.css’s global `a::before` underline and draws its own, so it looks the same on the tokens.css-only path.',
}
