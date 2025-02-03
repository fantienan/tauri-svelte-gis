import {
  ImageSection,
  TextSection,
  defaultFontSize,
  defaultLineHeight,
  genDanmakuImageId,
  getStartOfDayTimestamp,
  imageFactory,
  sum,
} from './utils';
import type { IBaseDanmaku, IDanmakuCustomRender, IBaseDanmakuOptions, IDanmakuRenderer, IDanmakuSection, IDanmakuSegment } from './types';

export class BaseDanmaku implements IBaseDanmaku {
  readonly danmakuType: IBaseDanmaku['danmakuType'];
  /** 弹幕id */
  private _id: string;
  /** 弹幕文字 */
  private _text: string;
  /** 弹幕渲染器 */
  protected dr: IDanmakuRenderer;
  /** 弹幕字体大小 */
  private _fontSize: number;
  /* 是否是重要的弹幕 */
  private _prior?: boolean;
  /** 弹幕文字颜色 */
  private _color: string;
  // 根据 text 解析成的片段数组
  private _sections: IDanmakuSection[];
  /* 弹幕的行高 */
  private _lineHeight: number;
  /* 弹幕尺寸 */
  private _width!: number;
  private _height!: number;
  /* 弹幕整体的top和left */
  private _left!: number;
  private _top!: number;
  private _danmakuCustomRender?: IDanmakuCustomRender;
  private _time: number;
  /** 弹幕在canvas事件系统中的id */
  // protected osCanvasId: string;
  segments: IDanmakuSegment[];
  diffStartOfDayToTime: IBaseDanmaku['diffStartOfDayToTime'];
  constructor(options: IBaseDanmakuOptions, danmakuRenderer: IDanmakuRenderer) {
    this.danmakuType = options.danmakuType;
    this._id = options.id;
    this._time = options.time;
    this._text = options.text;
    this.dr = danmakuRenderer;
    this._fontSize = options.fontSize ?? defaultFontSize;
    this._lineHeight = options.lineHeight ?? defaultLineHeight;
    this._prior = !!options.prior;
    this._color = options.color ?? '#FFFFFF';
    this._sections = [];
    this._danmakuCustomRender = options.danmakuCustomRender;
    this.diffStartOfDayToTime = Math.abs(this._time - getStartOfDayTimestamp());
    this.segments = [];
    this._init();
  }

  /**
   * @description 文本内容[图片id]文本内容[图片id] => ['文本内容', '[图片id]', '文本内容', '[图片id]']
   */
  private _analyseText = (text: string) => {
    const segments: IDanmakuSegment[] = [];
    const regex = /\[.*?\]/;
    let match: RegExpExecArray | null = null;
    if (typeof text !== 'string') return segments;
    if (!regex.exec(text)) {
      segments.push({ type: 'text', value: text });
      return segments;
    }
    while ((match = regex.exec(text)) !== null) {
      const { index } = match;
      // 弹幕开头是文字
      if (index > 0) {
        const segment: IDanmakuSegment = { type: 'text', value: text.slice(0, index) };
        segments.push(segment);
        text = text.slice(index);
      } else {
        segments.push({ type: 'image', value: match[0] });
        text = text.slice(match[0].length);
      }
    }
    if (text.trim()) segments.push({ type: 'text', value: text });
    this.segments = segments;
    return segments;
  };

