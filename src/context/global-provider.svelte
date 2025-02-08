<script lang="ts">
  import { setGlobalState } from './context.svelte';

  let { children } = $props();

  setGlobalState();
</script>

{@render children?.()}
