<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Badge from '$lib/components/Badge.svelte';

  const { Story } = defineMeta({
    title: 'Components/Badge',
    component: Badge,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story can
    // drive the badge's text via the `label` arg (Badge takes its label as a
    // child snippet, not a prop).
    render: template,
    argTypes: {
      tone: {
        control: { type: 'inline-radio' },
        options: ['up', 'deg', 'down', 'info'],
        description: 'Semantic tone of the badge; also controls the dot color.',
      },
      label: {
        control: 'text',
        description: 'Text content (rendered as the badge child).',
      },
    },
    args: {
      tone: 'info',
      label: 'to_watch',
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Badge tone={args.tone as 'up' | 'deg' | 'down' | 'info'}>
    {args.label}
  </Badge>
{/snippet}

<Story name="Up" args={{ tone: 'up', label: 'up' }} />

<Story name="Degraded" args={{ tone: 'deg', label: 'degraded' }} />

<Story name="Down" args={{ tone: 'down', label: 'down' }} />

<Story name="Info" args={{ tone: 'info', label: 'to_watch' }} />
