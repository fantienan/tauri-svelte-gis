import { Marker } from 'mapbox-gl';
import type { ISMap } from './smap';

export interface IMapMarker extends Marker {
  name: string;
  getContainer: () => HTMLElement;
}

export class MapMarker extends Marker implements IMapMarker {
  name: IMapMarker['name'];
  private _container: HTMLElement;
  constructor(element?: HTMLElement, options?: mapboxgl.MarkerOptions) {
    super(element, options);
    this.name = 'map-marker';
    this._container = document.createElement('div');
    this._container.classList.add('smap-marker');
    this._container.style.position = 'absolute';
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  override _updateDOM() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super._updateDOM();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pos = this._pos;
    this._container.style.top = `${pos.y}px`;
    this._container.style.left = `${pos.x}px`;
  }

  override addTo(map: ISMap): this {
    const res = super.addTo(map);
    map.getContainer().appendChild(this._container);
    return res;
  }

  override remove(): this {
    this._container.remove();
    return super.remove();
  }

  getContainer: IMapMarker['getContainer'] = () => this._container;
}
