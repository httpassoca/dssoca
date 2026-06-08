<script lang="ts">
  import Card from '$lib/components/Card.svelte'

  interface Props {
    title?: string
    meta?: string
    description?: string
    withAction?: boolean
    withFooter?: boolean
    withMedia?: boolean
    withTitleSnippet?: boolean
    href?: string
    onclick?: (e: MouseEvent | KeyboardEvent) => void
    variant?: 'outlined' | 'elevated'
    titleLevel?: number
    body?: string
  }
  let {
    title,
    meta,
    description,
    withAction = false,
    withFooter = false,
    withMedia = false,
    withTitleSnippet = false,
    href,
    onclick,
    variant,
    titleLevel,
    body = 'body content',
  }: Props = $props()
</script>

<Card
  title={withTitleSnippet ? titleSnippet : title}
  {meta}
  {description}
  {href}
  {onclick}
  {variant}
  {titleLevel}
  media={withMedia ? media : undefined}
  action={withAction ? action : undefined}
  footer={withFooter ? footer : undefined}
>
  {body}
</Card>

{#snippet titleSnippet()}
  <span class="title-snippet">Live <span class="badge">●</span></span>
{/snippet}

{#snippet media()}
  <img class="card-media" src="data:," alt="" />
{/snippet}

{#snippet action()}
  <button class="card-action">act</button>
{/snippet}

{#snippet footer()}
  <span class="card-footer-content">footer text</span>
{/snippet}
