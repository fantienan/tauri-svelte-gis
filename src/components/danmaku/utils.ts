import type {
  IBaseDanmaku,
  IDanmakuDevConfig,
  IDanmakuRenderConfig,
  IDanmakuRendererOptions,
  IImageFactory,
  IImageResult,
  IImageSectionOptions,
  IRealTrack,
  IRealTrackOptions,
  ITextSectionOptions,
  IVirtualTrack,
  IVirtualTrackOptions,
} from './types';

export class TextSection {
  readonly sectionType = 'text';
  text: string;
  width: number;
  height: number;
  topOffset!: number;
  leftOffset: number;

  constructor({ text, width, height, leftOffset }: ITextSectionOptions) {
    this.text = text;
    this.width = width;
    this.height = height;
    this.leftOffset = leftOffset;
  }
}

export class ImageSection {
  readonly sectionType = 'image';
  id: string;
  url: string;
  width: number;
  height: number;
  topOffset!: number;
  leftOffset: number;

  constructor({ id, url, width, height, leftOffset }: IImageSectionOptions) {
    this.id = id;
    this.url = url;
    this.width = width;
    this.height = height;
    this.leftOffset = leftOffset;
  }
}

/** 实际轨道 */
export class RealTrack implements IRealTrack {
  /** 实际轨道的唯一 id */
  private _id: number;
  /** 实际轨道的高度*/
  private _height: number;

  constructor(options: IRealTrackOptions) {
    this._id = options.id;
    this._height = options.height;
  }

  get id() {
    return this._id;
  }

  get top() {
    return (this._id - 1) * this._height;
  }
}

/**
 * 虚拟轨道，是实际轨道或者相邻实际轨道的合并
 */
export class VirtualTrack implements IVirtualTrack {
  /** 虚拟轨道id */
  private _id: number;
  danmakus: IVirtualTrack['danmakus'];
  /** 真实轨道实例 */
  realTracks: IVirtualTrack['realTracks'];
  /** 真实轨道映射 */
  realTrackMap: IVirtualTrack['realTrackMap'];
  constructor(options: IVirtualTrackOptions) {
    this._id = options.id;
    this.danmakus = [];
    this.realTracks = options.realTracks;
    this.realTrackMap = new Map(this.realTracks.map((realTrack) => [realTrack.id, realTrack]));
  }

  get id() {
    return this._id;
  }

  get grade() {
    return this.realTracks.length;
  }

  get top() {
    return this.realTracks[0].top;
  }

  /** 获取虚拟轨道中最后一个弹幕 */
  getLastDanmaku = () => this.danmakus[this.danmakus.length - 1];

  /** 是否有弹幕 */
  isEmpty = () => this.danmakus.length === 0;

  /** 清空虚拟轨道 */
  clear: IVirtualTrack['clear'] = () => {
    this.danmakus = [];
  };
}

export const defaultFontSize = 18;

export const defaultLineHeight = 1;

export const defaultDanmakuId = 'default';

// 默认渲染配置
export const defaultRenderConfig: IDanmakuRenderConfig = {
  fontFamily: 'Microsoft YaHei',
  fontWeight: 'normal',
  opacity: 1,
  renderRegion: 1,
  allowOverlap: false,
  speed: 100,
  delay: 600,
};

export const defaultDevConfig: IDanmakuDevConfig = {
  isRenderFPS: false,
  isRenderBarrageBorder: false,
  isLogKeyData: false,
  scrollDebugMode: false,
};

export const genDanmakuImageId = (id: string) => `[${id}]`;

export const sum = (arr: (number | { width: number })[]) => {
  return arr.reduce<number>((acc, cur) => acc + (typeof cur === 'number' ? cur : cur.width), 0);
};

/**
 * 图片工厂
 */
const imageMap = new Map<string, IImageResult>();

export const imageFactory: IImageFactory = (url) => {
  const cache = imageMap.get(url);
  if (cache) return cache;
  const image = new Image();
  imageMap.set(url, { status: 'loading' });
  image.onload = async () => {
    const imageBitmap = await createImageBitmap(image);
    imageMap.set(url, { status: 'success', value: imageBitmap });
  };
  image.onerror = (e) => {
    imageMap.set(url, { status: 'error' });
    console.warn(`Image load error: ${url}`, e);
  };
  image.src = url;
  imageMap.set(url, { status: 'loading' });
  return { status: 'loading' };
};

/** 根据二分查找法插入弹幕 */
export const insertDanmakuByTime = (danmakus: IBaseDanmaku[], danmaku: IBaseDanmaku) => {
  let left = 0;
  let right = danmakus.length - 1;
  let mid = 0;
  while (left <= right) {
    mid = Math.floor((left + right) / 2);
    if (danmakus[mid].time < danmaku.time) {
      left = mid + 1;
    } else if (danmakus[mid].time > danmaku.time) {
      right = mid - 1;
    }
  }
  danmakus.splice(mid, 0, danmaku);
};

/** 在给定范围内随机整数 */
export const genRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/** 计算众数 */
export const mode = (array: number[]) => {
  if (array.length === 0) return null;
  const modeMap: { [key: number]: number } = {};
  let maxEl = array[0],
    maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const el = array[i];
    modeMap[el] = modeMap[el] == null ? 1 : modeMap[el] + 1;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return parseInt(maxEl.toString());
};

/** 获取时分秒时间戳 */
export const getHMSTimestamp = (time: number) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const timestamp = hours * 60 * 60 + minutes * 60 + seconds;
  return timestamp * 1000;
};

/** 获取一天开始的时间戳 */
export const getStartOfDayTimestamp = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const genContainer = (container: IDanmakuRendererOptions['container']) => {
  let _container: HTMLElement | null = null;
  if (typeof container === 'string') _container = document.querySelector(container);
  if (!_container) _container = document.createElement('div');
  return _container;
};
