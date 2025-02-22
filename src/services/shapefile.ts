import { invoke } from '@tauri-apps/api/core';
import type { ApiResult } from '@/types';

export const shapefileUpload = (shapefilePath: string) => {
  return invoke<ApiResult>('shapefile_upload', { shapefilePath });
};

export const shapefileRead = (shapefilePath: string) => {
  return invoke<ApiResult>('shapefile_read', { shapefilePath });
};

export const shapefileToRecord = (shapefilePath: string) => {
  return invoke<ApiResult>('shapefile_to_record', { shapefilePath });
};
