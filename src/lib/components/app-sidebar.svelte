<script lang="ts">
  import { Pane, Splitpanes } from 'svelte-splitpanes';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { Browser, Layers } from '@/components/ui';
  import type { ComponentProps } from 'svelte';

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
  <Sidebar.Content>
    <Splitpanes horizontal class="w-full" pushOtherPanes={false}>
      <Pane size={40} snapSize={1}>
        <Sidebar.Group class="h-full overflow-auto">
          <Sidebar.GroupLabel>浏览器</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Browser />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Pane>
      <Pane size={60} snapSize={1}>
        <Sidebar.Group class="h-full overflow-auto">
          <Sidebar.GroupLabel>图层</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Layers />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Pane>
    </Splitpanes>
  </Sidebar.Content>
  <!-- <Sidebar.Rail /> -->
</Sidebar.Root>
