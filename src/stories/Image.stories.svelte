<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Image from '$lib/components/Image.svelte'
  import type { ComponentProps } from 'svelte'

  // A stable, deterministic remote image so the story renders in any embed.
  const PHOTO = 'https://picsum.photos/id/1018/1200/675'

  const { Story } = defineMeta({
    title: 'Components/Image',
    component: Image,
    tags: ['autodocs'],
    // Every story renders through the shared `template` snippet below so the
    // image sits in a width-capped column (matches real content usage).
    render: template,
    argTypes: {
      ratio: {
        control: { type: 'number' },
        description: 'Aspect ratio (w / h) — reserves space before load to avoid layout shift.',
      },
      lightbox: {
        control: 'boolean',
        description: 'Open a lightweight built-in dialog overlay on click.',
      },
      eager: {
        control: 'boolean',
        description: 'Eager-load above-the-fold images (loading="eager", high fetchpriority).',
      },
      caption: { control: 'text', description: 'Optional figcaption text.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Chrome size (skeleton/lightbox), not the intrinsic image size.',
      },
    },
    args: {
      src: PHOTO,
      alt: 'A mountain landscape at dawn',
      ratio: 16 / 9,
      lightbox: false,
      eager: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <div style="max-width: 560px;">
    <Image {...args as unknown as ComponentProps<typeof Image>} />
  </div>
{/snippet}

<Story name="Default" args={{ ratio: 16 / 9 }} />

<Story name="With caption" args={{ caption: 'Sunrise over the ridge' }} />

<Story name="Lightbox" args={{ lightbox: true }} />

<Story name="Square" args={{ ratio: 1, alt: 'A square crop' }} />
