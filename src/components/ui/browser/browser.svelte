<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { readDiskDirectory } from '@/services';
  import type { DriveRecord } from '@/types';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import File from 'lucide-svelte/icons/file';
  import Folder from 'lucide-svelte/icons/folder';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import { onMount, type ComponentProps } from 'svelte';

  let diskDirTree = $state<DriveRecord[]>([]);

  const onReadDiskDirectory = async (path?: string) => {
    const res = await readDiskDirectory(path);
    if (!res.success) {
      console.error(res.msg);
      return [];
    }
    return res.data.filter((item) => item.name);
  };

  onMount(async () => {
    const res = await onReadDiskDirectory();
    diskDirTree = res;
  });
</script>

{#each diskDirTree as item (item.path)}
  {@render Tree({ item })}
{/each}

{#snippet Tree({ item }: { item: DriveRecord })}
  {#if item.type === 'file'}
    <Sidebar.MenuButton class="data-[active=true]:bg-transparent">
      <File />
      {item.name}
    </Sidebar.MenuButton>
  {:else}
    <Sidebar.MenuItem>
      <Collapsible.Root
        class="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        open={false}
      >
        <Collapsible.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton
              {...props}
              onclick={(e) => {
                (props as any).onclick(e);
                onReadDiskDirectory(item.path);
              }}
            >
              <ChevronRight className="transition-transform" />
              {#if props['aria-expanded'] === 'true'}
                <FolderOpen />
              {:else}
                <Folder />
              {/if}
              {item.name}
            </Sidebar.MenuButton>
          {/snippet}
        </Collapsible.Trigger>
        <Collapsible.Content>
          <!-- <Sidebar.MenuSub>
            {#each item as subItem, index (index)}
              {@render Tree({ item: subItem })}
            {/each}
          </Sidebar.MenuSub> -->
        </Collapsible.Content>
      </Collapsible.Root>
    </Sidebar.MenuItem>
  {/if}
{/snippet}
