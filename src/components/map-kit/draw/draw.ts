import MapboxDraw, { type MapboxDrawOptions } from '@ttfn/mapbox-gl-draw';
import { nanoid } from 'nanoid';
import { BaseKit } from '../base-kit';
import type { IDraw, IDrawKit, IDrawKitOptions, IDrawOptions } from './types';
import '@ttfn/mapbox-gl-draw/dist/mapbox-gl-draw.css';

class DrawKit extends BaseKit implements IDrawKit {
  private _options: IDrawKitOptions;
  constructor(options: IDrawKitOptions) {
    super(options);
    this._options = options;
  }

  protected onStatusChange = () => {
    this._options.onStatusChange();
    super.onStatusChange();
  };
}

export class Draw extends MapboxDraw implements IDraw {
  private _id = nanoid();
  private _isShowUi?: boolean;
  private _drawKit: IDrawKit;
  name: IDraw['name'];
  map: IDraw['map'];
  displayControlsDefault: IDraw['displayControlsDefault'];
  constructor(options: IDrawOptions) {
    const { styles, map, ...restOptions } = options;
    const o: MapboxDrawOptions = { displayControlsDefault: false, ...restOptions };
    if (typeof styles === 'function') o.styles = styles(map);
    super(o);
    this.name = 'draw';
    this.map = map;
    this._drawKit = new DrawKit({
      map,
      name: this.name,
      rejection: ['ai-discern'],
      onStatusChange: this._onStatusChange
    });
    this.displayControlsDefault = o.displayControlsDefault;
  }

  private _setShowUi = (type: boolean | 'trigger') => {
    let node = document.getElementById(this._id);
    const show = type === 'trigger' ? !this._isShowUi : type;
    if (!node) {
      node = document.createElement('style');
      node.id = this._id;
      document.head.appendChild(node);
    }
    if (show) node.innerText = '';
    else node.innerText = `.${MapboxDraw.constants.classes.CONTROL} {display: none !important;}`;
    this._isShowUi = show;
    return !!show;
  };

  private _onStatusChange = () => {
    this._setShowUi(this.enabled);
    if (!this.enabled) {
      this.cancel();
    }
  };

  get enabled() {
    return this._drawKit.enabled;
  }

  get setStatus() {
    return this._drawKit.setStatus.bind(this._drawKit);
  }
}
