import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the Link implementation (DS-0052).
export const link: ComponentDoc = {
  name: 'Link',
  slug: 'link',
  tagline: 'Anchor with the signature animated underline.',
  description:
    "The design system's styled anchor: an animated underline with a soft glow, an optional button-styled variant, and safe external-link handling.",
  storyId: 'components-link--default',
  usage: `<script>
  import { Link } from 'dssoca';
</script>

<Link href="/docs">Read the docs</Link>`,
  props: [
    { name: 'href', type: 'string', desc: 'Destination URL.' },
    { name: 'variant', type: "'inline' | 'button'", default: "'inline'", desc: 'Underlined inline link, or styled as a button.' },
    { name: 'external', type: 'boolean', default: 'false', desc: 'Open in a new tab with safe rel + an external-link icon.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0052.',
};
