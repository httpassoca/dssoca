<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '$lib/components/Button.svelte';

  const { Story } = defineMeta({
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story can
    // drive the button's text via the `label` arg (Button takes its label as a
    // child snippet, not a prop).
    render: template,
    argTypes: {
      variant: {
        control: { type: 'inline-radio' },
        options: ['primary', 'secondary', 'ghost'],
        description: 'Visual emphasis of the button.',
      },
      type: {
        control: { type: 'inline-radio' },
        options: ['button', 'submit', 'reset'],
        description: 'Native button type.',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the button non-interactive.',
      },
      label: {
        control: 'text',
        description: 'Text content (rendered as the button child).',
      },
    },
    args: {
      label: 'Button',
      variant: 'secondary',
      type: 'button',
      disabled: false,
      onclick: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Button
    variant={args.variant as 'primary' | 'secondary' | 'ghost'}
    type={args.type as 'button' | 'submit' | 'reset'}
    disabled={args.disabled as boolean}
    onclick={args.onclick as (e: MouseEvent) => void}
  >
    {args.label}
  </Button>
{/snippet}

<Story name="Primary" args={{ variant: 'primary', label: 'Deploy' }} />

<Story name="Secondary" args={{ variant: 'secondary', label: 'Cancel' }} />

<Story name="Ghost" args={{ variant: 'ghost', label: 'Dismiss' }} />

<Story name="Disabled" args={{ variant: 'primary', label: 'Deploy', disabled: true }} />
