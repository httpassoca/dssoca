<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Heading from '$lib/components/Heading.svelte'

  const { Story } = defineMeta({
    title: 'Components/Heading',
    component: Heading,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story
    // can drive the heading's text via the `text` arg (Heading takes its text
    // as a child snippet, not a prop).
    render: template,
    argTypes: {
      level: {
        control: { type: 'inline-radio' },
        options: [1, 2, 3, 4, 5, 6],
        description: 'Heading level — picks the rendered h1…h6 element.',
      },
      accent: {
        control: 'boolean',
        description: 'Primary accent underline behind the text (on by default).',
      },
      centered: {
        control: 'boolean',
        description: 'Center the heading.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      text: {
        control: 'text',
        description: 'Heading text (rendered as the child snippet).',
      },
    },
    args: {
      level: 1,
      accent: true,
      centered: false,
      text: 'hub_dashboard',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Heading
    level={args.level as 1 | 2 | 3 | 4 | 5 | 6}
    accent={args.accent as boolean}
    centered={args.centered as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
  >
    {args.text}
  </Heading>
{/snippet}

<Story name="Default" args={{ text: 'hub_dashboard' }} />

<Story name="NoAccent" args={{ accent: false, text: 'plain display title' }} />

<Story name="Centered" args={{ centered: true, text: 'centered title' }} />

<Story name="Level2" args={{ level: 2, text: 'h2 semantics, display styling' }} />

<Story name="CenteredNoAccent" args={{ centered: true, accent: false, text: 'quiet + centered' }} />
