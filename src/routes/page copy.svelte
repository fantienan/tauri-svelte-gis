<script lang="ts">
  import { readDiskDirectory } from '@/services';
  import folderSvg from '@/assets/svgs/folder.svg';
  import fileSvg from '@/assets/svgs/file.svg';
  import type { DriveRecord } from '@/types';

  let diskDir = $state<DriveRecord[]>([]);
  let currentPath = $state<string | null>(null);

  const goUpOneLevel = () => {
    if (currentPath) {
      if (/^[A-Z]:$/.test(currentPath) || /^[A-Z]:\\$/.test(currentPath)) {
        onReadDiskDirectory();
        return;
      }
      const lastSlashIndex = currentPath.lastIndexOf('\\');
      const parentPath = `${currentPath.substring(0, lastSlashIndex)}\\`;
      onReadDiskDirectory(parentPath);
    }
  };
</script>

<s-page class="container">
  <s-dialog size="full">
    <s-button
      slot="trigger"
      tabindex="0"
      onclick={() => onReadDiskDirectory()}
      onkeydown={() => onReadDiskDirectory()}
      role="button">选择文件</s-button
    >
    <div>
      {#if currentPath}
        <div class="current-path">
          <s-icon-button
            disabled={!currentPath}
            tabindex="0"
            role="button"
            onkeydown={goUpOneLevel}
            onclick={goUpOneLevel}
          >
            <s-icon name="arrow_back"></s-icon>
          </s-icon-button>
          <div>当前路径: {currentPath}</div>
        </div>
      {/if}
      {#each diskDir as item}
        <s-ripple
          tabindex="0"
          role="button"
          onkeydown={() => onReadDiskDirectory(item.path)}
          onclick={() => onReadDiskDirectory(item.path)}
          style="padding: 16px"
        >
          {#if item.type === 'directory'}
            {@html folderSvg}
            {item.name}
          {:else if item.type === 'file'}
            {@html fileSvg}
            {item.name}
          {:else}
            {item.name}
          {/if}
        </s-ripple>
      {/each}
    </div>
    <s-button slot="action" type="text">取消</s-button>
    <s-button slot="action" type="text">确定</s-button>
  </s-dialog>
</s-page>

<style>
  .current-path {
    display: flex;
    align-items: center;
    padding: 16px;
  }
</style>
