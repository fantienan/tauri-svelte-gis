import type { ISMap } from './smap';

export interface IBaseKit {
  name: string;
  map: ISMap;
  status: IBaseKitStatus;
  enabled: boolean;
  rejection: string[];
  setStatus(status: IBaseKitStatus): void;
}

export type IBaseKitStatus = 'enable' | 'unenable';

export type IBaseKitOptions = Pick<IBaseKit, 'map' | 'name'> & {
  rejection?: IBaseKit['rejection'];
};

export type IBaseKitEvent = {
  status: IBaseKitStatus;
  name: string;
};

export type IMapBaseKitEvent = IBaseKitEvent & {
  target: ISMap;
  type: 'kit.statusChange';
};

export class BaseKit implements IBaseKit {
  name: IBaseKit['name'];
  map: IBaseKit['map'];
  status: IBaseKit['status'];
  rejection: IBaseKit['rejection'];
  constructor(options: IBaseKitOptions) {
    this.name = options.name ?? 'unknown';
    this.map = options.map;
    this.rejection = options.rejection ?? [];
    this.status = 'unenable';
    this._internalBindEvent();
  }

  private _internalBindEvent() {
    this.map.on('kit.statusChange', ({ name, status }) => {
      if (this.name !== name) this._kitStatusChange({ name, status });
    });
  }

  protected onStatusChange() {
    console.log('onStatusChange', this.name, this.enabled);
  }

  get enabled() {
    return this.status === 'enable';
  }

  private async _kitStatusChange(params: IBaseKitEvent) {
    if (this.name === params.name) {
      if (this.status !== params.status) {
        this.status = params.status;
        this.map.dispatch({ type: 'kit.statusChange', ...params });
        this.onStatusChange();
      }
      return;
    }
    const name = this.rejection.find((v) => v === params.name);
    const module = await this.map.getModule(name ?? '');
    if (!module || !module.enabled || !this.enabled) return;
    this.setStatus('unenable');
  }

  setStatus(status: IBaseKitStatus) {
    if (this.status === status) return;
    this._kitStatusChange({ status, name: this.name });
    this.map.fire('kit.statusChange', { status, name: this.name });
  }
}
