<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Card from '$lib/components/Card.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import Button from '$lib/components/Button.svelte';

  // Card has a required `children` snippet and optional `title`, `meta`, and
  // `action` snippets, so every story is driven through the shared `template`
  // snippet below.
  const { Story } = defineMeta({
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      title: {
        control: 'text',
        description: 'Header title text. When omitted the header row is hidden.',
      },
      meta: {
        control: 'text',
        description: 'Secondary label rendered to the right of the title.',
      },
      withAction: {
        control: 'boolean',
        description: 'Render a demo action button in the header.',
      },
    },
    args: {
      title: 'Card title',
      meta: '',
      withAction: false,
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Card
    title={args.title as string | undefined}
    meta={args.meta as string | undefined}
  >
    {#snippet action()}
      {#if args.withAction}
        <Button variant="ghost" onclick={() => {}}>action</Button>
      {/if}
    {/snippet}
    <p style="margin:0;font-size:13px">Card body content goes here.</p>
  </Card>
{/snippet}

<!-- Minimal card: no header at all -->
<Story name="NoHeader" args={{ title: undefined, meta: '', withAction: false }} />

<!-- Header with title only -->
<Story name="TitleOnly" args={{ title: 'Services', meta: '', withAction: false }} />

<!-- Header with title + meta label -->
<Story name="TitleAndMeta" args={{ title: 'Services', meta: '6 of 7 healthy', withAction: false }} />

<!-- Header with title, meta, and an action button -->
<Story name="WithAction" args={{ title: 'Log stream', meta: 'live', withAction: true }} />

<!-- Realistic: a list of status badges inside the body -->
<Story name="BadgeList" args={{ title: 'Environments', meta: '3 active', withAction: false }}>
  {#snippet children()}
    <Card title="Environments" meta="3 active">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <Badge tone="up">production</Badge>
        <Badge tone="info">staging</Badge>
        <Badge tone="deg">preview</Badge>
        <Badge tone="down">local</Badge>
      </div>
    </Card>
  {/snippet}
</Story>

<!-- Realistic: a simple data list inside the body -->
<Story name="DataList" args={{ title: 'Queue', meta: '4 items', withAction: false }}>
  {#snippet children()}
    <Card title="Queue" meta="4 items">
      <div style="display:flex;flex-direction:column;gap:4px">
        {#each ['Dune: Part Two', 'Oppenheimer', 'Past Lives', 'Poor Things'] as film}
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--ss-line);font-size:12px">
            <span>{film}</span>
            <Badge tone="info">to_watch</Badge>
          </div>
        {/each}
      </div>
    </Card>
  {/snippet}
</Story>
