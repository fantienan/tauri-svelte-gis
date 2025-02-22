<script lang="ts">
  import { toast } from 'svelte-sonner';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { diskReadDir, shapefileToServer } from '@/services';
  import FileArchive from 'lucide-svelte/icons/file-archive';
  // import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import HardDrive from 'lucide-svelte/icons/hard-drive';
  import File from 'lucide-svelte/icons/file';
  import Folder from 'lucide-svelte/icons/folder';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import { onMount } from 'svelte';
  import { isShapefile, traverseTree } from '@/utils';
  import type { DriveRecord } from '@/types';

  let diskDirTree = $state<DriveRecord[]>([]);
  const getShapefileGroupName = (name: string) => name.split('.').shift()!;
  const onReadDiskDirectory = async (item?: DriveRecord) => {
    const res = await diskReadDir(item?.path);
    if (!res?.success) {
      toast.error(res?.msg ?? '查询磁盘目录失败');
      return [];
    }
    const shapefiles = res.data.reduce(
      (prev, curr) => {
        if (isShapefile(curr.name)) {
          const shapefileGroupName = getShapefileGroupName(curr.name);
          prev[shapefileGroupName] ??= [];
          prev[shapefileGroupName].push(curr);
        }
        return prev;
      },
      {} as Record<string, Required<DriveRecord>['shapefiles']>
    );
    const d = res.data.reduce((prev, curr) => {
      if (!curr.name) return prev;
      if (item && item.type === 'folder' && isShapefile(curr.name)) {
        const shapefileGroupName = getShapefileGroupName(curr.name);
        if (shapefiles[shapefileGroupName]) {
          const shapefileGroup = res.data.filter(
            (file) =>
              isShapefile(file.name) && getShapefileGroupName(file.name) === shapefileGroupName
          );

          const mainFile = shapefileGroup.find((file) => file.name.endsWith('.shp'));
          if (mainFile) {
            mainFile.shapefiles = shapefileGroup.filter((file) => file !== mainFile);
            prev.push(mainFile);
          }
          delete shapefiles[shapefileGroupName];
        }
      } else {
        prev.push(curr);
      }

      return prev;
    }, [] as DriveRecord[]);
    return d;
  };
  const uploadShapefile = async (path: string) => {
    const res = await shapefileToServer(path);
    if (!res?.success) {
      toast.error(res?.msg ?? '上传shapefile失败');
      return;
    }
  };

  const onReadDiskDirectoryWithRecord = async (item: DriveRecord) => {
    const res = await onReadDiskDirectory(item);
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
  };

  onMount(async () => {
    diskDirTree = await onReadDiskDirectory();
  });
</script>

<div class="disk-dir-tree">
  {#each diskDirTree as item (item.path)}
    {@render Tree({ item })}
  {/each}
</div>
{#snippet Tree({ item }: { item: DriveRecord })}
  {#if item.type === 'file'}
    <Sidebar.MenuButton
      class="data-[active=true]:bg-transparent"
      ondblclick={() => uploadShapefile(item.path)}
    >
      {#if item.path.endsWith('.zip') || item.path.endsWith('.rar')}
        <FileArchive />
      {:else}
        <File />
      {/if}
      <span class="truncate">{item.name}</span>
    </Sidebar.MenuButton>
  {:else}
    <Sidebar.MenuItem>
      <Collapsible.Root
        class="group/collapsible [&[data-state1=open]>button>svg:first-child]:rotate-90"
        open={false}
      >
        <Collapsible.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton
              {...props}
              ondblclick={() => uploadShapefile(item.path)}
              onclick={(e) => {
                (props as any).onclick?.(e);
                if (props['aria-expanded'] === 'false') return;
                onReadDiskDirectoryWithRecord(item);
              }}
            >
              <!-- <ChevronRight className="transition-transform" /> -->
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
