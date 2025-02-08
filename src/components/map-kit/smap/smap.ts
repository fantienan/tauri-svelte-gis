/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  initGeovisEarth,
  addGeovisVectorTilesLayer
  // addGeovisImageLayer,
  // addGeovisMapLayer,
  // addGeovisSubwayLayer,
  // addGeovisVectorTilesNoteLayer,
  // addGeovisWhiteModelLayer,
} from '@gvol-org/geovis-mapbox-sdk';
import { geovisWorker } from '@gvol-org/geovis-mapbox-sdk/geovis-worker-v3.js'; //mapboxgl-v3.x版本使用
import mapboxgl, { Map } from 'mapbox-gl';
import { Draw } from '../draw';
import { GeoJsonSourceHelper } from '../sources';
import { MarkerFeature } from '../marker-feature';
import { FeatureHelper } from '../feature';
import { MapMarker } from '../map-marker';
import { IconImage } from '../icon-image';
import { GeographyPhotos } from '../geography-photos';
import { interceptRequest } from './utils';
import type { MapboxOptions, EaseToOptions, AnySourceImpl } from 'mapbox-gl';
import type {
  ISMap,
  ISMapGeoJsonSource,
  ISMapLayerMetadata,
  ISMapModule,
  ISMapOptions,
  ISMapRasterLayerSpecifcation
} from './types';
import { bbox } from '@turf/turf';
import { getConfig } from '@/utils';

type IInternalModule<T = any> = ISMapModule<T> & {
  queue: [
    (value: ISMapModule<T>['value'] | PromiseLike<ISMapModule<T>['value']>) => void,
    (reason?: any) => void
  ][];
};

const { SM_GEOVIS_TOKEN, SM_MAPBOX_TOKEN } = getConfig();

const defaultMapOptions: MapboxOptions = {
  container: 'map',
  accessToken: SM_MAPBOX_TOKEN,
  center: [112.32716994959941, 32.8823769011904],
  projection: { name: 'globe' },
  preserveDrawingBuffer: true,
  pitch: 0,
  bearing: 0,
  zoom: 4
};

const defaultRestorationOptions: EaseToOptions = {
  center: defaultMapOptions.center,
  pitch: defaultMapOptions.pitch,
  bearing: defaultMapOptions.bearing,
  zoom: defaultMapOptions.zoom
};

initGeovisEarth(mapboxgl, geovisWorker, SM_MAPBOX_TOKEN);

export class SMap extends Map implements ISMap {
  featureHelper: ISMap['featureHelper'];
  dispatch: ISMap['dispatch'];
  private _modules: Record<string, IInternalModule> = {};
  constructor({ dispatch, ...resetOptions }: ISMapOptions) {
    const options = { ...defaultMapOptions, ...resetOptions };
    interceptRequest(`access_token=${options.accessToken}`);
    super(options);
    this.dispatch = ({ type, ...reset }: any) => {
      this.fire(type, reset);
      dispatch?.({ target: this, type, ...reset });
    };
    this.featureHelper = new FeatureHelper();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__smap = this;
    this.once('style.load', () => {
      this._useIconImage();
      this._useMapMarker();
      // this._useGeovis();
      this._useDraw();
      this._useGeographyPhotos();
      this._useMarkerFeature();
      this._useAIDiscern();
    });
  }

  override addLayer(layer: mapboxgl.AnyLayer, before?: string): this {
    const res = super.addLayer(layer, before);
    this.orderLayer();
    return res;
  }

  override getSource(id: string): AnySourceImpl {
    const source = super.getSource(id);
    if (source?.type === 'geojson' && !(source as any).rawSource) {
      // 将GeoJSONSourceHelper的方法混入到source对象中
      Object.assign(
        source,
        new GeoJsonSourceHelper({ map: this, sourceId: id, rawSource: source })
      );
      return source as ISMapGeoJsonSource;
    }
    return source;
  }

