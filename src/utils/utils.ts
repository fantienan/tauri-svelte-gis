import dayjs from 'dayjs';
import { each } from 'lodash-es';
import type { IConfig } from '@/types';

export const getConfig = (): IConfig => {
  try {
    return JSON.parse(sessionStorage.getItem('__SM_SCOPE__')!).config;
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
    cb?.({ item, parent: data, index });
    if (Array.isArray(item[fieldNames.children]))
      traverseTree({ data: item[fieldNames.children], fieldNames, cb });
  });
}
