<script lang="ts" module>
  import Layers from 'lucide-svelte/icons/layers-2';
  import Server from 'lucide-svelte/icons/server';

  type DataRecord = {
    name: string;
    id: string;
  };

  type NavMainRecord = {
    title: string;
    url: string;
    icon: typeof Layers;
    isActive: boolean;
    id: string;
  };

  type Data = {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
    navMain: NavMainRecord[];
    layers: DataRecord[];
    services: DataRecord[];
  };

  const data: Data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg'
    },
    navMain: [
      {
        title: 'Layers',
        url: '#',
        icon: Layers,
        isActive: true,
        id: 'layers'
      },

      {
        title: 'Services',
        url: '#',
        icon: Server,
        isActive: false,
        id: 'services'
      }
    ],
    layers: [
      {
        name: 'a',
        id: '1'
      }
    ],
    services: [
      {
        name: 'b',
        id: '1'
      }
    ]
  };
</script>

<script lang="ts">
  import NavUser from '$lib/components/nav-user.svelte';
  import { Label } from '$lib/components/ui/label/index.js';
  import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import Command from 'lucide-svelte/icons/command';
  import type { ComponentProps } from 'svelte';

  let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

  let activeItem = $state(data.navMain[0]);
  const sidebar = useSidebar();
</script>

{#snippet sidebarGroupContent(records: DataRecord[])}
  <Sidebar.GroupContent>
    {#each records as { id, name } (id)}
      <div
        class="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <div class="flex w-full items-center gap-2">
          <span>{name}</span>
        </div>
      </div>
    {/each}
  </Sidebar.GroupContent>
{/snippet}

<Sidebar.Root
  bind:ref
  collapsible="icon"
  class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
  {...restProps}
>
  <Sidebar.Root collapsible="none" class="_111 !w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
    <Sidebar.Header>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton size="lg" class="_222 md:h-8 md:p-0">
            {#snippet child({ props })}
              <a href="##" {...props}>
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <Command class="size-4" />
                </div>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">Acme Inc</span>
                  <span class="truncate text-xs">Enterprise</span>
                </div>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupContent class="px-1.5 md:px-0">
          <Sidebar.Menu>
            {#each data.navMain as item (item.id)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  tooltipContentProps={{ hidden: false }}
                  onclick={() => {
                    activeItem = item;
                    sidebar.setOpen(true);
                  }}
                  isActive={activeItem.id === item.id}
                  class="px-2.5 md:px-2"
                >
                  {#snippet tooltipContent()}
                    {item.title}
                  {/snippet}
                  <item.icon />
                  <span>{item.title}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>
      <NavUser user={data.user} />
    </Sidebar.Footer>
  </Sidebar.Root>
  <Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
    <Sidebar.Header class="gap-3.5 border-b p-4">
      <div class="flex w-full items-center justify-between">
        <div class="text-base font-medium text-foreground">
          {activeItem.title}
        </div>
        <Label class="flex items-center gap-2 text-sm">
          <Sidebar.Trigger class="-ml-1" />
        </Label>
      </div>
      <Sidebar.Input placeholder="Type to search..." />
    </Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group class="px-0">
        {#if activeItem.id === 'layers'}
          {@render sidebarGroupContent(data.layers)}
        {:else if activeItem.id === 'services'}
          {@render sidebarGroupContent(data.services)}
        {:else}
          <div>no data</div>
        {/if}
      </Sidebar.Group>
    </Sidebar.Content>
  </Sidebar.Root>
</Sidebar.Root>
