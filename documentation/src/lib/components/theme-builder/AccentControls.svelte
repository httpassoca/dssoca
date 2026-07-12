<script lang="ts">
  import { Button, SegmentedControl, Switch } from 'dssoca'
  import HexField from './HexField.svelte'
  import { PRESETS, type Preset } from '$lib/theme-builder/presets'

  interface Props {
    /** Committed accent seed (#rrggbb). */
    accent: string
    /** ANSI-hue lean toward the seed, as a 0–100 percentage. */
    tint: number
    /** Neutral tint strength, as a 0–100 percentage (maps to neutralChroma 0..1). */
    neutral: number
    previewTheme: 'dark' | 'light'
    /** "Try it on this page" — applies the palette to the whole docs site. */
    applyToPage: boolean
    /** Preset click — seed presets reset overrides, terminal presets load theirs. */
    onPreset: (preset: Preset) => void
  }
  let {
    accent = $bindable(),
    tint = $bindable(),
    neutral = $bindable(),
    previewTheme = $bindable(),
    applyToPage = $bindable(),
    onPreset,
  }: Props = $props()

  const themeOptions = [
    { value: 'dark', label: 'dark' },
    { value: 'light', label: 'light' },
  ]
</script>

<div class="controls">
  <div class="row accent-row">
    <label class="picker">
      <span class="picker-label">accent</span>
      <input
        type="color"
        value={accent}
        oninput={(e) => (accent = e.currentTarget.value)}
        aria-label="Accent color picker"
      />
    </label>
    <div class="hex">
      <HexField value={accent} onCommit={(hex) => (accent = hex)} />
    </div>
    <div class="presets" role="group" aria-label="Theme presets">
      {#each PRESETS as preset (preset.name)}
        <Button variant="ghost" onclick={() => onPreset(preset)}>
          <span class="dot" style="background: {preset.accent}" aria-hidden="true"></span>
          {preset.name}
        </Button>
      {/each}
    </div>
  </div>

  <div class="row sliders">
    <label class="slider">
      <span class="slider-head">
        <span>tint</span>
        <code>{tint}%</code>
      </span>
      <input type="range" min="0" max="100" step="1" bind:value={tint} aria-label="Tint" />
      <span class="hint">0% = classic ANSI hues, 100% = fully monochrome</span>
    </label>
    <label class="slider">
      <span class="slider-head">
        <span>neutral tint</span>
        <code>{neutral}%</code>
      </span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        bind:value={neutral}
        aria-label="Neutral tint"
      />
      <span class="hint">how strongly the bg/fg neutrals carry the accent hue</span>
    </label>
  </div>

  <div class="row footer">
    <SegmentedControl
      label="Preview theme"
      options={themeOptions}
      value={previewTheme}
      onChange={(v) => (previewTheme = v as 'dark' | 'light')}
    />
    <Switch label="Try it on this page" bind:checked={applyToPage} />
  </div>
</div>

<style lang="scss">
  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--ss-gap);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    padding: var(--ss-s-4);
  }
  .row {
    display: flex;
    align-items: flex-start;
    gap: var(--ss-gap);
    flex-wrap: wrap;
  }
  .accent-row {
    align-items: center;
  }
  .picker {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-s-2);
    cursor: pointer;

    .picker-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ss-fg-muted);
    }
    input[type='color'] {
      appearance: none;
      -webkit-appearance: none;
      width: calc(var(--ss-icon) * 2);
      height: var(--ss-icon);
      padding: 0;
      border: 1px solid var(--ss-line-strong);
      border-radius: 0; // house rule
      background: transparent;
      cursor: pointer;

      &::-webkit-color-swatch-wrapper {
        padding: 2px;
      }
      // Vendor pseudos must stay in separate rules — a combined selector list
      // would be invalid in both engines and dropped entirely.
      &::-webkit-color-swatch {
        border: none;
        border-radius: 0;
      }
      &::-moz-color-swatch {
        border: none;
        border-radius: 0;
      }
    }
  }
  .hex {
    max-width: 12rem;
  }
  .presets {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-s-1);
    flex-wrap: wrap;
    margin-left: auto;
  }
  .dot {
    display: inline-block;
    width: var(--ss-badge-dot);
    height: var(--ss-badge-dot);
    border: 1px solid var(--ss-line-strong);
    flex: none;
    // The dot and the label text are siblings inside Button's .label span
    // (which has no gap of its own) — space them apart here.
    margin-inline-end: var(--ss-s-1);
  }
  .sliders {
    gap: var(--ss-block-gap);
  }
  .slider {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-1);
    flex: 1 1 14rem;
    min-width: 12rem;

    .slider-head {
      display: flex;
      justify-content: space-between;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ss-fg-muted);

      code {
        color: var(--ss-fg);
      }
    }
    .hint {
      font-family: var(--ss-font-body);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
    }

    input[type='range'] {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      height: var(--ss-s-4);
      margin: 0;
      background: transparent;
      cursor: pointer;

      &::-webkit-slider-runnable-track {
        height: 4px;
        background: var(--ss-line-strong);
      }
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: var(--ss-s-3);
        height: var(--ss-s-4);
        margin-top: calc((4px - var(--ss-s-4)) / 2);
        border: 1px solid var(--ss-line-strong);
        border-radius: 0; // house rule
        background: var(--ss-primary);
      }
      &::-moz-range-track {
        height: 4px;
        background: var(--ss-line-strong);
      }
      &::-moz-range-thumb {
        width: var(--ss-s-3);
        height: var(--ss-s-4);
        border: 1px solid var(--ss-line-strong);
        border-radius: 0; // house rule
        background: var(--ss-primary);
      }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: 2px;
      }
    }
  }
  .footer {
    align-items: center;
    justify-content: space-between;
  }
</style>
