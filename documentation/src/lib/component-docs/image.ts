import { type ComponentDoc, SIZE_PROP } from './types';

// SCAFFOLD STUB (DS-0043) — fleshed out by the Image implementation (DS-0055).
export const image: ComponentDoc = {
  name: 'Image',
  slug: 'image',
  tagline: 'Responsive image with skeleton and optional lightbox.',
  description:
    'A responsive `<picture>` with srcset, lazy loading, an aspect-ratio box that prevents layout shift, a loading skeleton, and an optional lightbox overlay.',
  storyId: 'components-image--default',
  usage: `<script>
  import { Image } from 'dssoca';
</script>

<Image src="/photo.jpg" alt="A photo" ratio={16 / 9} />`,
  props: [
    { name: 'src', type: 'string', desc: 'Image URL.' },
    { name: 'alt', type: 'string', desc: 'Required alternative text.' },
    { name: 'sources', type: 'ImageSource[]', default: '[]', desc: 'Optional responsive <picture> sources: { srcset, media?, type? }.' },
    { name: 'ratio', type: 'number', desc: 'Aspect ratio (w/h) used to reserve space before load.' },
    { name: 'lightbox', type: 'boolean', default: 'false', desc: 'Open a lightbox overlay on click.' },
    SIZE_PROP,
  ],
  notes: 'Implementation tracked in agile DS-0055.',
};
