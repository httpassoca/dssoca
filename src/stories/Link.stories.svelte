<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Link from '$lib/components/Link.svelte';

  const { Story } = defineMeta({
    title: 'Components/Link',
    component: Link,
    tags: ['autodocs'],
    // Shared template so every story drives the link label via the `label` arg
    // (Link takes its label as a child snippet, not a prop).
    render: template,
    argTypes: {
      variant: {
        control: { type: 'inline-radio' },
        options: ['inline', 'button'],
        description: 'Visual treatment: animated underline (inline) or solid primary (button).',
      },
      external: {
        control: { type: 'inline-radio' },
        options: [undefined, true, false],
        description:
          'Open in a new tab + safe rel + external glyph. Auto-detected for absolute http(s) URLs when left undefined.',
      },
      href: {
        control: 'text',
        description: 'Destination URL.',
      },
      label: {
        control: 'text',
        description: 'Text content (rendered as the link child).',
      },
    },
    args: {
      variant: 'inline',
      href: '#',
      label: 'read the docs',
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Link
    variant={args.variant as 'inline' | 'button'}
    external={args.external as boolean | undefined}
    href={args.href as string}
  >
    {args.label}
  </Link>
{/snippet}

<Story name="Default" args={{ variant: 'inline', href: '#', label: 'read the docs' }} />

<Story name="External" args={{ href: 'https://github.com/httpassoca/dssoca', label: 'view on GitHub' }} />

<Story name="Button" args={{ variant: 'button', href: '#', label: 'get started' }} />
