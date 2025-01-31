<script lang="ts" module>
  import Layers from 'lucide-svelte/icons/layers-2';

  // This is sample data
  const data = {
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
        isActive: true
      }
    ],
    layers: [
      {
        name: 'a',
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
  let layers = $state(data.layers);
  const sidebar = useSidebar();
</script>

<Sidebar.Root
  bind:ref
  collapsible="icon"
  class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
  {...restProps}
>
  <!-- This is the first sidebar -->
  <!-- We disable collapsible and adjust width to icon. -->
  <!-- This will make the sidebar appear as icons. -->
  <Sidebar.Root collapsible="none" class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
    <Sidebar.Header>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
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
            {#each data.navMain as item (item.title)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  tooltipContentProps={{
                    hidden: false
                  }}
                  onclick={() => {
                    activeItem = item;
                    const mail = data.layers.sort(() => Math.random() - 0.5);
                    layers = mail.slice(0, Math.max(5, Math.floor(Math.random() * 10) + 1));
                    sidebar.setOpen(true);
                  }}
                  isActive={activeItem.title === item.title}
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

  <!-- This is the second sidebar -->
  <!-- We disable collapsible and let it fill remaining space -->
  <Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
    <Sidebar.Header class="gap-3.5 border-b p-4">
      <div class="flex w-full items-center justify-between">
        <div class="text-base font-medium text-foreground">
          {activeItem.title}
        </div>
        <Label class="flex items-center gap-2 text-sm">
          <span>Unreads</span>
          <Switch class="shadow-none" />
        </Label>
      </div>
      <Sidebar.Input placeholder="Type to search..." />
    </Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group class="px-0">
        <Sidebar.GroupContent>
          {#each layers as { id, name } (id)}
            <div
              class="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <div class="flex w-full items-center gap-2">
                <span>{name}</span>
              </div>
            </div>
          {/each}
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
  </Sidebar.Root>
</Sidebar.Root>
