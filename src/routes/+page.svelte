<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  const readDiskDirectory =async () => {
    console.log('readDiskDirectory');
    const res = await invoke('read_disk_directory');

  };
</script>

<main class="container">
  <s-button onclick={readDiskDirectory} tabindex="0" role="button" onkeydown={readDiskDirectory}>
    读取磁盘目录
  </s-button>
</main>
