<script lang="ts">
  import '../app.css';
  import SidebarPage from '$lib/components/sidebar-page.svelte';
  import GlobalProvider from '@/global-context/global-provider.svelte';
  import {} from '@/global-context';

  let { children, ...restProps } = $props();
  const onOpenChange = () => {};
</script>

<GlobalProvider>
  <SidebarPage {...restProps} onOpenChange={() => {}}>
    {@render children?.()}
  </SidebarPage>
</GlobalProvider>
