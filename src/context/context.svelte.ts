import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';
import type { ISMap } from '@/components/map-kit';

class GlobalState {
  mapLoaded = writable<boolean | null>(null);
  smap: ISMap | null = null;

  constructor() {}
  setSMap = (value: ISMap) => {
    this.mapLoaded.set(true);
    this.smap = value;
  };
}

const SYMBOL_KEY = 'global-state';

export function setGlobalState(): GlobalState {
  return setContext(Symbol.for(SYMBOL_KEY), new GlobalState());
}

export function useGlobalState(): GlobalState {
  return getContext(Symbol.for(SYMBOL_KEY));
}
