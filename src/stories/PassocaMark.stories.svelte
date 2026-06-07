<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PassocaMark from '$lib/components/PassocaMark.svelte';

  const { Story } = defineMeta({
    title: 'Components/PassocaMark',
    component: PassocaMark,
    tags: ['autodocs'],
    argTypes: {
      px: {
        control: { type: 'number' },
        description: 'Width and height of the SVG in pixels.',
      },
      color: {
        control: 'color',
        description: 'Fill color — accepts any CSS color value or custom property.',
      },
    },
    args: {
      px: 22,
      color: 'var(--ss-primary)',
    },
  });
</script>

<Story name="Default" />

<Story name="Small" args={{ px: 16 }} />

<Story name="Medium" args={{ px: 32 }} />

<Story name="Large" args={{ px: 64 }} />

<Story name="CustomColor" args={{ px: 48, color: 'var(--ss-accent)' }} />
