import { invoke } from '@tauri-apps/api/core';
import type { ApiResult } from '@/types';

export const shapefileToServer = (shapefilePath: string) => {
  return invoke<ApiResult>('create_server', { inputPath: shapefilePath });
};

export const shapefileToGeojson = (shapefilePath: string) => {
  return invoke<ApiResult>('shapefile_to_geojson', { shapefilePath });
};

export const shapefileToRecord = (shapefilePath: string) => {
  return invoke<ApiResult>('shapefile_to_record', { shapefilePath });
};
