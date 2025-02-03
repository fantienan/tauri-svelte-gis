import { BaseDanmaku } from './base-danmaku';
import type { IDanmakuRenderer, IFixedDanmaku, IFixedDanmakuOptions } from './types';

export class FixedDanmaku extends BaseDanmaku implements IFixedDanmaku {
  declare danmakuType: IFixedDanmaku['danmakuType'];
  endTime: IFixedDanmaku['endTime'];
  constructor(options: IFixedDanmakuOptions, danmakuRenderer: IDanmakuRenderer) {
    super(options, danmakuRenderer);
    this.endTime = this.time + (options.duration || 1) * 1000;
    this.calcFixedDanmakuPosition();
  }

  calcFixedDanmakuPosition = () => {
    this.left = (this.dr.canvasSize.width - this.width) / 2;
  };
}
