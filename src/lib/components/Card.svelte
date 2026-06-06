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

<div class="ss-panel">
  {#if title}
    <div class="head">
      <div class="title">{title}</div>
      <div style="display:flex;gap:12px;align-items:center">
        {#if meta}<div class="meta">{meta}</div>{/if}
        {#if action}{@render action()}{/if}
      </div>
    </div>
  {/if}
  <div class="body">
    {@render children()}
  </div>
</div>

<style lang="scss">
  .ss-panel { border: 1px solid var(--ss-line); background: var(--ss-bg-elev); }
  .head {
    padding: var(--ss-panel-head-py) var(--ss-panel-head-px);
    border-bottom: 1px solid var(--ss-line);
    display: flex; align-items: center; justify-content: space-between;
    font-family: var(--ss-font-mono); font-size: var(--ss-ui-sm);
    color: var(--ss-fg-faint); text-transform: uppercase; letter-spacing: 0.06em;

    .title { color: var(--ss-fg); letter-spacing: 0.06em; }
    .meta  { color: var(--ss-fg-faint); text-transform: lowercase; letter-spacing: 0.04em; }
  }
  .body { padding: var(--ss-panel-body-py) var(--ss-panel-body-px); }
</style>
