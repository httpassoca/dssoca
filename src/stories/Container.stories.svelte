<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Container from '$lib/components/Container.svelte'
  import Heading from '$lib/components/Heading.svelte'
  import Card from '$lib/components/Card.svelte'

  const { Story } = defineMeta({
    title: 'Components/Container',
    component: Container,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story
    // ships representative page content inside the wrapper.
    render: template,
    argTypes: {
      page: {
        control: 'boolean',
        description: 'Page mode — fills the viewport height and adds vertical page padding.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      page: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Container page={args.page as boolean} size={args.size as 'sm' | 'md' | 'lg' | undefined}>
    <Heading>page_title</Heading>
    <Card title="content">
      <p>
        Centered, max-width page content. Resize the viewport: the container is full-bleed below its
        max-width and keeps its side gutters.
      </p>
    </Card>
  </Container>
{/snippet}

<Story name="Default" args={{}} />

<Story name="Page" args={{ page: true }} />
