import { getContext, setContext } from 'svelte';
import { type ISMap } from '@/components/map-kit';

class GlobalState {
  #smap = $state<ISMap>();

  constructor() {}
  setSMap = (value: ISMap) => {
    this.#smap = value;
  };

  get smap() {
    return this.#smap;
  }
}

const SYMBOL_KEY = 'global-state';

export function setGlobalState(): GlobalState {
  return setContext(Symbol.for(SYMBOL_KEY), new GlobalState());
}

export function useSidebar(): GlobalState {
  return getContext(Symbol.for(SYMBOL_KEY));
}