  private _init = () => {
    let danmakuImage;
    // 整个弹幕的宽
    let totalWidth = 0;
    // 整个弹幕的高
    let maxHeight = 0;
    // 弹幕内边距
    const padding = { left: 5, right: 5, top: 4, bottom: 4 };
    // 文字左右间距
    const textPadding = 3;
    const sections: IDanmakuSection[] = [];
    this._analyseText(this._text).forEach((segment) => {
      if (
        segment.type === 'image' &&
        (danmakuImage = this.dr.danmakuImages.find((image) => genDanmakuImageId(image.id) === segment.value))
      ) {
        totalWidth += danmakuImage.width;
        maxHeight = maxHeight < danmakuImage.height ? danmakuImage.height : maxHeight;
        sections.push(new ImageSection({ ...danmakuImage, leftOffset: sum(sections) + padding.left }));
      } else {
        this._setCtxFont(this.dr.ctx);
        let textWidth = this.dr.ctx.measureText(segment.value).width ?? 0;
        if (textWidth) textWidth += textPadding * 2;
        const textHeight = this._fontSize * this._lineHeight;
        totalWidth += textWidth;
        maxHeight = maxHeight < textHeight ? textHeight : maxHeight;

        // 构建文本片段
        sections.push(
          new TextSection({
            text: segment.value,
            width: textWidth,
            height: textHeight,
            leftOffset: sum(sections) + padding.left + textPadding,
          }),
        );
      }
    });
    this._sections = sections;

    // 设置弹幕宽高
    this._width = this._danmakuCustomRender?.width ?? totalWidth + padding.left + padding.right;
    this._height = this._danmakuCustomRender?.height ?? maxHeight + padding.top + padding.bottom;

    // 计算偏移量
    this._sections.forEach((item) => {
      if (item.sectionType === 'text') {
        item.topOffset = (this._height - this._fontSize) / 2;
      } else {
        item.topOffset = (this._height - item.height) / 2;
      }
    });
  };

  /**
   * 设置上下文的 font 属性
   */
  private _setCtxFont = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => {
    ctx.font = `${this.dr.renderConfig.fontWeight} ${this._fontSize}px ${this.dr.renderConfig.fontFamily}`;
  };

  get time() {
    return this._time;
  }

  get getStartOfDayTimestamp() {
    return;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get left() {
    return this._left;
  }

  set left(value: number) {
    this._left = value;
  }

  get top() {
    return this._top;
  }

  set top(value: number) {
    this._top = value;
  }

  get prior() {
    return this._prior;
  }

  get id() {
    return this._id;
  }

  render: IBaseDanmaku['render'] = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    if (typeof this._danmakuCustomRender?.render === 'function') {
      this._danmakuCustomRender.render({ ctx, danmaku: this, dr: this.dr, imageFactory });
      return;
    }
    const radius = this._height;

    // const radius = Math.floor(Math.min(this._height, this._width) / 2);
    // 辅助开发的弹幕边框，用于确定弹幕的渲染大小
    if (this.dr.devConfig.isRenderBarrageBorder && !this._prior) {
      ctx.strokeStyle = '#FF0000';
      ctx.roundRect(this._left, this._top, this._width, this._height, radius);
    }

    // 如果是重要弹幕的话，需要渲染一个边框，例如当前用户自己发送的弹幕，就应该渲染边框作为明显的标识
    if (this._prior) {
      if (typeof this.dr.renderConfig.priorCustomRender === 'function') {
        // 如果提供了边框的自定义渲染函数的话，则使用自定义渲染函数进行渲染
        this.dr.renderConfig.priorCustomRender({ ctx, danmaku: this, dr: this.dr, imageFactory });
      } else {
        // 否则使用默认渲染
        ctx.strokeStyle = '#fff';
        // ctx.lineWidth = 2;
        ctx.roundRect(this._left, this._top, this._width, this._height, radius);
        // const gradient = ctx.createLinearGradient(this._left, this._top, this._left + this._width, this._top + this._height);
        // gradient.addColorStop(0, 'rgb(6, 173, 61, 0.5)');
        // gradient.addColorStop(1, 'rgb(52, 152, 219, 0.5)');
        // ctx.fillStyle = gradient;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        // ctx.stroke();
        ctx.fill();
      }
    }

    // 渲染弹幕
    this._setCtxFont(ctx);
    ctx.fillStyle = this._color;
    // 遍历当前弹幕的 sections
    this._sections.forEach((section) => {
      if (section.sectionType === 'text') {
        ctx.fillText(section.text, this._left + section.leftOffset, this._top + section.topOffset);
      } else if (section.sectionType === 'image') {
        const res = imageFactory(section.url);
        if (res?.value) {
          ctx.drawImage(res.value, this._left + section.leftOffset, this._top + section.topOffset, section.width, section.height);
        }
      }
    });
  };
}
