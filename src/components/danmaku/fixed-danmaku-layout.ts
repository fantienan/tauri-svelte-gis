import type { IDanmakuRenderer, IFixedDanmaku, IFixedDanmakuLayout, IFixedDanmakuLayoutOptions } from './types';
import { genRandomInt } from './utils';

export class FixedDanmakuLayout implements IFixedDanmakuLayout {
  private _dr: IDanmakuRenderer;
  /** 顶部弹幕，从上往下排列 */
  private _topRenderDanmakus: IFixedDanmaku[] = [];
  /** 底部弹幕，从下往上排列 */
  private _bottomRenderDanmakus: IFixedDanmaku[] = [];

  constructor(options: IFixedDanmakuLayoutOptions) {
    this._dr = options.danmakuRenderer;
    this._topRenderDanmakus = [];
  }

  /** 插入弹幕 */
  private _insertDanmaku = (danmaku: IFixedDanmaku) => {
    let inserted = false;
    if (danmaku.danmakuType === 'top') {
      // 没有顶部弹幕时判断顶部高度能不能插入
      if (this._topRenderDanmakus.length === 0) {
        if (this._topRangeHeight >= danmaku.height) {
          danmaku.top = this._topRange.min;
          this._topRenderDanmakus.push(danmaku);
          inserted = true;
        }
      } else {
        // 有顶部弹幕时判断能不能插入
        for (let i = 0; i < this._topRenderDanmakus.length; i++) {
          const cur = this._topRenderDanmakus[i];
          // 判断第一个前面能不能插入
          if (i === 0) {
            if (cur.top - this._topRange.min >= danmaku.height) {
              danmaku.top = this._topRange.min;
              this._topRenderDanmakus.unshift(danmaku);
              inserted = true;
              break;
            }
          }
          // 计算下面能不能插入
          let gap = 0;
          if (i === this._topRenderDanmakus.length - 1) {
            gap = this._topRange.max - cur.top - cur.height;
          } else {
            // 计算当前弹幕和下一个弹幕之间的间隔
            gap = this._topRenderDanmakus[i + 1].top - cur.top - cur.height;
          }
          if (gap >= danmaku.height) {
            danmaku.top = cur.top + cur.height;
            this._topRenderDanmakus.splice(i + 1, 0, danmaku);
            inserted = true;
            break;
          }
        }
      }
    } else {
      // 没有底部弹幕时判断底部高度能不能插入
      if (this._bottomRenderDanmakus.length === 0) {
        if (this._bottomRangeHeight >= danmaku.height) {
          danmaku.top = this._bottomRange.max - danmaku.height;
          this._bottomRenderDanmakus.push(danmaku);
          inserted = true;
        }
      } else {
        for (let i = 0; i < this._bottomRenderDanmakus.length; i++) {
          const cur = this._bottomRenderDanmakus[i];
          // 判断第一个下面能不能插入
          if (i === 0) {
            if (this._bottomRange.max - cur.top - cur.height >= danmaku.height) {
              danmaku.top = this._bottomRange.max - danmaku.height;
              this._bottomRenderDanmakus.unshift(danmaku);
              inserted = true;
              break;
            }
          }
          // 判断上面能不能插入
          let gap = 0;
          if (i === this._bottomRenderDanmakus.length - 1) {
            gap = cur.top - this._bottomRange.min;
          } else {
            gap = cur.top - this._bottomRenderDanmakus[i + 1].top - this._bottomRenderDanmakus[i + 1].height;
          }
          if (gap >= danmaku.height) {
            this._bottomRenderDanmakus.splice(i + 1, 0, danmaku);
            danmaku.top = cur.top - danmaku.height;
            inserted = true;
            break;
          }
        }
      }
    }
    // 对重要的弹幕并且没有插入成功的弹幕，直接插入到最后
    if (danmaku.prior && !inserted) {
      if (danmaku.danmakuType === 'top') {
        danmaku.top = genRandomInt(this._topRange.min, this._topRange.max - danmaku.height);
        this._topRenderDanmakus.push(danmaku);
        this._topRenderDanmakus.sort((a, b) => a.top - b.top);
      } else {
        danmaku.top = genRandomInt(this._bottomRange.min, this._bottomRange.max - danmaku.height);
        this._bottomRenderDanmakus.push(danmaku);
        this._bottomRenderDanmakus.sort((a, b) => b.top - a.top);
      }
    }
  };

  /** 一半canvas高度，top弹幕只能在中线的上面，bottom只能在中线的下面 */
  private get _middleHeight() {
    return this._dr.canvasSize.height / 2;
  }

  /** 顶部弹幕y轴范围 */
  private get _topRange() {
    return { min: 4, max: this._middleHeight };
  }

  /** 顶部弹幕y轴范围高度 */
  private get _topRangeHeight() {
    return this._topRange.max - this._topRange.min;
  }

  /** 底部弹幕y轴范围 */
  private get _bottomRange() {
    return { min: this._middleHeight, max: this._dr.canvasSize.height - 4 };
  }

  /** 底部弹幕y轴范围高度 */
  private get _bottomRangeHeight() {
    return this._bottomRange.max - this._bottomRange.min;
  }

  /** 获取可渲染的弹幕 */
  getRenderDanmakus: IFixedDanmakuLayout['getRenderDanmakus'] = (danmakus, time) => {
    // 可以渲染到顶部和底部的弹幕
    const nextTopRenderDanmakus = danmakus.filter((d) => d.danmakuType === 'top' && d.endTime >= time && d.time <= time);
    const nextBottomRenderDanmakus = danmakus.filter((d) => d.danmakuType === 'bottom' && d.endTime >= time && d.time <= time);

    // 过滤掉不用渲染的
    this._topRenderDanmakus = this._topRenderDanmakus.filter((d) => nextTopRenderDanmakus.includes(d));
    this._bottomRenderDanmakus = this._bottomRenderDanmakus.filter((d) => nextBottomRenderDanmakus.includes(d));

    // 获取新增的需要渲染的弹幕，原来的弹幕有top，不需要计算
    nextTopRenderDanmakus.forEach((d) => {
      if (!this._topRenderDanmakus.includes(d)) this._insertDanmaku(d);
    });
    nextBottomRenderDanmakus.forEach((d) => {
      if (!this._bottomRenderDanmakus.includes(d)) this._insertDanmaku(d);
    });
    const renderDanmakus = [...this._topRenderDanmakus, ...this._bottomRenderDanmakus];

    return { renderDanmakus, danmakus: danmakus.filter((v) => v.endTime >= time) };
  };

  send: IFixedDanmakuLayout['send'] = (danmaku) => {
    this._insertDanmaku(danmaku);
  };
}
