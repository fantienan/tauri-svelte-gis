<script lang="ts">
  import '../app.css';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import SidebarPage from '$lib/components/sidebar-page.svelte';
  import { GlobalProvider } from '@/context';

  let { children, ...restProps } = $props();
</script>

<GlobalProvider>
  <SidebarPage {...restProps}>
    {@render children?.()}
  </SidebarPage>
</GlobalProvider>
