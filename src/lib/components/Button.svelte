<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (e: MouseEvent) => void
    children: Snippet
  }
  let { variant = 'secondary', type = 'button', disabled = false, onclick, children }: Props = $props()
</script>

<button class="ss-btn {variant}" {type} {disabled} {onclick}>
  {@render children()}
</button>

<style lang="scss">
  .ss-btn {
    font-family: var(--ss-font-body); font-size: var(--ss-control-font); line-height: 1; font-weight: 500;
    padding: var(--ss-control-py) var(--ss-control-px);
    border: 1px solid var(--ss-line);
    background: transparent; color: var(--ss-fg);
    cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all var(--ss-dur-fast) var(--ss-ease);

    &:hover { background: rgba(255,255,255,.04); border-color: var(--ss-line-strong); }
    &.primary {
      background: var(--ss-primary); color: var(--ss-fg-on-primary); border-color: var(--ss-primary); font-weight: 600;
      &:hover { background: #7df089; box-shadow: var(--ss-shadow-glow); }
    }
    &.ghost {
      border-color: transparent; color: var(--ss-fg-muted); padding: var(--ss-control-py) var(--ss-gap-sm);
      &:hover { color: var(--ss-fg); background: rgba(255,255,255,.04); border-color: transparent; }
    }
  }
</style>
