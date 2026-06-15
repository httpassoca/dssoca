<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Avatar from '$lib/components/Avatar.svelte'

  const { Story } = defineMeta({
    title: 'Components/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    argTypes: {
      name: {
        control: 'text',
        description:
          'Name — drives the initials, the deterministic colour, and the accessible name.',
      },
      src: {
        control: 'text',
        description: 'Optional image URL; falls back to initials on load error.',
      },
      alt: {
        control: 'text',
        description: 'Image alt text; defaults to `name`.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      name: 'Ada Lovelace',
    },
  })
</script>

<Story name="Default" args={{ name: 'Ada Lovelace' }} />

<Story name="With image" args={{ name: 'Ada Lovelace', src: 'https://i.pravatar.cc/96?img=5' }} />

<Story name="Long name" args={{ name: 'Grace Brewster Murray Hopper' }} />

<Story
  name="Color spread"
  args={{ name: 'Alan Turing' }}
  parameters={{ docs: { description: { story: 'Same name → same colour, every render.' } } }}
>
  {#snippet template()}
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <Avatar name="Alan Turing" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Edsger Dijkstra" />
      <Avatar name="Barbara Liskov" />
      <Avatar name="Donald Knuth" />
      <Avatar name="Margaret Hamilton" />
    </div>
  {/snippet}
</Story>

<Story name="Large" args={{ name: 'Ada Lovelace', size: 'lg' }} />
