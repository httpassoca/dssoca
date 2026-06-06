<script lang="ts">
  interface Props {
    size?: number
    color?: string
  }
  let { size = 22, color = 'var(--ss-primary)' }: Props = $props()
</script>

<svg viewBox="0 0 103 89" width={size} height={size} fill={color}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M51.5 0L0 89H103L51.5 0ZM23.8643 80.151H87.6468L71.6884 52.5724L23.8643 80.151ZM65.5911 42.0354L60.7383 33.649L46.1956 42.0354H65.5911ZM56.14 25.7024L51.5 17.6837L42.2125 33.7339L56.14 25.7024ZM32.0977 51.2138L20.2949 71.6111L55.6656 51.2138H32.0977Z"
  />
</svg>
