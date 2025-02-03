import type { Emitter } from 'mitt';

export interface IBaseDanmaku {
  /** 弹幕id */
  id: string;
  /** 弹幕尺寸 */
  width: number;
  height: number;
  left: number;
  top: number;
  /** 发送弹幕的时间 毫秒为单位的时分秒时间戳 */
  time: number;
  /** 重要弹幕，例如自己发的弹幕 */
  prior?: boolean;
  /** 渲染弹幕 */
  render: (ctx: CanvasRenderingContext2D) => void;
  /** 弹幕发送时间与当天0点0分0秒差值的绝对值，弹幕毫秒 */
  diffStartOfDayToTime: number;
  /** 弹幕类型 */
  danmakuType: IDanmakuType;
}

export type IBaseDanmakuOptions = Pick<IBaseDanmaku, 'time'> & {
  /** 弹幕的唯一标识 */
  id: string;
  /** 弹幕的文本内容 */
  text: string;
  /** 弹幕的字体大小 */
  fontSize?: number;
  /** 弹幕的行高 */
  lineHeight?: number;
  /** 弹幕自定义渲染器 */
  danmakuCustomRender?: IDanmakuCustomRender;
  /** 是否是重要弹幕，例如自己发的弹幕 */
  prior?: boolean;
  /** 弹幕文字颜色 */
  color?: string;
  /** 弹幕类型 */
  danmakuType: IDanmakuType;
};

/**
 * 弹幕的类型
 * scroll：滚动弹幕
 * top：顶部弹幕
 * bottom：底部弹幕
 * senior：高级弹幕
 */
export type IDanmakuType = 'scroll' | 'top' | 'bottom' | 'senior';

/** 解析完成的片段 */
export type IDanmakuSegment = {
  type: 'text' | 'image';
  value: string;
};

export type IDanmakuImage = {
  /* 弹幕图片的唯一标识 */
  id: string;
  /* 图片的地址 */
  url: string;
  /* 渲染时的宽 */
  width: number;
  /* 渲染时的高 */
  height: number;
};

export interface IDanmakuRenderer extends Pick<IDanmakuLayout, 'send'> {
  /** 事件 */
  event: Emitter<IDanmakuRendererEvent>;
  /** canvas 元素 */
  canvas: HTMLCanvasElement;
  /** canvas 容器 */
  container?: HTMLElement;
  /** 弹幕图片 */
  danmakuImages: IDanmakuImage[];
  /** 画布上下文 */
  ctx: CanvasRenderingContext2D;
  /** 渲染配置 */
  renderConfig: IDanmakuRenderConfig;
  /** 开发配置 */
  devConfig: IDanmakuDevConfig;
  /** 弹幕是否开启 */
  enabled: boolean;
  /** 暂停 */
  pause: () => void;
  /** 渲染一帧 */
  renderFrame: () => void;
  /** 开关弹幕 */
  setEnable: (enable: boolean) => void;
  /** 画布尺寸 */
  canvasSize: { width: number; height: number };
  /** 设置弹幕数据 */
  setDanmakus: (danmakus: IDanmakuOptions[]) => void;
  /** 重新计算canvas尺寸 */
  resize: () => void;
  devCanvas?: HTMLCanvasElement;
  devCtx?: CanvasRenderingContext2D;
}

export type IDanmakuRendererOptions = {
  /** 弹幕容器 */
  container?: HTMLElement | string;
  /* 弹幕图片 */
  danmakuImages: IDanmakuImage[];
  /** 渲染配置 */
  renderConfig?: Partial<IDanmakuRenderConfig>;
  /** 开发配置 */
  devConfig?: Partial<IDanmakuDevConfig>;
  /** 弹幕数据 */
  danmakus?: IDanmakuOptions[];
};

/**
 * 弹幕渲染器渲染弹幕的配置
 */
export type IDanmakuRenderConfig = {
  /** 弹幕字体 */
  fontFamily: string;
  /* 字体粗细 */
  fontWeight: string;
  /** 重要弹幕自定义渲染器 */
  priorCustomRender?: IDanmakuCustomRender['render'];
  /** 弹幕过滤 */
  danmakuFilter?: (danmakus: IBaseDanmaku) => boolean | undefined | void;
  /** 透明度 0-1 */
  opacity: number;
  /** 弹幕显示区域，只针对滚动弹幕，有效值 0 ~ 1 */
  renderRegion: number;
  /**  弹幕运行速度，仅对滚动弹幕有效（每秒多少像素） */
  speed: number;
  /** 弹幕是否允许重叠  */
  allowOverlap: boolean;
  /** 延时播放 毫秒 */
  delay: number;
};

/**
 * 描述弹幕内容中的文本片段
 */
export type ITextSectionOptions = {
  // 文本片段的内容
  text: string;
  // 这段文本的宽高
  width: number;
  height: number;
  // 当前片段相较于整体弹幕 top 和 left 的偏移量
  topOffset?: number;
  leftOffset: number;
};

/**
 * 描述弹幕内容中的图片片段
 */
export type IImageSectionOptions = IDanmakuImage & {
  // 当前片段相较于整体弹幕 top 和 left 的偏移量
  topOffset?: number;
  leftOffset: number;
};

export interface IDanmakuTextSection {
  sectionType: 'text';
  text: string;
  width: number;
  height: number;
  topOffset: number;
  leftOffset: number;
}

export interface IDanmakuImageSection {
  sectionType: 'image';
  id: string;
  url: string;
  width: number;
  height: number;
  topOffset: number;
  leftOffset: number;
}

