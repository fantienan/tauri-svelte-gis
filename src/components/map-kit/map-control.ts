import clsx from 'clsx';
import type { IControl } from 'mapbox-gl';
import type { ISMap } from './smap';

export type IMapKitControlOptions = {
  map: ISMap;
  className?: string;
  onAdd?: (params: IMapKitControlOnAddParams) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export type IMapKitControlOnAddParams = { map: ISMap; container: HTMLElement };

export class MapKitControl implements IControl {
  private _className: string;
  private _container?: HTMLElement;
  private _options?: IMapKitControlOptions;
  constructor(options?: IMapKitControlOptions) {
    this._className = clsx('smap-ctrl', options?.className);
    this._options = options;
  }

  onAdd: IControl['onAdd'] = (map) => {
    const div = document.createElement('div');
    div.className = this._className;
    this._container = div;
    if (typeof this._options?.onAdd === 'function') this._options.onAdd({ map: map as ISMap, container: div });
    return div;
  };

  onRemove: IControl['onRemove'] = () => {
    if (this._container) this._container.remove();
  };

  getDefaultPosition: IControl['getDefaultPosition'] = () => this._options?.position ?? 'bottom-right';
}
