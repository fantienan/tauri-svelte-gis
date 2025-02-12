import { invoke } from '@tauri-apps/api/core';
import type { ApiResult } from '@/types';

export const uploadShapefile = (filePath: string) => {
  return invoke<ApiResult<any>>('upload_shapefile', { filePath });
};
