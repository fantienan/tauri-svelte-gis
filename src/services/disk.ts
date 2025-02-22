import { invoke } from '@tauri-apps/api/core';
import type { ApiResult, DriveRecord } from '@/types';

export const diskReadDir = (path?: string) => {
  return invoke<ApiResult<DriveRecord[]>>('disk_read_dir', { path });
};
