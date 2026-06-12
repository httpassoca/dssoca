<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Toaster from '$lib/components/Toaster.svelte'
  import Button from '$lib/components/Button.svelte'
  import { toast } from '$lib/toast.svelte.js'

  const { Story } = defineMeta({
    title: 'Components/Toaster',
    component: Toaster,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      message: {
        control: 'text',
        description: 'Message text passed to the toast API.',
      },
      kind: {
        control: { type: 'inline-radio' },
        options: ['success', 'error', 'info'],
        description: 'Toast kind — controls accent colour and icon.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      position: {
        control: { type: 'select' },
        options: [
          'top-right',
          'top-left',
          'top-center',
          'bottom-right',
          'bottom-left',
          'bottom-center',
        ],
        description: 'Where the toast stack anchors on screen.',
      },
    },
    args: {
      message: 'Hello from Toaster',
      kind: 'info',
      position: 'top-right',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Toaster
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    position={args.position as
      | 'top-right'
      | 'top-left'
      | 'top-center'
      | 'bottom-right'
      | 'bottom-left'
      | 'bottom-center'}
  />
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <Button variant="primary" onclick={() => toast.success((args.message as string) ?? 'Success!')}>
      Fire success
    </Button>
    <Button variant="secondary" onclick={() => toast.error((args.message as string) ?? 'Error!')}>
      Fire error
    </Button>
    <Button variant="ghost" onclick={() => toast.info((args.message as string) ?? 'Info!')}>
      Fire info
    </Button>
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Success" args={{ kind: 'success', message: 'Operation completed.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <Button variant="primary" onclick={() => toast.success(args.message as string)}>
      Fire success toast
    </Button>
  {/snippet}
</Story>

<Story name="Error" args={{ kind: 'error', message: 'Something went wrong.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <Button variant="secondary" onclick={() => toast.error(args.message as string)}>
      Fire error toast
    </Button>
  {/snippet}
</Story>

<Story name="Info" args={{ kind: 'info', message: 'Here is some information.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <Button variant="ghost" onclick={() => toast.info(args.message as string)}>
      Fire info toast
    </Button>
  {/snippet}
</Story>
