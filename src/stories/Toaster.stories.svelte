<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Toaster from '$lib/components/Toaster.svelte';
  import { toast } from '$lib/toast.svelte.js';

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
    },
    args: {
      message: 'Hello from Toaster',
      kind: 'info',
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Toaster />
  <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
    <button
      class="ss-btn ss-btn--primary"
      type="button"
      onclick={() => toast.success(args.message as string ?? 'Success!')}
    >
      Fire success
    </button>
    <button
      class="ss-btn ss-btn--secondary"
      type="button"
      onclick={() => toast.error(args.message as string ?? 'Error!')}
    >
      Fire error
    </button>
    <button
      class="ss-btn ss-btn--ghost"
      type="button"
      onclick={() => toast.info(args.message as string ?? 'Info!')}
    >
      Fire info
    </button>
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Success" args={{ kind: 'success', message: 'Operation completed.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <button
      class="ss-btn ss-btn--primary"
      type="button"
      onclick={() => toast.success(args.message as string)}
    >
      Fire success toast
    </button>
  {/snippet}
</Story>

<Story name="Error" args={{ kind: 'error', message: 'Something went wrong.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <button
      class="ss-btn ss-btn--secondary"
      type="button"
      onclick={() => toast.error(args.message as string)}
    >
      Fire error toast
    </button>
  {/snippet}
</Story>

<Story name="Info" args={{ kind: 'info', message: 'Here is some information.' }}>
  {#snippet template(args: Record<string, unknown>)}
    <Toaster />
    <button
      class="ss-btn ss-btn--ghost"
      type="button"
      onclick={() => toast.info(args.message as string)}
    >
      Fire info toast
    </button>
  {/snippet}
</Story>
