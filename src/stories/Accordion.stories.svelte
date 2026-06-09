<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Accordion, { type AccordionItem } from '$lib/components/Accordion.svelte';

  const ITEMS: AccordionItem[] = [
    { id: 'shipping', label: 'Shipping & delivery' },
    { id: 'returns', label: 'Returns', hint: '30 days' },
    { id: 'warranty', label: 'Warranty' },
    { id: 'legacy', label: 'Discontinued models', disabled: true },
  ];

  const COPY: Record<string, string> = {
    shipping: 'Orders ship within 2 business days. Tracking is emailed on dispatch.',
    returns: 'Unused items can be returned within 30 days for a full refund.',
    warranty: 'All hardware carries a 2-year limited warranty against defects.',
    legacy: 'Support for discontinued models has ended.',
  };

  const { Story } = defineMeta({
    title: 'Components/Accordion',
    component: Accordion,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      multiple: {
        control: 'boolean',
        description: 'Allow several sections open at once (default: single-open).',
      },
      headingLevel: {
        control: { type: 'inline-radio' },
        options: [2, 3, 4],
        description: 'Heading level wrapping each header button.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: [undefined, 'sm', 'md', 'lg'],
        description: 'Per-instance size; inherits the global size when unset.',
      },
    },
    args: {
      multiple: false,
      headingLevel: 3,
      size: undefined,
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <div style="max-width: 480px;">
    <Accordion
      items={ITEMS}
      multiple={args.multiple as boolean}
      headingLevel={args.headingLevel as 2 | 3 | 4}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      defaultValue={args.multiple ? ['shipping'] : 'shipping'}
    >
      {#snippet panel(item)}
        <p style="margin: 0;">{COPY[item.id]}</p>
      {/snippet}
    </Accordion>
  </div>
{/snippet}

<Story name="Default" />

<Story name="Multiple" args={{ multiple: true }} />

<Story name="Small" args={{ size: 'sm' }} />

<Story name="Large" args={{ size: 'lg' }} />
