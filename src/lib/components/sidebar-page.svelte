<script lang="ts">
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { useGlobalState } from '@/global-context';

  let { children, ...restProps } = $props();
  const globalState = useGlobalState();
  const globalSidebarOpen = globalState.sidebarOpen;
</script>

<Sidebar.Provider
  {...restProps}
  onOpenChange={(open) => {
    globalState.setSidebarOpen(open);
    restProps.onOpenChange?.(open);
  }}
>
  <AppSidebar />
  <Sidebar.Inset style={$globalSidebarOpen ? 'width: calc(100vw - var(--sidebar-width));' : ''}>
    <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Sidebar.Trigger class="-ml-1" />
      <Separator orientation="vertical" class="mr-2 h-4" />
    </header>
    <div class="flex flex-1">
      {@render children?.()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
