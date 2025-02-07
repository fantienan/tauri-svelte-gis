<script lang="ts">
  import '../app.css';
  import SidebarPage from '$lib/components/sidebar-page.svelte';
  import { GlobalProvider } from '@/global-context';

  let { children, ...restProps } = $props();
</script>

<GlobalProvider>
  <SidebarPage {...restProps}>
    {@render children?.()}
  </SidebarPage>
</GlobalProvider>