  override updateImage(
    name: string,
    image:
      | HTMLImageElement
      | ArrayBufferView
      | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
      | ImageData
      | ImageBitmap
      | string
  ): void {
    if (typeof image === 'string') {
      if (image.includes('<svg')) {
        const img = new Image();
        img.onload = () => super.updateImage(name, img);
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(image)}`;
        return;
      }
      console.warn('updateImage: svg图标失败');
      return;
    }
    super.updateImage(name, image);
  }

  override addImage(
    name: string,
    image:
      | HTMLImageElement
      | ArrayBufferView
      | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
      | ImageData
      | ImageBitmap
      | string,
    options?: {
      pixelRatio?: number | undefined;
      sdf?: boolean | undefined;
      stretchX?: Array<[number, number]> | undefined;
      stretchY?: Array<[number, number]> | undefined;
      content?: [number, number, number, number] | undefined;
    }
  ): void {
    if (typeof image === 'string') {
      if (image.includes('<svg')) {
        const img = new Image();
        img.onload = () => {
          if (!super.hasImage(name)) super.addImage(name, img, options);
        };

        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(image)}`;
        return;
      }
      console.warn('addImage: svg图标失败');
      return;
    }
    super.addImage(name, image as any, options);
  }

  private _useGeographyPhotos = () => {
    const geographyPhotos = new GeographyPhotos({ map: this });
    this.addModule({ name: geographyPhotos.name, value: geographyPhotos });
  };

  private _useMarkerFeature = () => {
    const markerFeature = new MarkerFeature({
      map: this,
      name: 'marker-feature',
      defaultIconImage: this.iconImage.defaultIconImage,
      defaultColor: this.iconImage.defaultColor,
      getExternalLayerIds: () => this.geographyPhotos.getLayerIds()
    });
    this.addModule({ name: markerFeature.name, value: markerFeature });
  };

  private _useIconImage = async () => {
    const iconImage = new IconImage({ map: this });
    this.addModule({ name: iconImage.name, value: iconImage });
  };

  private _useDraw = () => {
    const draw = new Draw({
      map: this,
      /** 双击落点或者落点与其它节点重合时是否禁止完成绘制 */
      disabledClickOnVertex: false,
      /** 受否忽略双击落点或者落点与其它节点重合的检测 */
      ignoreClickOnVertex: false,
      /** 当点击源的元素有selector时，阻止触发高亮图斑点击事件 */
      stopPropagationClickActiveFeatureHandlerClassName: '',
      /** 编辑模式下点击图形以外部分不退出编辑模式, 默认true */
      clickNotthingNoChangeMode: true,
      /** simple_select mode 下禁止拖拽节点，点要素在simple_select mode 下才允许编辑 */
      disabledDragVertexWithSimpleSelectMode: false,
      /** 禁止拖拽 */
      disabledDrag: false,
      /** 禁止选中 */
      disableSelect: false,
      styles: Draw.lib.theme,
      userProperties: true,
      measureOptions: {
        enable: false
      }
    });
    this.addControl(draw);
    this.addModule({ name: draw.name, value: draw });
    this.once('draw.onAdd', (e) => {
      const { layers = [] } = this.getStyle() ?? {};
      const layer = layers[layers.length - 1];
      if (layer) {
        this.moveLayer(this.markerFeature.layerIds.fill, layer.id);
        this.moveLayer(this.markerFeature.layerIds.line, layer.id);
        this.moveLayer(this.markerFeature.layerIds.point, layer.id);
        this.moveLayer(layer.id, this.markerFeature.layerIds.fill);
      }
      this.dispatch(e);
    });
  };

  private _useGeovis = () => {
    //创建影像图层
    // addGeovisImageLayer({ token: SM_GEOVIS_TOKEN, map: this });
    //创建矢量瓦片标记地图
    // addGeovisVectorTilesNoteLayer({ token: SM_GEOVIS_TOKEN, map: this });
    //添加地铁图层
    // addGeovisSubwayLayer({ token: SM_GEOVIS_TOKEN, id: 'zkxt-vector-tile-subway', map: this });

    //创建矢量图层
    // addGeovisMapLayer({ token: SM_GEOVIS_TOKEN, map: this });
    //创建地形晕渲
    // addGeovisTerrainShadingLayer({ token:SM_GEOVIS_TOKEN, map: this })
    //创建地形注记
    // addGeovisImageNoteLayer({ token:SM_GEOVIS_TOKEN, map: this })
    //添加地形
    // addGeovisTerrainLayer({ token: SM_GEOVIS_TOKEN, map: this });

    //创建矢量瓦片影像+标记图层
    addGeovisVectorTilesLayer({ token: SM_GEOVIS_TOKEN, map: this, id: 'zkxt-vector-tile' });
    addGeovisVectorTilesLayer({ token: SM_GEOVIS_TOKEN, map: this, id: 'zkxt-vector-tile-subway' });

    //通过sourceId设置图层显隐
    // setLayersVisibilityBySource({ token:SM_GEOVIS_TOKEN, map }, 'sourceId', false);

    //添加白模图层,默认为矢量瓦片格式加载。当type参数为3dtiles_ter时，使用3dtiles格式有地形加载;当type参数为3dtiles时，使用3dtiles格式无地形加载。
    // addGeovisWhiteModelLayer({ token: SM_GEOVIS_TOKEN, type: '3dtiles_ter', map: this });

    //添加经纬网图层
    // addGeovisGraticulesLayer({ map: this });
    //移除经纬网图层
    // removeGeovisGraticulesLayer(graticules);
    //添加3dtiles图层
    // addGeovis3dTilesLayer({ id: '图层id', url: '<3dtiles地址,tileset.json文件路径>' });

    //在线地图
    //添加天地图矢量图层,默认图层Id:TianDiTuVector
    // addTianDiTuVectorLayer({ token: '<天地图 Token>', map: this });
    //添加天地图矢量注记图层,默认图层Id:TianDiTuVectorNote
    // addTianDiTuVectorNoteLayer({ token: '<天地图 Token>', map: this });
    //添加天地图影像图层,默认图层Id:TianDiTuImage
    // addTianDiTuImageLayer({ token: '<天地图 Token>', map: this });
    //添加天地图影像注记图层,默认图层Id:TianDiTuImageNote
    // addTianDiTuImageNoteLayer({ token: '<天地图 Token>', map: this });

    // const geolocate = new GeolocateControl({
    //   showAccuracyCircle: false,
    //   showUserHeading: true,
    //   trackUserLocation: true,
    //   positionOptions: { enableHighAccuracy: true },
    // });

    // this.addControl(geolocate);
    // geolocate.on('error', () => {});
  };

  private _useMapMarker = () => {
    this.addModule({
      name: 'map-marker',
      value: { create: (...args: any) => new MapMarker(...args) }
    });
  };

  private _useAIDiscern = () => {};

  get danmakuRenderer() {
    return this._modules.danmakuRenderer.value as ISMap['danmakuRenderer'];
  }

  get draw() {
    return this._modules.draw.value as ISMap['draw'];
  }

  get markerFeature() {
    return this._modules['marker-feature'].value as ISMap['markerFeature'];
  }

  get markerFactory() {
    return this._modules['map-marker'].value as ISMap['markerFactory'];
  }

  get iconImage() {
    return this._modules['icon-image'].value as ISMap['iconImage'];
  }

  get geographyPhotos() {
    return this._modules['geography-photos'].value as ISMap['geographyPhotos'];
  }

  addModule: ISMap['addModule'] = (module) => {
    const m = this._modules[module.name];
    if (m && Array.isArray(m.queue)) m.queue.map(([resolve]) => resolve(module.value as any));
    this._modules[module.name] = { ...module, queue: [] };
    return module.value;
  };

  getModule: ISMap['getModule'] = (name) => {
    return new Promise((resolve, reject) => {
      const module = this._modules[name];
      if (module) {
        if (module.value) return resolve(module.value);
        if (Array.isArray(module.queue)) {
          module.queue.push([resolve, reject]);
          return;
        }
      }
      this._modules[name] = { name, value: undefined, queue: [[resolve, reject]] };
    });
  };

  restoration: ISMap['restoration'] = (params) => this.easeTo(params || defaultRestorationOptions);

  orderLayer: ISMap['orderLayer'] = () => {
    const layers = (this.getStyle()?.layers || []) as ISMapRasterLayerSpecifcation[];
    const lastLayer = layers[layers.length - 1];
    if (!lastLayer) return;
    const topLayers: ISMapRasterLayerSpecifcation[] = [];
    layers.forEach((layer) => {
      const { top, zIndex } = (layer.metadata ?? {}) as ISMapLayerMetadata;
      if (top) {
        topLayers.push(layer);
        return;
      }
      if (typeof zIndex === 'number') {
        const item = layers.find(
          (l) => typeof l.metadata?.zIndex === 'number' && l.metadata.zIndex > zIndex
        );
        if (item?.id) this.moveLayer(layer.id, item?.id);
      }
    });
    const newLayers = (this.getStyle()?.layers || []) as ISMapRasterLayerSpecifcation[];
    const list = newLayers.filter((l) => !topLayers.find((v) => v.id === l.id));
    const last = list[list.length - 1];
    if (topLayers.length && last) {
      topLayers.sort((a, b) => a.metadata.zIndex - b.metadata.zIndex);
      topLayers.forEach((layer) => this.moveLayer(layer.id, last.id));
      this.moveLayer(last.id, topLayers[0].id);
    }
  };

  setLayerVisibleBySource: ISMap['setLayerVisibleBySource'] = (sourceId, visible) => {
    const layers = this.getStyle()?.layers || [];
    layers.forEach((layer) => {
      if ((layer as any).source === sourceId)
        this.setLayoutProperty(layer.id, 'visibility', visible ? 'visible' : 'none');
    });
  };

  fitByGeometry: ISMap['fitByGeometry'] = (geometry, options) => {
    const bounds = bbox(geometry) as [number, number, number, number];
    this.fitBounds(bounds, options);
  };
}
