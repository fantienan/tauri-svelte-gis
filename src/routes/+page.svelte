<script lang="ts">
  import { SMap } from '@/components/ui';
  import { useGlobalState } from '@/global-context';

  let globalState = useGlobalState();
  let sMapStore = globalState.smap;
  let sidebarOpenStore = globalState.sidebarOpen;

  $effect(() => {
    if ($sMapStore && typeof $sidebarOpenStore === 'boolean') {
      setTimeout(() => {
        console.log('resize');
        $sMapStore.resize();
      }, 1000);
    }
  });
</script>

<SMap onReady={globalState.setSMap} />
