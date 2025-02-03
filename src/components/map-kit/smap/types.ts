import { Map } from 'mapbox-gl';
import type { IDraw } from '../draw';
import type {
  EaseToOptions,
  EventData,
  FitBoundsOptions,
  GeoJSONSource,
  MapboxOptions,
  MapEventType,
  MapLayerEventType,
  MarkerOptions,
  RasterLayer
} from 'mapbox-gl';
import type {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawCombineEvent,
  DrawUncombineEvent,
  DrawUpdateEvent,
  DrawSelectionChangeEvent,
  DrawModeChangeEvent,
  DrawRenderEvent,
  DrawActionableEvent,
  DrawOnAddEvent,
  DrawClickOnVertexEvent,
  DrawOnMidpointEvent,
  DrawDragVertexEvent,
  DrawClickOrTabEvent,
  DrawDragEvent,
  DrawClearSelectedCoordinatesEvent,
  DrawAddPointEvent,
  DrawUndoEvent,
  DrawButtonStatusChangeEvent
} from '@ttfn/mapbox-gl-draw';
import type { IDanmakuRenderer } from '@/components/danmaku';
import type {
  IMarkerFeature,
  IMarkerFeatureEvent,
  IMarkerFeatureFindEvent
} from '../marker-feature';
import type { IGeoJsonSourceChangeEvent, IGeoJsonSourceHelper } from '../sources';
import type { IMapBaseKitEvent } from '../base-kit';
import type { IFeatureHelper } from '../feature';
import type { IMapMarker } from '../map-marker';
import type { IIconImage } from '../icon-image';
import type { IGeographyPhotos, IGeographyPhotosEvent } from '../geography-photos';
import type { AllGeoJSON } from '@turf/turf';

type ISMapUtilReplaceTheMap<T extends Record<string, any> = any> = Omit<T, 'target'> & {
  target: ISMap;
};

type ISMapUtilEvent<T extends { type: string; target: ISMap; [k: string]: any }> = Record<
  T['type'],
  T
>;

export interface ISMap extends Map {
  /** 复位 */
  restoration: (params?: EaseToOptions) => void;
  /** 添加模块 */
  addModule: <T = any>(module: ISMapModule<T>) => T;
  /** 获取模块 */
  getModule: <T = any>(name: string) => Promise<ISMapModule<T>['value']>;
  /** 弹幕实例 */
  danmakuRenderer: IDanmakuRenderer;
  /** 绘制工具示例 */
  draw: IDraw;
  /** 标记工具 */
  markerFeature: IMarkerFeature;
  /** feature工具 */
  featureHelper: IFeatureHelper;
  /** 图标管理 */
  iconImage: IIconImage;
  /** 地理照片 */
  geographyPhotos: IGeographyPhotos;
  /** ui层交互 */
  dispatch: <T extends keyof ISMapKitEventType>(
    data: { type: T } & Omit<ISMapEventCallbackParameter<T>, 'target'>
  ) => void;
  /** 标记 */
  markerFactory: {
    create: (element?: HTMLElement | MarkerOptions, options?: mapboxgl.MarkerOptions) => IMapMarker;
  };
  /** 根据图层zIndex, top 排序 */
  orderLayer: () => void;
  setLayerVisibleBySource: (sourceId: string, visible: boolean) => void;
  /** 根据图形定位 */
  fitByGeometry: (geometry: AllGeoJSON, options?: FitBoundsOptions) => void;

  updateImage: (
    name: string,
    image:
      | HTMLImageElement
      | ArrayBufferView
      | { width: number; height: number; data: Uint8Array | Uint8ClampedArray }
      | ImageData
      | ImageBitmap
      | string
  ) => void;
  addImage: (
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
  ) => void;

