<script lang="ts">
  // The type chip shared by /changelog and the per-component changelog (DS-0196).
  import { Badge } from 'dssoca'
  import type { ChangeType } from '$lib/changelog'

  let { type, breaking = false }: { type?: ChangeType; breaking?: boolean } = $props()

  const TONES = {
    added: 'positive',
    changed: 'info',
    fixed: 'brand',
    removed: 'critical',
    deprecated: 'caution',
  } as const
  const LABELS = {
    added: 'Added',
    changed: 'Changed',
    fixed: 'Fixed',
    removed: 'Removed',
    deprecated: 'Deprecated',
  } as const
</script>

{#if type}<Badge tone={TONES[type]} size="sm">{LABELS[type]}</Badge>{/if}
{#if breaking}<Badge tone="critical" size="sm">Breaking</Badge>{/if}
