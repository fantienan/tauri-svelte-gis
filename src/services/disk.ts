import { invoke } from '@tauri-apps/api/core';
import type { ApiResult, DriveRecord } from '@/types';

export const readDiskDirectory = (path?: string) => {
  return invoke<ApiResult<DriveRecord[]>>('read_disk_directory', { path });
};

export const uploadShape = () => {
  return invoke('upload_shape');
};