  on<T extends keyof ISMapKitEventType>(
    type: T,
    listener: (ev: ISMapEventCallbackParameter<T>) => void
  ): this;
  once<T extends keyof ISMapKitEventType>(
    type: T,
    listener: (ev: ISMapEventCallbackParameter<T>) => void
  ): this;
  off<T extends keyof ISMapKitEventType>(
    type: T,
    listener: (ev: ISMapEventCallbackParameter<T>) => void
  ): this;
  fire<T extends keyof ISMapKitEventType>(
    type: T,
    properties?: ISMapEventCallbackParameter<T>
  ): this;
  fire(type: string, properties?: Record<string, any>): this;
  on<T extends keyof MapEventType>(
    type: T,
    listener: (ev: Omit<MapEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  on<T extends keyof MapLayerEventType>(
    type: T,
    layer: string | readonly string[],
    listener: (ev: Omit<MapLayerEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  on(type: string, listener: (ev: any) => void): this;
  once<T extends keyof MapLayerEventType>(
    type: T,
    layer: string | readonly string[],
    listener: (ev: Omit<MapLayerEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  once<T extends keyof MapEventType>(
    type: T,
    listener: (ev: Omit<MapEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  once(type: string, listener: (ev: any) => void): this;
  once<T extends keyof MapEventType>(
    type: T
  ): Promise<Omit<MapEventType[T], 'target'> & { target: ISMap }>;
  off<T extends keyof MapLayerEventType>(
    type: T,
    layer: string | readonly string[],
    listener: (ev: Omit<MapLayerEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  off<T extends keyof MapEventType>(
    type: T,
    listener: (ev: Omit<MapEventType[T], 'target'> & { target: ISMap } & EventData) => void
  ): this;
  off(type: string, listener: (ev: any) => void): this;
}

export type ISMapKitEventType = ISMapUtilEvent<IMapBaseKitEvent> &
  ISMapUtilEvent<IMarkerFeatureEvent> &
  ISMapUtilEvent<IGeographyPhotosEvent> &
  ISMapUtilEvent<IMarkerFeatureFindEvent> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawCreateEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawCreateEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawDeleteEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawCombineEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawUncombineEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawUpdateEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawSelectionChangeEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawModeChangeEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawRenderEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawActionableEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawOnAddEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawClickOnVertexEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawOnMidpointEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawDragVertexEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawClickOrTabEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawDragEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawClearSelectedCoordinatesEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawAddPointEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawButtonStatusChangeEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<DrawUndoEvent>> &
  ISMapUtilEvent<ISMapUtilReplaceTheMap<IGeoJsonSourceChangeEvent>>;

export type ISMapEventType = MapEventType & ISMapKitEventType & MapLayerEventType;

export interface ISMapModule<T = any> {
  name: string;
  value: T;
}

export type ISMapOptions = MapboxOptions & { dispatch?: (data: ISMapDispatchData) => void };

export type ISMapDispatchData = ISMapKitEventType[keyof ISMapKitEventType];

export type ISMapGeoJsonSource = GeoJSONSource & IGeoJsonSourceHelper;

export type ISMapEventCallbackParameter<T> = T extends keyof ISMapKitEventType
  ? ISMapKitEventType[T]
  : T extends keyof MapLayerEventType
    ? Omit<MapLayerEventType[T], 'target'> & { target: ISMap } & EventData
    : T extends keyof MapEventType
      ? Omit<MapEventType[T], 'target'> & { target: ISMap }
      : T extends keyof DrawCreateEvent
        ? DrawCreateEvent[T]
        : T extends keyof DrawDeleteEvent
          ? DrawDeleteEvent[T]
          : T extends keyof DrawCombineEvent
            ? DrawCombineEvent[T]
            : T extends keyof DrawUncombineEvent
              ? DrawUncombineEvent[T]
              : T extends keyof DrawUpdateEvent
                ? DrawUpdateEvent[T]
                : T extends keyof DrawSelectionChangeEvent
                  ? DrawSelectionChangeEvent[T]
                  : T extends keyof DrawModeChangeEvent
                    ? DrawModeChangeEvent[T]
                    : T extends keyof DrawRenderEvent
                      ? DrawRenderEvent[T]
                      : T extends keyof DrawActionableEvent
                        ? DrawActionableEvent[T]
                        : T extends keyof DrawOnAddEvent
                          ? DrawOnAddEvent[T]
                          : T extends keyof DrawClickOnVertexEvent
                            ? DrawClickOnVertexEvent[T]
                            : T extends keyof DrawOnMidpointEvent
                              ? DrawOnMidpointEvent[T]
                              : T extends keyof DrawDragVertexEvent
                                ? DrawDragVertexEvent[T]
                                : T extends keyof DrawClickOrTabEvent
                                  ? DrawClickOrTabEvent[T]
                                  : T extends keyof DrawDragEvent
                                    ? DrawDragEvent[T]
                                    : T extends keyof DrawClearSelectedCoordinatesEvent
                                      ? DrawClearSelectedCoordinatesEvent[T]
                                      : T extends keyof DrawAddPointEvent
                                        ? DrawAddPointEvent[T]
                                        : T extends keyof DrawUndoEvent
                                          ? DrawUndoEvent[T]
                                          : unknown;

export type ISMapLayerMetadata = {
  top: boolean;
  zIndex: number;
};

export type ISMapRasterLayerSpecifcation = Exclude<RasterLayer, 'metadata'> & {
  metadata: ISMapLayerMetadata;
};
