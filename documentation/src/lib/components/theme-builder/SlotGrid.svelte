<script lang="ts">
  import { Badge } from 'dssoca'
  import { contrastHex } from '../../../../../scripts/lib/palette.mjs'
  import { SLOTS, type PaletteSlot, type ThemePalette } from '$lib/theme-builder/types'

  interface Props {
    /** Resolved slot values for the previewed theme. */
    theme: ThemePalette
    /** Manual overrides active on the previewed theme (marks "edited" cells). */
    overrides: Partial<Record<PaletteSlot, string>>
    selected: PaletteSlot | null
    onSelect: (slot: PaletteSlot) => void
  }
  let { theme, overrides, selected, onSelect }: Props = $props()

  const WIDE: PaletteSlot[] = ['bg', 'fg', 'accent']
  const ANSI = SLOTS.filter((s) => !WIDE.includes(s))

  // Cell text must read on the cell's own color — pick whichever of the
  // palette's fg/bg contrasts better against that background.
  function textOn(hex: string): string {
    return contrastHex(hex, theme.fg) >= contrastHex(hex, theme.bg) ? theme.fg : theme.bg
  }
</script>

{#snippet cell(slot: PaletteSlot)}
  <button
    type="button"
    class="cell"
    class:selected={selected === slot}
    style="background: {theme[slot]}; color: {textOn(theme[slot])}"
    onclick={() => onSelect(slot)}
    aria-pressed={selected === slot}
  >
    <span class="name">{slot}</span>
    <span class="value">
      <code>{theme[slot]}</code>
      {#if overrides[slot] !== undefined}
        <Badge tone="caution" size="sm">edited</Badge>
      {/if}
    </span>
  </button>
{/snippet}

<div class="grid" role="group" aria-label="Palette slots">
  <div class="primaries">
    {#each WIDE as slot (slot)}
      {@render cell(slot)}
    {/each}
  </div>
  <div class="ansi">
    {#each ANSI as slot (slot)}
      {@render cell(slot)}
    {/each}
  </div>
</div>

<style lang="scss">
  .grid {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
  }
  .primaries {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ss-s-2);
  }
  .ansi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--ss-s-2);
  }
  .cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ss-s-1);
    padding: var(--ss-s-2) var(--ss-s-3);
    min-height: calc(var(--ss-icon) * 2.5);
    border: 1px solid var(--ss-line);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: border-color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      border-color: var(--ss-primary);
    }
    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 1px;
    }
    &.selected {
      border-color: var(--ss-primary);
      outline: 1px solid var(--ss-primary);
      outline-offset: 0;
    }
  }
  .name {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    letter-spacing: 0.04em;
  }
  .value {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-s-1);

    code {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      opacity: 0.85;
    }
  }
  @media (max-width: 720px) {
    .primaries {
      grid-template-columns: 1fr;
    }
    .ansi {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
