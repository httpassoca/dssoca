<script lang="ts">
  import Accordion, {
    type AccordionItem,
    type AccordionValue,
  } from '$lib/components/Accordion.svelte'

  interface Props {
    items?: AccordionItem[]
    multiple?: boolean
    value?: AccordionValue
    defaultValue?: AccordionValue
    onChange?: (v: AccordionValue) => void
    size?: 'sm' | 'md' | 'lg'
    overflow?: 'truncate' | 'wrap'
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
    idBase?: string
  }

  const DEFAULT_ITEMS: AccordionItem[] = [
    { id: 'one', label: 'Section one' },
    { id: 'two', label: 'Section two', hint: 'optional' },
    { id: 'three', label: 'Section three', disabled: true },
  ]

  let {
    items = DEFAULT_ITEMS,
    multiple,
    value,
    defaultValue,
    onChange,
    size,
    overflow,
    headingLevel,
    idBase,
  }: Props = $props()
</script>

<Accordion
  {items}
  {multiple}
  {value}
  {defaultValue}
  {onChange}
  {size}
  {overflow}
  {headingLevel}
  {idBase}
>
  {#snippet panel(item)}
    <p class="panel-body" data-for={item.id}>Body for {item.label}</p>
  {/snippet}
</Accordion>
