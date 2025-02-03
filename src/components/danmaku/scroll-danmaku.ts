import { BaseDanmaku } from './base-danmaku';
import type { IDanmakuRenderer, IScrollDanmaku, IScrollDanmakuOptions } from './types';

export class ScrollDanmaku extends BaseDanmaku implements IScrollDanmaku {
  declare danmakuType: IScrollDanmaku['danmakuType'];
  private _originalLeft!: number;
  private _originalRight!: number;
  private _show: IScrollDanmaku['show'];
  private _grade!: IScrollDanmaku['grade'];
  constructor(options: IScrollDanmakuOptions, danmakuRenderer: IDanmakuRenderer) {
    super(options, danmakuRenderer);
    this._show = true;
    this._calc();
  }

  /**  计算原始的left和right */
  private _calc = () => {
    // 计算当播放时间为 0 时，弹幕左侧距离 Canvas 左侧的距离
    // 计算公式是：Canvas 元素的宽 + 弹幕出现时间 * 弹幕速度
    this._originalLeft = this.dr.canvasSize.width + (this.diffStartOfDayToTime / 1000) * this.dr.renderConfig.speed;
    this._originalRight = this._originalLeft + this.width;
  };

  get originalLeft() {
    return this._originalLeft;
  }

  get originalRight() {
    return this._originalRight;
  }

  get show() {
    return this._show;
  }

  set show(value: boolean) {
    this._show = value;
  }

  get grade() {
    return this._grade;
  }

  set grade(value: number) {
    this._grade = value;
  }
}
