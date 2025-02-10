import { invoke } from '@tauri-apps/api/core';
import type { ApiResult } from '@/types';

export const uploadShapefile = (path: string) => {
  return invoke<ApiResult<any>>('upload_shape_file', { path });
};
