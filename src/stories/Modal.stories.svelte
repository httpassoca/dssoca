<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Modal from '$lib/components/Modal.svelte'
  import Button from '$lib/components/Button.svelte'

  const { Story } = defineMeta({
    title: 'Components/Modal',
    component: Modal,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      title: {
        control: 'text',
        description: 'Header title; wires aria-labelledby. Omit and pass aria-label instead.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; controls the dialog max-width.',
      },
      closeOnBackdrop: {
        control: 'boolean',
        description: 'Clicking outside the panel closes the modal.',
      },
      closeOnEsc: {
        control: 'boolean',
        description: 'Esc closes the modal (native dialog behaviour).',
      },
      danger: {
        control: 'boolean',
        description: 'Destructive styling hint (tints the title).',
      },
      fullscreen: {
        control: 'boolean',
        description:
          'Fill the viewport instead of a centred capped panel; the size axis goes inert and the backdrop is no longer clickable.',
      },
    },
    args: {
      title: 'Confirm action',
      closeOnBackdrop: true,
      closeOnEsc: true,
      danger: false,
      fullscreen: false,
    },
  })

  // A Button toggles `open`; the bindable prop syncs the native <dialog> via
  // showModal()/close(). Module-scoped $state keeps it reactive for the
  // shared `render: template` (mirrors the Menu/Accordion story pattern).
  let open = $state(false)
</script>

{#snippet template(args: Record<string, unknown>)}
  <Button onclick={() => (open = true)}>Open modal</Button>
  <Modal
    bind:open
    title={args.title as string | undefined}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    closeOnBackdrop={args.closeOnBackdrop as boolean}
    closeOnEsc={args.closeOnEsc as boolean}
    danger={args.danger as boolean}
    fullscreen={args.fullscreen as boolean}
    aria-label={(args['aria-label'] as string) ?? undefined}
  >
    {#snippet footer()}
      <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={() => (open = false)}>Confirm</Button>
    {/snippet}
    <p>
      This is the modal body. It can contain any content — text, forms, or other components. The
      native &lt;dialog&gt; gives us a focus trap, Esc-to-close and an inert backdrop.
    </p>
    {#if args.fullscreen}
      <!-- Enough copy to prove the body (not the page) owns the scroll while the
           header and footer stay pinned to the viewport edges. -->
      {#each Array(14) as _, i (i)}
        <p>
          Fullscreen row {i + 1}: the panel fills the viewport, the size axis is inert, and there is
          no backdrop left to click — the close button and Esc are the exits.
        </p>
      {/each}
    {/if}
  </Modal>
{/snippet}

<Story name="Default" />

<!-- Dedicated footer-actions story (DS-0123): the footer snippet holds a
     trailing cancel→confirm action pair (dialog convention — the affirmative
     button trails the dismissive one). Cancel uses the ghost Button variant,
     Confirm the default/primary. The `title` wires aria-labelledby so the
     dialog stays a11y-clean. -->
<Story name="FooterActions" args={{ title: 'Publish release' }} />

<Story name="No title" args={{ title: undefined, 'aria-label': 'Untitled dialog' }} />

<Story name="Danger" args={{ title: 'Delete project', danger: true }} />

<Story name="Large" args={{ title: 'Large modal', size: 'lg' }} />

<!-- Fullscreen variant (DS-0145): fills the viewport, header/footer pinned, body scrolls -->
<Story name="Fullscreen" args={{ title: 'Log stream', fullscreen: true }} />
