import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import type { ISMap } from '@/components/map-kit';

class GlobalState {
  // 使用 writable 初始化状态
  smap = writable<ISMap | null>(null);
  sidebarOpen = writable<boolean | null>(null);

  constructor() {}
  setSMap = (value: ISMap) => {
    this.smap.set(value);
  };

  setSidebarOpen = (value: boolean) => {
    this.sidebarOpen.set(value);
  };
}

const SYMBOL_KEY = 'global-state';

export function setGlobalState(): GlobalState {
  return setContext(Symbol.for(SYMBOL_KEY), new GlobalState());
}

export function useGlobalState(): GlobalState {
  return getContext(Symbol.for(SYMBOL_KEY));
}
