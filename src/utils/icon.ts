import { handleHighDprVague } from './canvas';

const loadImg = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const svgToImage = (svgStr: string) => {
  return loadImg(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`);
};

export const htmlToImage = (htmlStr: string) => {
  return loadImg(`data:text/html;charset=utf-8,${encodeURIComponent(htmlStr)}`);
};

export const image2Base64 = (image: ImageBitmap | HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('image2Base64 error: Unable to obtain CanvasRenderingContext2D');
    return '';
  }
  handleHighDprVague(canvas, ctx);
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL();
};
