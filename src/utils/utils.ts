import dayjs from 'dayjs';
import { each } from 'lodash-es';
import type { IConfig } from '@/types';

export const getConfig = (): IConfig => {
  try {
    const res = {
      config: {
        SM_MAPBOX_TOKEN:
          'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY20xdXM1OWQ5MDQ5MDJrb2U1cGcyazR6MiJ9.ZtSFvLFKtrwOt01u-COlYg',
        SM_GEOVIS_TOKEN: '62d17dd1bcd9b6b4cde180133d80aa420446c9d132f88cb84c29d51e77d01c4c',
        SM_TIANDITU_TOKEN: '211138deb6faa1f236b45eacd0fd331d'
      }
    };
    return res.config;
    // return JSON.parse(sessionStorage.getItem('__SM_SCOPE__')!).config;
  } catch (e) {
    console.error('getIConfig error: ', e);
  }
  return {} as any;
};

export const jsonParse = <T>(str: string): T | undefined => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn(e);
    return;
  }
};

export const sleep = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const genTime = () => {
  const date = dayjs();
  return {
    createTime: date.format('YYYY-MM-DD HH:mm:ss'),
    updateTime: date.format('YYYY-MM-DD HH:mm:ss')
  };
};

type ITraverseTreeParams<T extends Record<string, any> = any> = {
  data: T[];
  cb?: (params: { item: T; parent: T[]; index: number }) => void;
  fieldNames?: {
    children: string;
  };
};

export function traverseTree<T extends Record<string, any> = any>(params: ITraverseTreeParams<T>) {
  const { data, cb, fieldNames = { children: 'children' } } = params;
  return each(data, (item, index) => {
    const flag = cb?.({ item, parent: data, index });
    if (!flag && Array.isArray(item[fieldNames.children]))
      traverseTree({ data: item[fieldNames.children], fieldNames, cb });
  });
}

const shapefileExtensions = [
  'shp',
  'shx',
  'dbf',
  'prj',
  'sbn',
  'sbx',
  'fbn',
  'fbx',
  'ain',
  'aih',
  'ixs',
  'mxs',
  'atx',
  'shp.xml',
  'cpg'
];
export function isShapefile(filename: string): boolean {
  const fileExtension = filename.split('.').pop()?.toLowerCase();

  return shapefileExtensions.includes(fileExtension || '');
}