export type IDanmakuSection = IDanmakuTextSection | IDanmakuImageSection;

/**
 * 开发相关配置
 */
export type IDanmakuDevConfig = {
  /* 是否渲染 fps */
  isRenderFPS: boolean;
  /* 是否渲染弹幕边框 */
  isRenderBarrageBorder: boolean;
  /* 是否打印关键数据 */
  isLogKeyData: boolean;
  /** 滚动弹幕调试模式 */
  scrollDebugMode: boolean;
};

/**
 * 自定义 render 函数
 */
export type IDanmakuCustomRender = {
  render: (options: IDanmakuCustomRenderOptions) => void;
  width?: number;
  height?: number;
};

/**
 * 自定义 render 函数的参数
 */
export type IDanmakuCustomRenderOptions = {
  /* 渲染上下文 */
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  /* 渲染的弹幕实例 */
  danmaku: IBaseDanmaku;
  /* 渲染器实例 */
  dr: IDanmakuRenderer;
  /* 缓存获取图片的工厂方法 */
  imageFactory: IImageFactory;
};

export interface IDanmakuLayout {
  /** 设置弹幕 */
  setDanmakus: (danmakuOptions: IDanmakuOptions[]) => void;
  /** 过滤弹幕 */
  filterDanmakus: (time: number) => void;
  /** 发弹幕 */
  send: (danmakuOption: IDanmakuOptions) => void;
  /** 获取弹幕实例 */
  getRenderDanmakus: (time: number) => IBaseDanmaku[];
}

export type IDanmakuLayoutOptions = {
  danmakuRenderer: IDanmakuRenderer;
};

export type IFixedDanmakuOptions = IBaseDanmakuOptions & {
  danmakuType: 'top' | 'bottom';
  /** @description 弹幕持续时间 单位秒 */
  duration?: number;
};

export interface IFixedDanmaku extends IBaseDanmaku {
  readonly danmakuType: 'top' | 'bottom';
  endTime: number;
  calcFixedDanmakuPosition: () => void;
}

export interface IScrollDanmaku extends IBaseDanmaku {
  readonly danmakuType: 'scroll';
  /** 用于描述滚动弹幕在播放进度为 0 时，滚动弹幕左侧距离 Canvas 左侧的距离 */
  originalLeft: number;
  /** 用于描述滚动弹幕在播放进度为 0 时，滚动弹幕右侧距离 Canvas 左侧的距离 */
  originalRight: number;
  /** 标识当前的滚动弹幕是否应该显示，当设置不允许遮挡的话，部分滚动弹幕会不显示 */
  show: boolean;
  /** 当前弹幕会占据几个实际轨道 */
  grade: number;
}

export type IScrollDanmakuOptions = IBaseDanmakuOptions & {
  /** 弹幕类型 */
  danmakuType: 'scroll';
};

export type IDanmakuOptions = IFixedDanmakuOptions | IScrollDanmakuOptions;

export interface IFixedDanmakuLayout {
  /** 发送弹幕 */
  send: (danmaku: IFixedDanmaku) => void;
  /** 获取可渲染的弹幕 */
  getRenderDanmakus: (danmakus: IFixedDanmaku[], time: number) => IFixedRenderDanmakusResult;
}

export type IFixedRenderDanmakusResult = {
  renderDanmakus: IFixedDanmaku[];
  danmakus: IFixedDanmaku[];
};

export type IFixedDanmakuLayoutOptions = {
  danmakuRenderer: IDanmakuRenderer;
};

export interface IScrollDanmakuLayout {
  /** 弹幕布局 */
  layout: (danmakus: IScrollDanmaku[]) => void;
  /** 发送弹幕 */
  send: (danmakus: IScrollDanmaku) => void;
  /** 重置轨道 */
  resetTracks: () => void;
  /** 获取可以渲染的弹幕 */
  getRenderDanmakus: (danmakus: IScrollDanmaku[], time: number) => IScrollRenderDanmakusResult;
}

export type IScrollRenderDanmakusResult = {
  renderDanmakus: IScrollDanmaku[];
  danmakus: IScrollDanmaku[];
};

export type IScrollDanmakuLayoutOptions = {
  danmakuRenderer: IDanmakuRenderer;
};

export interface IRealTrack {
  /** 当前实际轨道的 id */
  id: number;
  /** 当前实际轨道的 top */
  top: number;
}
export type IRealTrackOptions = { id: number; height: number };
export interface IVirtualTrack {
  /** 虚拟轨道id */
  id: number;
  /** 弹幕数组 */
  danmakus: IScrollDanmaku[];
  /** 真实轨道实例 */
  realTracks: IRealTrack[];
  /** 真实轨道映射 */
  realTrackMap: Map<number, IRealTrack>;
  /** 虚拟轨道占的实际轨道数量 */
  grade: number;
  /** 获取虚拟轨道中最后一个弹幕 */
  getLastDanmaku: () => IScrollDanmaku | undefined;
  /** 清空虚拟轨道弹幕 */
  clear: () => void;
  /** 是否有弹幕 */
  isEmpty: () => boolean;
  top: number;
}
export type IVirtualTrackOptions = Pick<IVirtualTrack, 'id'> & {
  /** 真实轨道实例 */
  realTracks: IRealTrack[];
};

export type IImageResult = { status: 'loading' | 'success' | 'error'; value?: ImageBitmap };

export type IImageFactory = (url: string) => IImageResult;

export type IDanmakuRendererEvent = {
  enabled: { enabled: boolean };
};
