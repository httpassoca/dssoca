import { type ComponentDoc, SIZE_PROP } from './types';

export const image: ComponentDoc = {
  name: 'Image',
  slug: 'image',
  tagline: 'Responsive image with skeleton and optional lightbox.',
  description:
    'A responsive `<picture>` with `srcset`/`sizes`, lazy + async decoding, an aspect-ratio box that reserves space before load (no layout shift), a token-driven loading skeleton, an error fallback, and an optional lightbox. The lightbox is a lightweight built-in dialog overlay — dssoca depends on no image/lightbox runtime (e.g. PhotoSwipe) and stays zero-runtime-dependency.',
  storyId: 'components-image--default',
  usage: `<script>
  import { Image } from 'dssoca';
</script>

<!-- Aspect-ratio box reserves space before the image loads -->
<Image src="/photo.jpg" alt="A scenic photo" ratio={16 / 9} />

<!-- Responsive <picture> + click-to-zoom lightbox -->
<Image
  src="/photo-960.jpg"
  alt="A scenic photo"
  width={960}
  height={540}
  sources={[
    { srcset: '/photo.avif', type: 'image/avif' },
    { srcset: '/photo.webp', type: 'image/webp' }
  ]}
  caption="On the trail"
  lightbox
/>`,
  props: [
    { name: 'src', type: 'string', desc: 'Image URL (fallback <img> source).' },
    { name: 'alt', type: 'string', desc: 'Required alternative text (WCAG 1.1.1). Use "" only for purely decorative images.' },
    { name: 'srcset', type: 'string', desc: 'Responsive srcset for the fallback <img>.' },
    { name: 'sizes', type: 'string', desc: 'sizes hint paired with srcset.' },
    { name: 'sources', type: 'ImageSource[]', default: '[]', desc: 'Responsive <picture> sources: { srcset, media?, type?, sizes? }.' },
    { name: 'width', type: 'number', desc: 'Intrinsic width (px) — feeds the aspect-ratio box and the img attr.' },
    { name: 'height', type: 'number', desc: 'Intrinsic height (px) — feeds the aspect-ratio box and the img attr.' },
    { name: 'ratio', type: 'number', desc: 'Aspect ratio (w / h) to reserve space before load. Wins over width/height.' },
    { name: 'fit', type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'", default: "'cover'", desc: 'object-fit inside the reserved ratio box.' },
    { name: 'eager', type: 'boolean', default: 'false', desc: 'Eager-load above-the-fold (loading="eager", decoding="auto", fetchpriority="high").' },
    { name: 'lightbox', type: 'boolean', default: 'false', desc: 'Open the built-in dialog overlay on click (role="dialog", aria-modal, focus trap, Esc to close, restores focus).' },
    { name: 'caption', type: 'string', desc: 'Caption rendered in a <figcaption> under the image.' },
    SIZE_PROP,
  ],
  notes:
    'No layout shift: a ratio box (from `ratio`, or derived from `width`/`height`) reserves space before load. Lazy + async by default; flip `eager` for above-the-fold hero images. The loading skeleton respects `prefers-reduced-motion` (the shimmer freezes) and a load error swaps in a labelled fallback. The optional lightbox is a built-in overlay (no PhotoSwipe dependency): `role="dialog"` + `aria-modal`, a focus trap, `Esc`/backdrop-click to close, and focus restored to the trigger.',
};
