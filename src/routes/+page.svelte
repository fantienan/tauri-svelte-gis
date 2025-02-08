<script lang="ts">
  import { SMap } from '@/components/ui';
  import { useGlobalState } from '@/context';

  let globalState = useGlobalState();
</script>

<SMap onReady={globalState.setSMap} />
