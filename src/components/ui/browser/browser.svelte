<script lang="ts">
  import { toast } from 'svelte-sonner';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { readDiskDirectory } from '@/services';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import HardDrive from 'lucide-svelte/icons/hard-drive';
  import File from 'lucide-svelte/icons/file';
  import Folder from 'lucide-svelte/icons/folder';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import { onMount, type ComponentProps } from 'svelte';
  import type { DriveRecord } from '@/types';
  import { traverseTree } from '@/utils';

  let diskDirTree = $state<DriveRecord[]>([]);

  const onReadDiskDirectory = async (path?: string) => {
    const res = await readDiskDirectory(path);
    if (!res.success) {
      toast.error(res.msg);
      return [];
    }
    // 根据type排序，drive、
    return res.data.filter((item) => item.name);
  };

  onMount(async () => {
    diskDirTree = await onReadDiskDirectory();
  });
</script>

{#each diskDirTree as item (item.path)}
  {@render Tree({ item })}
{/each}

{#snippet Tree({ item }: { item: DriveRecord })}
  {#if item.type === 'file'}
    <Sidebar.MenuButton class="data-[active=true]:bg-transparent">
      <File />
      <span class="truncate">{item.name}</span>
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
              onclick={async (e) => {
                (props as any).onclick(e);
                if (props['aria-expanded'] === 'false') return;
                const res = await onReadDiskDirectory(item.path);
                const data = $state.snapshot(diskDirTree);
                traverseTree({
                  data,
                  cb: (node) => {
                    if (node.item.path === item.path) {
                      node.item.children = res;
                      return true;
                    }
                  }
                });
                diskDirTree = data;
              }}
            >
              <ChevronRight className="transition-transform" />
              {#if item.type === 'drive'}
                <HardDrive />
              {:else if props['aria-expanded'] === 'true'}
                <FolderOpen />
              {:else}
                <Folder />
              {/if}
              <span class="truncate">{item.name}</span>
            </Sidebar.MenuButton>
          {/snippet}
        </Collapsible.Trigger>
        <Collapsible.Content>
          {#if Array.isArray(item.children)}
            <Sidebar.MenuSub class="mr-0 pr-0">
              {#each item.children as subItem (subItem.path)}
                {@render Tree({ item: subItem })}
              {/each}
            </Sidebar.MenuSub>
          {/if}
        </Collapsible.Content>
      </Collapsible.Root>
    </Sidebar.MenuItem>
  {/if}
{/snippet}
