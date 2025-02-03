import { FixedDanmaku } from './fixed-danmaku';
import { FixedDanmakuLayout } from './fixed-danmaku-layout';
import { ScrollDanmaku } from './scroll-danmaku';
import { ScrollDanmakuLayout } from './scroll-danmaku-layout';
import { defaultDanmakuId, getHMSTimestamp, insertDanmakuByTime } from './utils';
import type {
  IBaseDanmaku,
  IDanmakuLayout,
  IDanmakuLayoutOptions,
  IDanmakuRenderer,
  IFixedDanmaku,
  IFixedDanmakuLayout,
  IScrollDanmaku,
  IScrollDanmakuLayout,
} from './types';

export class DanmakuLayout implements IDanmakuLayout {
  private _dr: IDanmakuRenderer;
  private _danmakuInstances: IBaseDanmaku[] = [];
  private _fixedDanmakuInstances: IFixedDanmaku[] = [];
  private _scrollDanmakuInstances: IScrollDanmaku[] = [];
  private _fixedDanmakuLayout: IFixedDanmakuLayout;
  private _scrollDanmakuLayout: IScrollDanmakuLayout;
  constructor(options: IDanmakuLayoutOptions) {
    this._dr = options.danmakuRenderer;
    this._fixedDanmakuLayout = new FixedDanmakuLayout({ danmakuRenderer: this._dr });
    this._scrollDanmakuLayout = new ScrollDanmakuLayout({ danmakuRenderer: this._dr });
  }

  /** 获取某时刻需要渲染的滚动弹幕 */
  private _getRenderScrollDanmakus = (time: number) => {
    const res = this._scrollDanmakuLayout.getRenderDanmakus(this._scrollDanmakuInstances, time);
    this._scrollDanmakuInstances = res.danmakus;
    return res;
  };

  /** 获取某时刻需要渲染的固定弹幕 */
  private _getRenderFixedDanmakus = (time: number) => {
    const res = this._fixedDanmakuLayout.getRenderDanmakus(this._fixedDanmakuInstances, time);
    this._fixedDanmakuInstances = res.danmakus;
    return res;
  };

  filterDanmakus: IDanmakuLayout['filterDanmakus'] = (time) => {
    this._fixedDanmakuInstances = [];
    this._scrollDanmakuInstances = [];
    this._danmakuInstances = this._danmakuInstances.filter((danmaku) => {
      if (getHMSTimestamp(danmaku.time) > getHMSTimestamp(time) || danmaku.id.includes(defaultDanmakuId)) {
        if (danmaku.danmakuType === 'scroll') this._scrollDanmakuInstances.push(danmaku as IScrollDanmaku);
        if (danmaku.danmakuType === 'top' || danmaku.danmakuType === 'bottom') this._fixedDanmakuInstances.push(danmaku as IFixedDanmaku);
        return true;
      }
      return false;
    });
    console.log(this._scrollDanmakuInstances);
  };

  setDanmakus: IDanmakuLayout['setDanmakus'] = (danmakuOptions) => {
    danmakuOptions
      .sort((a, b) => a.time - b.time)
      .forEach((options) => {
        switch (options.danmakuType) {
          case 'top':
          case 'bottom': {
            const fixedDanmaku = new FixedDanmaku(options, this._dr);
            this._danmakuInstances.push(fixedDanmaku);
            this._fixedDanmakuInstances.push(fixedDanmaku);
            break;
          }
          case 'scroll': {
            const scrollDanmaku = new ScrollDanmaku(options, this._dr);
            this._danmakuInstances.push(scrollDanmaku);
            this._scrollDanmakuInstances.push(scrollDanmaku);
            break;
          }
        }
      });
    // 滚动弹幕计算布局
    this._scrollDanmakuLayout.layout(this._scrollDanmakuInstances);
  };

  send: IDanmakuLayout['send'] = (danmaku) => {
    switch (danmaku.danmakuType) {
      case 'top':
      case 'bottom': {
        const fixedDanmaku = new FixedDanmaku(danmaku, this._dr);
        this._fixedDanmakuLayout.send(fixedDanmaku);
        insertDanmakuByTime(this._fixedDanmakuInstances, fixedDanmaku);
        insertDanmakuByTime(this._danmakuInstances, fixedDanmaku);
        break;
      }
      case 'scroll': {
        const scrollDanmaku = new ScrollDanmaku(danmaku, this._dr);
        this._scrollDanmakuLayout.send(scrollDanmaku);
        insertDanmakuByTime(this._scrollDanmakuInstances, scrollDanmaku);
        insertDanmakuByTime(this._danmakuInstances, scrollDanmaku);
        break;
      }
    }
  };

  /** 获取某时刻需要渲染的弹幕 */
  getRenderDanmakus: IDanmakuLayout['getRenderDanmakus'] = (time) => {
    // 获取滚动弹幕
    const { renderDanmakus: scrollDanmakus } = this._getRenderScrollDanmakus(time);
    // 获取固定弹幕
    const { renderDanmakus: fixedDanmakus } = this._getRenderFixedDanmakus(time);
    return [...scrollDanmakus, ...fixedDanmakus].sort((a, b) => a.time - b.time);
  };
}
