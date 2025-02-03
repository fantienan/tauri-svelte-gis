import { RealTrack, VirtualTrack, genRandomInt, getStartOfDayTimestamp, mode } from './utils';
import type {
  IDanmakuRenderer,
  IRealTrack,
  IScrollDanmaku,
  IScrollDanmakuLayout,
  IScrollDanmakuLayoutOptions,
  IScrollRenderDanmakusResult,
  IVirtualTrack,
} from './types';

export class ScrollDanmakuLayout implements IScrollDanmakuLayout {
  private _dr: IDanmakuRenderer;
  /** 最高弹幕所占虚拟轨道的grade */
  // private _maxGrad!: number;
  /** 实际轨道 */
  private _realTracks: IRealTrack[] = [];
  /** 虚拟轨道 */
  private _virtualTracks: IVirtualTrack[] = [];
  /** 实际轨道的高度 */
  private _realTrackHeight!: number;
  /** 实际轨道的数量 */
  private _realTrackNum!: number;
  /** 弹幕与虚拟轨道的映射 */
  private _gradeToVirtualTrack: Map<number, IVirtualTrack[]>;
  /** 轨道间隔 */
  private _trackGap: number;
  /**
   * 虚拟轨道和其它虚拟轨道的映射
   * 映射条件：
   * 虚拟轨道的grade小于等于maxGrade
   * 虚拟轨道中的实际轨道与其它虚拟轨道中的实际轨道有交集
   * 使用场景：
   * 计算弹幕放到哪个虚拟轨道中时，可以减小计算量，从当前虚拟轨道可以得到可以插入弹幕的其它虚拟轨道
   */
  // private _virtualTrackToVirtualTracks: Map<IVirtualTrack, IVirtualTrack[]>;

  constructor(options: IScrollDanmakuLayoutOptions) {
    this._dr = options.danmakuRenderer;
    this._trackGap = 10;
    this._gradeToVirtualTrack = new Map();
    // this._virtualTrackToVirtualTracks = new Map();
  }

  /** 初始化轨道 */
  private _initTracks = (realTrackHeight: number) => {
    this.resetTracks();
    // 实际轨道数量
    const realTrackNum = Math.floor((this._dr.canvasSize.height * this._dr.renderConfig.renderRegion) / realTrackHeight);
    this._realTrackHeight = realTrackHeight;
    this._realTrackNum = realTrackNum;

    for (let i = 1; i <= realTrackNum; i++) {
      this._realTracks.push(new RealTrack({ id: i, height: realTrackHeight }));
    }

    // 创建虚拟轨道
    for (let grade = 1; grade <= realTrackNum; grade++) {
      // 创建级别为 i 的虚拟轨道
      // 级别为 grade 虚拟轨道的个数是
      const iVirtualTrackNum = realTrackNum - (grade - 1);
      const virtualTracks: IVirtualTrack[] = [];
      for (let i = 1; i <= iVirtualTrackNum; i++) {
        const startIndex = i - 1;
        const endIndex = i - 1 + grade;
        virtualTracks.push(new VirtualTrack({ id: i, realTracks: this._realTracks.slice(startIndex, endIndex) }));
      }
      this._virtualTracks.push(...virtualTracks);
      this._gradeToVirtualTrack.set(grade, virtualTracks);
    }

    // 虚拟轨道和其它虚拟轨道的映射
    // this._virtualTracks.forEach((virtualTrack) => {
    //   this._virtualTrackToVirtualTracks.set(
    //     virtualTrack,
    //     this._virtualTracks.filter((v) => v.grade <= this._maxGrad && virtualTrack.realTracks.some((rt) => v.realTrackMap.has(rt.id))),
    //   );
    // });

    // 日志打印
    if (this._dr.devConfig.isLogKeyData) {
      console.table([
        { item: '实际轨道高度', value: realTrackHeight },
        { item: '实际轨道数量', value: this._realTracks.length },
        { item: '虚拟轨道数量', value: this._virtualTracks.length },
      ]);
    }
    if (this._dr.devConfig.scrollDebugMode) {
      this._dr.devCanvas!.style.border = '1px solid red';
      this._dr.devCanvas!.style.boxSizing = 'border-box';
      const ctx = this._dr.devCtx;
      ctx!.beginPath();
      ctx!.setLineDash([5, 15]);
      for (let i = 0; i < this._realTracks.length; i++) {
        if (i !== 0) {
          ctx!.moveTo(0, this._realTracks[i].top);
          ctx!.lineTo(this._dr.canvasSize.width, this._realTracks[i].top);
        }
      }
      ctx!.stroke();
    }
  };

  /**
   * 获取一个随机的实际轨道
   */
  private _getRandomRealTrack() {
    return this._realTracks[genRandomInt(0, this._realTracks.length - 1)];
  }

  /** 随机一个实际轨道 */
  private _randomTrackDanmaku = (danmaku: IScrollDanmaku) => {
    danmaku.top = this._getRandomRealTrack().top;
    danmaku.show = true;
  };

  /** 布局允许重叠的弹幕 */
  private _allowOverlapLayout = (danmakus: IScrollDanmaku[]) => {
    danmakus.forEach((danmaku) => this._randomTrackDanmaku(danmaku));
  };

