<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // ShortcutsHelp (DS-0138). The GitHub/Slack/Linear "?" discovery overlay.
  // Composes Modal — the native <dialog> hands us the focus trap, Esc-close,
  // backdrop and focus return (SC 2.1.2 / 2.4.3) — and renders the LIVE
  // registry state: groups, labels, effective bindings after remaps, and
  // disabled shortcuts struck through with a visible "(off)" (SC 2.1.4 truth,
  // never hidden).
  //
  // Its own hotkey goes through the registry like any consumer shortcut
  // (id `ss:shortcuts-help`), so it lists itself and is disable-able and
  // remappable. The default `'?, mod+/'` keeps discovery alive when the
  // `characterKeys` kill switch is off ('?' dies, mod+/ survives) and under
  // screen-reader browse mode.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import Modal from './Modal.svelte'
  import Kbd from './Kbd.svelte'
  import Button from './Button.svelte'
  import Switch from './Switch.svelte'
  import EmptyState from './EmptyState.svelte'
  import {
    shortcuts,
    comboFromEvent,
    isReservedCombo,
    formatShortcut,
    type ShortcutInfo,
  } from '../shortcuts.svelte.js'

  interface Props {
    /** Whether the overlay is shown. Bindable — control it, or let the hotkey manage it. */
    open?: boolean
    /** Dialog title (wires the dialog's accessible name). @default 'Keyboard shortcuts' */
    title?: string
    /**
     * Combo(s) that open the overlay, self-registered through the registry
     * (id `ss:shortcuts-help`, group "General") — it appears in its own list
     * and is itself disable-able/remappable. `null` registers nothing
     * (wire your own visible trigger). @default '?, mod+/'
     */
    hotkey?: string | null
    /**
     * Explicit section order (group names). Unlisted groups follow in
     * registration order; by default "General" (also the bucket for
     * ungrouped shortcuts) comes last.
     */
    groupOrder?: string[]
    /**
     * Built-in WCAG 2.1.4 settings UI: every row gains an enable Switch
     * (`setEnabled`), a Change button that records the next keydown as the
     * new binding (`remap`; Esc cancels), and a Reset once remapped
     * (`remap(id, null)`); a footer adds the global single-key kill switch
     * (`characterKeys`) and Restore defaults (`resetOverrides`). Persistence
     * stays app policy — see `getOverrides`/`applyOverrides`. @default false
     */
    editable?: boolean
    /** Extra content rendered below the shortcut list. */
    children?: Snippet
  }

  let {
    open = $bindable(false),
    title = 'Keyboard shortcuts',
    hotkey = '?, mod+/',
    groupOrder,
    editable = false,
    children,
  }: Props = $props()

  const FALLBACK_GROUP = 'General'

  // Self-registration. `add()` returns the disposer, which doubles as the
  // effect's cleanup: unmount unregisters, a `hotkey` change re-registers.
  // Effects never run on the server, so SSR stays registration-free.
  $effect(() => {
    if (hotkey === null) return
    return shortcuts.add({
      id: 'ss:shortcuts-help',
      label: 'Show keyboard shortcuts',
      group: FALLBACK_GROUP,
      keys: hotkey,
      onPress: () => {
        open = true
      },
    })
  })

  interface Group {
    name: string
    items: ShortcutInfo[]
  }

  // Live grouping of the registry: buckets in first-appearance order with
  // "General" forced last; an explicit `groupOrder` lists its named groups
  // first and the rest keep the default order.
  const groups: Group[] = $derived.by(() => {
    const buckets: Group[] = []
    for (const item of shortcuts.items) {
      const name = item.group ?? FALLBACK_GROUP
      const bucket = buckets.find((g) => g.name === name)
      if (bucket) bucket.items.push(item)
      else buckets.push({ name, items: [item] })
    }
    let ordered = buckets.filter((g) => g.name !== FALLBACK_GROUP)
    const general = buckets.find((g) => g.name === FALLBACK_GROUP)
    if (general) ordered.push(general)
    if (groupOrder?.length) {
      const explicit = groupOrder
        .map((n) => ordered.find((g) => g.name === n))
        .filter((g): g is Group => g !== undefined)
      ordered = [...explicit, ...ordered.filter((g) => !explicit.includes(g))]
    }
    return ordered
  })

  // ── Editable mode (DS-0141) — remap recorder + live announcements ────────
  // One shortcut records at a time; `status` feeds the visible role="status"
  // line, so prompts, results and rejections are both shown and announced.
  let recordingId = $state<string | null>(null)
  let status = $state('')

  // Announcement-friendly words ("Control+Shift+S"), not glyphs.
  const spoken = (keys: string) => formatShortcut(keys, { format: 'label' })

  function startRecording(item: ShortcutInfo) {
    recordingId = item.id
    status = `Press the new shortcut for "${item.label}" — Escape cancels.`
  }

  function cancelRecording() {
    recordingId = null
    status = 'Shortcut change cancelled.'
  }

  function resetRow(item: ShortcutInfo) {
    shortcuts.remap(item.id, null)
    status = `"${item.label}" restored to ${spoken(item.defaultKeys)}.`
  }

  function restoreDefaults() {
    recordingId = null
    shortcuts.resetOverrides()
    status = 'All shortcuts restored to their defaults.'
  }

  // While recording, a window-capture listener owns every keydown: it runs
  // before anything else for keys pressed inside the dialog, and its
  // preventDefault doubles as registry suppression (the matcher skips
  // defaultPrevented events; the open modal already suppresses globals —
  // SC 2.1.2). Modifier-only presses are a chord in progress; bare Escape
  // cancels; everything else is validated through the registry parser via
  // `remap` — reserved browser combos and unparseable keys are rejected with
  // feedback and recording stays live for another try.
  $effect(() => {
    if (recordingId === null) return
    const id = recordingId
    const onKeydown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const combo = comboFromEvent(event)
      if (combo === null) return
      if (combo === 'escape') {
        cancelRecording()
        return
      }
      const label = shortcuts.items.find((i) => i.id === id)?.label ?? id
      let reserved: boolean
      try {
        reserved = isReservedCombo(combo)
      } catch {
        status = 'That key cannot be used — try another combination.'
        return
      }
      if (reserved) {
        status = `${spoken(combo)} is reserved by the browser — try another combination.`
        return
      }
      shortcuts.remap(id, combo)
      recordingId = null
      status = `"${label}" is now ${spoken(combo)}.`
    }
    window.addEventListener('keydown', onKeydown, true)
    return () => window.removeEventListener('keydown', onKeydown, true)
  })

  // Closing the dialog (Esc, backdrop, trigger) abandons any recording and
  // clears the status line so a reopen starts clean.
  $effect(() => {
    if (open) return
    recordingId = null
    status = ''
  })
