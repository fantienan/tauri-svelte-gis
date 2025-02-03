import mitt from 'mitt';
import { handleHighDprVague, getDevicePixelRatio } from '@/utils';
import { defaultRenderConfig, defaultDevConfig, defaultFontSize, defaultLineHeight, defaultDanmakuId } from './utils';
import { DanmakuLayout } from './danmaku-layout';
import type { IDanmakuLayout, IDanmakuOptions, IDanmakuRenderConfig, IDanmakuRenderer, IDanmakuRendererOptions } from './types';

export class DanmakuRenderer implements IDanmakuRenderer {
  private _dpr: number;
  private _frameId?: number;
  private _enabled?: boolean;
  private _danmakuLayout: IDanmakuLayout;
  /** 每秒帧数 */
  private _fps: string;
  /** 当前时间 毫秒 存储的是完整时间戳，使用时分秒与发送弹幕的时分秒计算弹幕位置 */
  private _currentTime: number;
  /** 离屏 canvas 优化 */
  private _offscreenCanvas: HTMLCanvasElement;
  private _offscreenCanvasCtx: CanvasRenderingContext2D;
  static defaultFontSize = defaultFontSize;
  static defaultLineHeight = defaultLineHeight;
  static defaultDanmakuId = defaultDanmakuId;
  canvas: IDanmakuRenderer['canvas'];
  container: IDanmakuRenderer['container'];
  danmakuImages: IDanmakuRenderer['danmakuImages'];
  ctx: IDanmakuRenderer['ctx'];
  renderConfig: IDanmakuRenderConfig;
  devConfig: IDanmakuRenderer['devConfig'];
  devCanvas: IDanmakuRenderer['devCanvas'];
  devCtx: IDanmakuRenderer['devCtx'];
  event: IDanmakuRenderer['event'];
  constructor(options: IDanmakuRendererOptions) {
    this.event = mitt();
    this.devConfig = { ...defaultDevConfig, ...options.devConfig };
    this.renderConfig = { ...defaultRenderConfig, ...options.renderConfig };
    this.container = typeof options.container === 'string' ? (document.querySelector(options.container) as HTMLElement) : options.container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this._offscreenCanvas = document.createElement('canvas');
    this._offscreenCanvasCtx = this._offscreenCanvas.getContext('2d')!;
    if (this.devConfig.scrollDebugMode) {
      this.devCanvas = document.createElement('canvas');
      this.devCtx = this.devCanvas.getContext('2d')!;
    }
    this.danmakuImages = options.danmakuImages;
    this._dpr = getDevicePixelRatio();
    this._fps = '';
    this._currentTime = 0;
    this._danmakuLayout = new DanmakuLayout({ danmakuRenderer: this });
    this._handleDOM();
    if (Array.isArray(options.danmakus) && options.danmakus.length) this.setDanmakus(options.danmakus);
    console.log(this._fps);
  }

  private _handleDOM = () => {
    const { container, ctx, canvas } = this;
    if (!container) console.error('Unable to obtain container element');
    if (!ctx) console.error('Unable to obtain CanvasRenderingContext2D');
    if (!container || !ctx) return;
    // 设置容器
    container.style.position ??= 'relative';

    // 设置 canvas
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    this._handleHighDprVague(canvas, ctx);

    this._offscreenCanvas.width = container.clientWidth;
    this._offscreenCanvas.height = container.clientHeight;
    this._handleHighDprVague(this._offscreenCanvas, this._offscreenCanvasCtx);

    if (this.devConfig.scrollDebugMode) {
      this.devCanvas!.width = container.clientWidth;
      this.devCanvas!.height = container.clientHeight;
      container.appendChild(this.devCanvas!);
      container.appendChild(canvas);
      this._handleHighDprVague(this.devCanvas!, this.devCtx!);
    }
    if (!this._enabled) container.style.display = 'none';
  };

  /**处理canvas高分辨模糊问题 */
  private _handleHighDprVague = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    handleHighDprVague(canvas, ctx, this._dpr);
  };

  private _setCurrentTime = () => {
    this._currentTime = Date.now();
  };

  private _render = (renderOneFrame?: boolean) => {
    this._setCurrentTime();
    if (!this._enabled) return;
    // @todo 添加fps检测

    // 获取弹幕实例
    let renderDanmakus = this._danmakuLayout.getRenderDanmakus(this._currentTime);

    if (typeof this.renderConfig.danmakuFilter === 'function') {
      renderDanmakus = renderDanmakus.filter((danmaku) => this.renderConfig.danmakuFilter!(danmaku));
    }
    this._offscreenCanvasCtx.clearRect(0, 0, this._offscreenCanvas.width, this._offscreenCanvas.height);
    this._offscreenCanvasCtx.globalAlpha = this.renderConfig.opacity;

    // 渲染弹幕
    renderDanmakus.forEach((danmaku) => danmaku.render(this._offscreenCanvasCtx));
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.canvas.width) {
      this.ctx.drawImage(
        this._offscreenCanvas,
        0,
        0,
        this._offscreenCanvas.width,
        this._offscreenCanvas.height,
        0,
        0,
        this.canvasSize.width,
        this.canvasSize.height,
      );
    }

    if (!renderOneFrame) this._frameId = requestAnimationFrame(() => this._render());
  };

  get canvasSize() {
    return { width: this.canvas.width / this._dpr, height: this.canvas.height / this._dpr };
  }

  get enabled() {
    return !!this._enabled;
  }

  setDanmakus = (danmakus?: IDanmakuOptions[]) => {
    if (!Array.isArray(danmakus)) return;
    // 弹幕布局
    this._danmakuLayout.setDanmakus(danmakus);
  };

  /** 渲染一帧 */
  renderFrame: IDanmakuRenderer['renderFrame'] = () => {
    if (!this._frameId) {
      this._enableChange(true);
      this._render(true);
    }
  };

  private _enableChange = (enabled: boolean) => {
    this._enabled = enabled;
    this.container!.style.display = enabled ? 'block' : 'none';
    this.event.emit('enabled', { enabled: this._enabled });
  };

  pause: IDanmakuRenderer['pause'] = () => {
    if (this._frameId) cancelAnimationFrame(this._frameId);
    this._frameId = undefined;
  };

  setEnable: IDanmakuRenderer['setEnable'] = (enabled) => {
    // 过滤掉已经过期的弹幕
    this._danmakuLayout.filterDanmakus(Date.now() + this.renderConfig.delay);

    this._enableChange(!!enabled);
    if (enabled) {
      this._render();
    } else {
      // 进行关闭操作
      if (this._frameId) cancelAnimationFrame(this._frameId);
      this._frameId = undefined;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  send: IDanmakuRenderer['send'] = (danmakuOptions) => {
    this._danmakuLayout.send(danmakuOptions);
  };

  resize: IDanmakuRenderer['resize'] = () => {
    const { container, ctx, canvas } = this;
    if (!container) console.error('Unable to obtain container element');
    if (!ctx) console.error('Unable to obtain CanvasRenderingContext2D');
    if (!container || !ctx) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this._offscreenCanvas.width = container.clientWidth;
    this._offscreenCanvas.height = container.clientHeight;
    if (this.devConfig.scrollDebugMode) {
      this.devCanvas!.width = container.clientWidth;
      this.devCanvas!.height = container.clientHeight;
    }
  };
}