  /** 布局不允许重叠的弹幕 */
  private _avoidOverlapLayout = (danmakus: IScrollDanmaku[]) => {
    const startTime = Date.now();
    // 清空虚拟轨道弹幕
    this._virtualTracks.forEach((virtualTrack) => virtualTrack.clear());
    danmakus.forEach((danmaku) => {
      if (danmaku.id === 'interanl') {
        danmaku.top = this._realTracks[Math.floor(this._realTrackNum / 2) - 1].top;
        return;
      }
      danmaku.show = false;
      // 根据弹幕grad获取虚拟轨道
      const gradeToVirtualTrack = this._gradeToVirtualTrack.get(danmaku.grade) ?? [];
      // 遍历虚拟轨道，找到可以插入弹幕的轨道，
      // 可插入条件： 从与当前弹幕grade相同的虚拟轨道中计算，虚拟轨道没有弹幕或者虚拟轨道的最后一个弹幕的右边界小于当前弹幕的左边界
      for (let i = 0; i < gradeToVirtualTrack.length; i++) {
        const virtualTrack = gradeToVirtualTrack[i];
        const lastDanmaku = virtualTrack.getLastDanmaku();
        const canPush = !lastDanmaku || lastDanmaku.originalRight < danmaku.originalLeft;
        if (canPush) {
          virtualTrack.danmakus.push(danmaku);
          danmaku.top = virtualTrack.top;
          danmaku.show = true;
          break;
        }
      }
      // 如果重要弹幕没有可插入的轨道，则随机一个轨道
      if (danmaku.prior && !danmaku.show) this._randomTrackDanmaku(danmaku);
    });

    if (this._dr.devConfig.isLogKeyData) console.log(`虚拟轨道计算耗时：${Date.now() - startTime}`);
  };

  /** 不允许重叠，插入新弹幕 */
  private _avoidOverlapInsert = (danmaku: IScrollDanmaku) => {
    const gradeToVirtualTrack = this._gradeToVirtualTrack.get(danmaku.grade) ?? [];
    danmaku.show = false;
    for (let i = 0; i < gradeToVirtualTrack.length; i++) {
      const virtualTrack = gradeToVirtualTrack[i];
      const lastDanmaku = virtualTrack.getLastDanmaku();
      const canPush = !lastDanmaku || lastDanmaku.originalRight < danmaku.originalLeft;
      if (canPush) {
        virtualTrack.danmakus.push(danmaku);
        danmaku.top = virtualTrack.top;
        danmaku.show = true;
        break;
      }
    }
    if (danmaku.prior && !danmaku.show) this._randomTrackDanmaku(danmaku);
  };

  /** 计算弹幕占据实际轨道数量，与虚拟轨道grade相对应 */
  private _genDanmakuGrade = (danmaku: IScrollDanmaku) => {
    danmaku.grade = Math.ceil(danmaku.height / this._realTrackHeight!);
  };

  getRenderDanmakus: IScrollDanmakuLayout['getRenderDanmakus'] = (danmakus, time) => {
    const translateX = (Math.abs(time - getStartOfDayTimestamp()) / 1000) * this._dr.renderConfig.speed;
    return danmakus.reduce<IScrollRenderDanmakusResult>(
      (acc, cur) => {
        const diffValue = cur.originalRight - translateX;
        if (cur.show && cur.top !== undefined && diffValue >= 0) {
          cur.left = cur.originalLeft - translateX;
          acc.renderDanmakus.push(cur);
        }
        if (diffValue >= 0) acc.danmakus.push(cur);
        return acc;
      },
      { renderDanmakus: [], danmakus: [] },
    );
  };

  resetTracks: IScrollDanmakuLayout['resetTracks'] = () => {
    this._realTracks = [];
    this._virtualTracks = [];
  };

  /** 弹幕布局 */
  layout: IScrollDanmakuLayout['layout'] = (danmakus) => {
    if (!Array.isArray(danmakus) || danmakus.length === 0) return;
    // 计算弹幕轨道高度
    const realTrackHeight = mode(danmakus.map((danmaku) => danmaku.height))! + this._trackGap;
    // 计算最高弹幕占虚拟轨道的 grad
    // this._maxGrad = Math.max(...danmakus.map((d) => d.height)) / realTrackHeight!;
    // 先判断当前有没有进行虚拟轨道和实际轨道的初始化，没有的话，进行初始化
    if (!this._realTracks.length || !this._virtualTracks.length) {
      // 计算实际轨道的高度，出于性能以及弹幕实际渲染效果的考虑，取所有弹幕高度向上取整的众数；
      this._initTracks(realTrackHeight!);
    }

    // 计算所有滚动弹幕实际占据几个实际轨道
    danmakus.forEach((danmaku) => this._genDanmakuGrade(danmaku));

    // 进行布局处理
    if (this._dr.renderConfig.allowOverlap) {
      this._allowOverlapLayout(danmakus);
    } else {
      this._avoidOverlapLayout(danmakus);
    }
  };

  send: IScrollDanmakuLayout['send'] = (danmaku) => {
    // 计算弹幕所占轨道数，与虚拟轨道的 grade 对应
    this._genDanmakuGrade(danmaku);
    // 允许重叠的情况下，随机一个实际轨道
    if (this._dr.renderConfig.allowOverlap) {
      this._randomTrackDanmaku(danmaku);
    } else {
      this._avoidOverlapInsert(danmaku);
    }
  };
}
