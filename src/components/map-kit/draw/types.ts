import type { MapboxDrawOptions } from '@ttfn/mapbox-gl-draw';
import type MapboxDraw from '@ttfn/mapbox-gl-draw';
import type { ISMap } from '../smap';
import type { IBaseKit, IBaseKitOptions } from '../base-kit';

export interface IDraw extends MapboxDraw, Omit<IBaseKit, 'rejection' | 'status'> {
  name: string;
  map: ISMap;
  displayControlsDefault?: boolean;
}

export type IDrawOptions = Omit<MapboxDrawOptions, 'styles'> & {
  map: ISMap;
  styles?: MapboxDrawOptions['styles'] | ((map: ISMap) => MapboxDrawOptions['styles']);
  idPrefix?: string;
};

export interface IDrawUi {
  map: ISMap;
  createButtons: () => void;
}

export type IDrawUiOptions = {
  map: ISMap;
};

export type IDrawKit = IBaseKit;

export type IDrawKitOptions = IBaseKitOptions & {
  onStatusChange: () => void;
};
