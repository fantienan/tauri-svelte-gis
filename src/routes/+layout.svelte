<script lang="ts">
  import '../app.css';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import SidebarPage from '$lib/components/sidebar-page.svelte';
  import { GlobalProvider } from '@/context';

  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children, ...restProps } = $props();
</script>

<Toaster />
<GlobalProvider>
  <SidebarPage {...restProps}>
    {@render children?.()}
  </SidebarPage>
</GlobalProvider>
