<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PassocaMark from '$lib/components/PassocaMark.svelte';

  const { Story } = defineMeta({
    title: 'Components/PassocaMark',
    component: PassocaMark,
    tags: ['autodocs'],
    argTypes: {
      size: {
        control: { type: 'number' },
        description: 'Width and height of the SVG in pixels.',
      },
      color: {
        control: 'color',
        description: 'Fill color — accepts any CSS color value or custom property.',
      },
    },
    args: {
      size: 22,
      color: 'var(--ss-primary)',
    },
  });
</script>

<Story name="Default" />

<Story name="Small" args={{ size: 16 }} />

<Story name="Medium" args={{ size: 32 }} />

<Story name="Large" args={{ size: 64 }} />

<Story name="CustomColor" args={{ size: 48, color: 'var(--ss-accent)' }} />
