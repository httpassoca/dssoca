<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import FileDrop from '$lib/components/FileDrop.svelte'

  const sample = [new File(['{}'], 'data.json', { type: 'application/json' })]

  const { Story } = defineMeta({
    title: 'Components/FileDrop',
    component: FileDrop,
    tags: ['autodocs'],
    argTypes: {
      label: { control: 'text', description: "Field label, part of the zone's accessible name." },
      accept: { control: 'text', description: "Native accept filter (e.g. 'application/json')." },
      multiple: { control: 'boolean', description: 'Allow more than one file.' },
      disabled: { control: 'boolean', description: 'Disable pointer + keyboard activation.' },
      hint: { control: 'text', description: 'Helper text under the zone.' },
      error: { control: 'text', description: 'Error text, announced via role="alert".' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
    },
    args: {
      label: 'Attachments',
    },
  })
</script>

<Story name="Default" />

<Story name="Accept JSON" args={{ label: 'Config file', accept: 'application/json,.json' }} />

<Story name="Multiple" args={{ label: 'Logs', multiple: true, hint: 'Drop one or more files' }} />

<Story name="With selected file" args={{ label: 'Attachments', files: sample }} />

<Story name="Error" args={{ label: 'Avatar', error: 'File exceeds the 2 MB limit' }} />

<Story name="Disabled" args={{ label: 'Attachments', disabled: true }} />

<Story name="Large" args={{ label: 'Attachments', size: 'lg' }} />
