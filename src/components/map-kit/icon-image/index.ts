import stroke1Svg from '@/assets/svgs/marker-stroke1.svg?raw';
import stroke2Svg from '@/assets/svgs/marker-stroke2.svg?raw';
import stroke3Svg from '@/assets/svgs/marker-stroke3.svg?raw';
import stroke4Svg from '@/assets/svgs/marker-stroke4.svg?raw';
import type { ISMap } from '../smap';

export interface IIconImage {
  name: string;
  map: ISMap;
  iconImageList: IIconImageRecord[];
  iconColorList: string[];
  defaultColor: string;
  defaultIconImage: string;
  getIconImageRecord: (iconImage: string) => IIconImageRecord | undefined;
  updateIconImage: (options: { color?: string; iconImage: string }) => void;
  getIconImage: (options: { color?: string; record: IIconImageRecord }) => string;
  genIconImageId: (iconImage: string, color?: string) => string;
}

export type IIconImageOptions = Pick<IIconImage, 'map'>;

export type IIconImageRecord = {
  iconImage: string;
  svgStr: string;
};

const getIconList = (): IIconImageRecord[] => [
  { iconImage: 'smap-marker1', svgStr: stroke1Svg },
  { iconImage: 'smap-marker2', svgStr: stroke2Svg },
  { iconImage: 'smap-marker3', svgStr: stroke3Svg },
  { iconImage: 'smap-marker4', svgStr: stroke4Svg },
];

export class IconImage implements IIconImage {
  name: IIconImage['name'];
  map: IIconImage['map'];
  iconImageList: IIconImage['iconImageList'];
  iconColorList: IIconImage['iconColorList'];
  defaultColor: IIconImage['defaultColor'];
  defaultIconImage: IIconImage['defaultIconImage'];
  constructor(options: IIconImageOptions) {
    this.name = 'icon-image';
    this.map = options.map;
    this.iconColorList = ['#4265FF', '#E1361B', '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#0693E3', '#ABB8C3'];
    this.iconImageList = getIconList();
    this.defaultColor = this.iconColorList[0];
    this.defaultIconImage = this.iconImageList[0].iconImage;
    this._init();
  }

  private _init = () => {
    this.iconImageList.forEach((item) => this.map.addImage(this.genIconImageId(item.iconImage, this.defaultColor), item.svgStr));
  };

  getIconImageRecord: IIconImage['getIconImageRecord'] = (iconImage) => {
    return this.iconImageList.find((item) => item.iconImage === iconImage);
  };

  getIconImage: IIconImage['getIconImage'] = ({ color, record }) => {
    if (color) {
      const iconImage = record.svgStr
        .replace(/stop-color="#[0-9A-Fa-f]{6}"/g, `stop-color="${color}"`)
        .replace(/linearGradient-#[0-9A-Fa-f]{6}-#[0-9A-Fa-f]{6}/g, `linearGradient-${color}-${color}`);
      return iconImage;
    }
    return record.svgStr;
  };

  updateIconImage: IIconImage['updateIconImage'] = ({ color, iconImage: iconImageId }) => {
    const record = this.getIconImageRecord(iconImageId);
    if (!record) return;
    if (color) {
      const iconImage = record.svgStr.replace(/stop-color="#[0-9A-Fa-f]{6}"/g, `stop-color="${color}"`);
      const id = this.genIconImageId(record.iconImage, color);
      if (this.map.hasImage(id)) this.map.updateImage(id, iconImage);
      else this.map.addImage(id, iconImage);
      return;
    }
    if (this.map.hasImage(iconImageId)) this.map.updateImage(iconImageId, record.svgStr);
    else this.map.addImage(iconImageId, record.svgStr);
  };

  genIconImageId: IIconImage['genIconImageId'] = (iconImage, color) => (color ? `${iconImage}-${color}` : iconImage);
}