</script>

<Modal bind:open {title}>
  <div class="ss-shortcuts-help">
    {#if groups.length === 0}
      <EmptyState
        compact
        icon="⌨"
        headingLevel={3}
        title="No shortcuts registered"
        message="Shortcuts added through the dssoca registry will show up here."
      />
    {:else}
      {#each groups as group (group.name)}
        <section class="group">
          <h3 class="gname">{group.name}</h3>
          <dl class="rows">
            <!-- Key by position too: duplicate ids are a dev warning in the
                 registry, not a render crash here. -->
            {#each group.items as item, i (`${item.id}:${i}`)}
              <div class="row" class:off={!item.enabled} class:recording={recordingId === item.id}>
                <dt class="label">
                  <span class="txt">{item.label}</span>
                  {#if !item.enabled}<span class="off-tag">(off)</span>{/if}
                </dt>
                <dd class="keys">
                  {#if recordingId === item.id}
                    <span class="prompt">Press keys…</span>
                  {:else}
                    <Kbd keys={item.keys} />
                  {/if}
                </dd>
                {#if editable}
                  <dd class="controls">
                    {#if item.keys !== item.defaultKeys}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Reset the shortcut for "${item.label}" to its default`}
                        onclick={() => resetRow(item)}>Reset</Button
                      >
                    {/if}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={recordingId === item.id
                        ? `Recording a new shortcut for "${item.label}" — press keys, Escape cancels`
                        : `Change the shortcut for "${item.label}"`}
                      onclick={() =>
                        recordingId === item.id ? cancelRecording() : startRecording(item)}
                    >
                      {recordingId === item.id ? 'Cancel' : 'Change'}
                    </Button>
                    <Switch
                      size="sm"
                      labelHidden
                      label={`Enable the "${item.label}" shortcut`}
                      checked={item.enabled}
                      onchange={(on) => shortcuts.setEnabled(item.id, on)}
                    />
                  </dd>
                {/if}
              </div>
            {/each}
          </dl>
        </section>
      {/each}
    {/if}
    {#if editable}
      <!-- WCAG 2.1.4 global remedies: the character-key kill switch and a
           one-click way back. Persistence stays app policy (getOverrides). -->
      <div class="globals">
        <Switch
          size="sm"
          label="Single-key shortcuts"
          checked={shortcuts.characterKeys}
          onchange={(on) => (shortcuts.characterKeys = on)}
        />
        <Button variant="ghost" size="sm" onclick={restoreDefaults}>Restore defaults</Button>
      </div>
      <!-- Always-rendered live region: recording prompts, results and
           rejections are announced as well as shown. -->
      <p class="status" role="status">{status}</p>
    {/if}
    {#if children}
      <div class="extra">{@render children()}</div>
    {/if}
  </div>
</Modal>

<style lang="scss">
  .ss-shortcuts-help {
    display: flex;
    flex-direction: column;
    gap: var(--ss-gap-sm);
    font-size: var(--ss-size-sm);

    .group {
      min-width: 0;
    }

    // Group headings follow the panel-head convention (Card/panel heads):
    // mono, uppercase, faint.
    .gname {
      margin: 0;
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      font-weight: 400;
      color: var(--ss-fg-faint);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .rows {
      margin: 0;
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ss-gap-sm);
      padding: var(--ss-s-2) 0;
      border-bottom: 1px solid var(--ss-line);

      &:last-child {
        border-bottom: 0;
      }
    }

    .label {
      margin: 0;
      min-width: 0;
      color: var(--ss-fg);
    }

    .keys {
      margin: 0;
      flex: none;
    }

    .controls {
      margin: 0;
      flex: none;
      display: flex;
      align-items: center;
      gap: var(--ss-s-1);
    }

    // Recording state: the row lights up and the key cell shows the prompt.
    .row.recording {
      background: var(--ss-primary-soft);
    }

    .prompt {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-primary);
    }

    // SC 2.1.4 truth stays visible: a user-disabled shortcut is struck
    // through and tagged "(off)" — never silently dropped from the list.
    .row.off {
      .label {
        color: var(--ss-fg-muted);
      }
      .txt {
        text-decoration: line-through;
      }
    }

    .off-tag {
      margin-left: var(--ss-s-1);
      color: var(--ss-fg-muted);
    }

    .extra {
      color: var(--ss-fg-muted);
    }

    .globals {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ss-gap-sm);
      padding-top: var(--ss-s-2);
      border-top: 1px solid var(--ss-line);
    }

    // Reserve one line so announcements never reflow the dialog.
    .status {
      margin: 0;
      min-height: 1.4em;
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-muted);
    }
  }
</style>
