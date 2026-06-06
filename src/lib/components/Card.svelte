<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    title?: string
    meta?: string
    action?: Snippet
    children: Snippet
  }
  let { title, meta, action, children }: Props = $props()
</script>

<div class="hub-panel">
  {#if title}
    <div class="hub-panel-head">
      <div class="title">{title}</div>
      <div style="display:flex;gap:12px;align-items:center">
        {#if meta}<div class="meta">{meta}</div>{/if}
        {#if action}{@render action()}{/if}
      </div>
    </div>
  {/if}
  <div class="hub-panel-body">
    {@render children()}
  </div>
</div>
