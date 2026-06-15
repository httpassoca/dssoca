<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Switch from '$lib/components/Switch.svelte'

  const { Story } = defineMeta({
    title: 'Components/Switch',
    component: Switch,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // role="switch" + accessible name — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      checked: {
        control: 'boolean',
        description: 'On/off state (bindable).',
      },
      label: {
        control: 'text',
        description: 'Visible label; becomes the accessible name.',
      },
      disabled: {
        control: 'boolean',
        description: 'Disable the switch (inert + non-toggling).',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onchange: {
        action: 'onchange',
        description: 'Fired after `checked` flips, with the new value.',
      },
    },
    args: {
      checked: false,
      label: 'Notifications',
      disabled: false,
      onchange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Switch
    checked={args.checked as boolean}
    label={args.label as string}
    disabled={args.disabled as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onchange={args.onchange as (checked: boolean) => void}
  />
{/snippet}

<Story name="Default" args={{ checked: false, label: 'Notifications' }} />

<Story name="Checked" args={{ checked: true, label: 'Notifications' }} />

<Story name="With label" args={{ checked: false, label: 'Enable dark mode' }} />

<Story name="Disabled" args={{ checked: false, label: 'Notifications', disabled: true }} />

<Story name="Large" args={{ checked: true, label: 'Notifications', size: 'lg' }} />
