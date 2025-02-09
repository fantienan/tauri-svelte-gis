<script lang="ts">
  import { toast } from 'svelte-sonner';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { readDiskDirectory } from '@/services';
  import FileArchive from 'lucide-svelte/icons/file-archive';
  import ChevronRight from 'lucide-svelte/icons/chevron-right';
  import HardDrive from 'lucide-svelte/icons/hard-drive';
  import File from 'lucide-svelte/icons/file';
  import Folder from 'lucide-svelte/icons/folder';
  import FolderOpen from 'lucide-svelte/icons/folder-open';
  import { onMount } from 'svelte';
  import { traverseTree } from '@/utils';
  import type { DriveRecord } from '@/types';

  let layerTree = $state<DriveRecord[]>([]);
</script>
