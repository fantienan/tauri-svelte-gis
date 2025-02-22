<script module>
  import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
  let isMobile = new IsMobile();
  let headerCls = 'flex h-16 shrink-0 items-center gap-2 border-b px-4';
</script>

<script lang="ts">
  import { Pane, Splitpanes } from 'svelte-splitpanes';
  import AppSidebar from '$lib/components/app-sidebar.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { useGlobalState } from '@/context';
  import { cn } from '../utils';

  let { children, ...restProps } = $props();
  let sidebarOpen = $state<boolean>();
  const globalState = useGlobalState();
</script>

{#snippet appSidebar()}
  <AppSidebar
    ontransitionend={() => {
      globalState.smap?.resize();
    }}
  />
{/snippet}

{#snippet sidebarInset()}
  <Sidebar.Inset>
    {#if isMobile.current}
      <header class={headerCls}>
        <Sidebar.Trigger class="-ml-1" />
      </header>
    {/if}
    <div class="flex flex-1 flex-col">
      {@render children?.()}
    </div>
  </Sidebar.Inset>
{/snippet}

{#if !isMobile.current}
  <header class={headerCls}></header>
{/if}

<Sidebar.Provider
  {...restProps}
  class={cn(!isMobile.current ? 'h-[calc(100vh-4rem)]' : 'min-h-svh', restProps.class)}
  onOpenChange={(open) => {
    restProps.onOpenChange?.(open);
    sidebarOpen = open;
  }}
>
  {#if isMobile.current}
    {@render appSidebar()}
    {@render sidebarInset()}
  {:else}
    <Splitpanes
      on:resize={() => {
        globalState.smap?.resize();
      }}
      class="w-full"
      pushOtherPanes={false}
    >
      <Pane size={25} snapSize={1} class="relative">{@render appSidebar()}</Pane>
      <Pane size={75}>{@render sidebarInset()}</Pane>
    </Splitpanes>
  {/if}
</Sidebar.Provider>
