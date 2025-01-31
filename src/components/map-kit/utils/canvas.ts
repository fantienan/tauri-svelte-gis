/** 获取设备缩放比 */
export const getDevicePixelRatio = () => {
  // 先创建一个 canvas 元素
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  // 获取绘图环境
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = canvas.getContext('2d') as any;

  // 获取当前环境（例如 window）的设备像素比，获取不到的话，就取 1
  const devicePixelRatio = window.devicePixelRatio || 1;
  // backingStorePixelRatio 属性：该属性决定了浏览器在渲染 canvas 以前会用几个像素来存储画布信息
  // 这个属性在 safari6.0 中是 2，在其他浏览器中都是 1
  const backingStoreRatio =
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  // 这样计算应该是为了额外处理 safari6.0 的情况，因为其他浏览器该属性都是 1
  const _pixelRatio = devicePixelRatio / backingStoreRatio;
  // 释放刚刚创建的 canvas 元素
  canvas.width = canvas.height = 0;
  // 返回计算的结果
  return _pixelRatio;
};

/** 处理canvas 模糊问题 */
export const handleHighDprVague = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dpr?: number
) => {
  const _dpr = dpr ?? getDevicePixelRatio();
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  canvas.width = oldWidth * _dpr;
  canvas.height = oldHeight * _dpr;
  canvas.style.width = `${oldWidth}px`;
  canvas.style.height = `${oldHeight}px`;
  ctx.scale(_dpr, _dpr);
  ctx.textBaseline = 'hanging';
};
