<script lang="ts">
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import type { SiderbarProviderProps } from './ui/sidebar/sidebar-provider.svelte';

  let { children, ...restProps }: SiderbarProviderProps = $props();
</script>

<Sidebar.Provider style="--sidebar-width: 350px;" class="sidebar-provider" {...restProps}>
  <AppSidebar />
  <!-- <Sidebar.Inset>
    <header class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
    </header>
    <div class="flex flex-1">
      {@render children?.()}
    </div>
  </Sidebar.Inset> -->
</Sidebar.Provider>

{@render children?.()}
