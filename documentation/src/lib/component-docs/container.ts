import { type ComponentDoc, SIZE_PROP } from './types';

export const container: ComponentDoc = {
  name: 'Container',
  slug: 'container',
  tagline: 'Centered, max-width page-content wrapper.',
  description:
    'A layout primitive that centres page content in a token-driven max-width column (~875px at md) with the standard horizontal page gutters. Full-bleed by default at narrow viewports — below the max-width it simply spans the screen, keeping its side padding. The `page` mode makes it behave like a route page: it fills the viewport height and adds vertical page padding. Self-contained — usable without importing `theme.css` (the width/padding tokens ship in the component).',
  storyId: 'components-container--default',
  usage: `<script>
  import { Container, Heading } from 'dssoca';
</script>

<Container page>
  <Heading>page_title</Heading>
  <p>Centered, max-width page content.</p>
</Container>`,
  props: [
    { name: 'page', type: 'boolean', default: 'false', desc: 'Page mode — fills the viewport height (min-height: 100svh) and adds vertical page padding.' },
    SIZE_PROP,
    { name: 'children', type: 'Snippet', desc: 'Page content.' },
  ],
  notes:
    'A purely structural wrapper (a plain `<div>` — no landmark role is imposed, so nest it inside your `<main>` or wrap one around it as your document structure requires). Width and paddings read the `--ss-container-*` tokens and rescale across sm/md/lg; the md gutters alias the app-shell `--ss-main-px` so Container content aligns with `.ss-main` layouts.',
};
