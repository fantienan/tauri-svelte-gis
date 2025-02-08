<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { Browser } from '@/components/ui';
  import type { ComponentProps } from 'svelte';

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>浏览器</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Browser />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <Sidebar.Group>
      <Sidebar.GroupLabel>图层</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu></Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Rail />
</Sidebar.Root>
