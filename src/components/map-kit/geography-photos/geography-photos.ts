import { featureCollection } from '@turf/turf';
import { image2Base64 } from '../utils';
import tplSvg from './tpl.svg?raw';
import { BaseKit } from '../base-kit';
import type { Feature } from 'geojson';
import type {
  IGeographtPhotosClusterFeatureProperties,
  IGeographyPhotos,
  IGeographyPhotosOptions
} from './types';
import type { ISMapGeoJsonSource } from '../smap';
import type { MapLayerEventType } from 'mapbox-gl';

type IGeographyPhotosQueueRecord = { id: string; status: 'loaded' | 'loading' | 'error' };

type IGeographyPhotosQueue = {
  data: Map<string, IGeographyPhotosQueueRecord>;
  get: (id: string) => IGeographyPhotosQueueRecord | undefined;
  set: (id: string, record: IGeographyPhotosQueueRecord) => void;
  clear: () => void;
};

const queueFactory = () => {
  const queue: IGeographyPhotosQueue = {
    data: new Map<string, IGeographyPhotosQueueRecord>(),
    get: (id: string) => queue.data.get(id),
    set: (id: string, record: IGeographyPhotosQueueRecord) => {
      queue.data.set(id, { ...queue.data.get(id), ...JSON.parse(JSON.stringify(record)) });
    },
    clear: () => {
      queue.data.clear();
    }
  };
  return queue;
};

export class GeographyPhotos extends BaseKit implements IGeographyPhotos {
  map: IGeographyPhotos['map'];
  name: IGeographyPhotos['name'];
  sourceId: IGeographyPhotos['sourceId'];
  clusterLayerId: IGeographyPhotos['clusterLayerId'];
  clusterMarkerLayerId: IGeographyPhotos['clusterMarkerLayerId'];
  markerIconImage: IGeographyPhotos['markerIconImage'];
  private _loadIconImageQueue: IGeographyPhotosQueue;
  constructor(options: IGeographyPhotosOptions) {
    super({ map: options.map, name: 'geography-photos' });
    this.name = 'geography-photos';
    this.markerIconImage = 'geography-photos-marker';
    this.sourceId = 'geography-photos-source';
    this.clusterLayerId = 'geography-photos-layer';
    this.clusterMarkerLayerId = 'geography-photos-marker-layer';
    this.map = options.map;
    this._loadIconImageQueue = queueFactory();
    this._init();
  }
  private _init = () => {
    if (this.map.hasImage(this.markerIconImage)) {
      this.map.updateImage(this.markerIconImage, tplSvg);
    } else {
      this.map.addImage(this.markerIconImage, tplSvg, { pixelRatio: 2 });
    }
    if (this.map.getSource(this.sourceId)) this.map.removeSource(this.sourceId);
    this.map.addSource(this.sourceId, {
      cluster: true,
      type: 'geojson',
      clusterRadius: 60,
      clusterMaxZoom: 24,
      data: featureCollection([]),
      clusterProperties: {
        id: ['coalesce', ['get', 'id'], ''],
        thumbUrl: ['coalesce', ['get', 'thumbUrl'], ''],
        lng: ['coalesce', ['get', 'lng'], 0],
        lat: ['coalesce', ['get', 'lat'], 0]
      }
    });
    if (this.map.getLayer(this.clusterMarkerLayerId))
      this.map.removeLayer(this.clusterMarkerLayerId);
    this.map.addLayer({
      id: this.clusterMarkerLayerId,
      type: 'symbol',
      source: this.sourceId,
      metadata: {
        top: true
      },
      layout: {
        // 'text-field': ['coalesce', ['get', 'point_count_abbreviated'], '1'],
        // 'text-font': ['Source Han Sans CN Bold'],
        // 'text-size': 12,
        // 'text-offset': [1.5, -4],
        // 'text-letter-spacing': 0,
        // 'text-max-width': 20,
        // 'text-ignore-placement': true, // 忽略文字的碰撞
        // 'icon-image': ['coalesce', ['get', 'id'], this.markerIconImage],
        'icon-image': [
          'coalesce',
          ['concat', ['get', 'id'], '_', ['coalesce', ['get', 'point_count_abbreviated'], '1']],
          this.markerIconImage
        ],
        'icon-allow-overlap': true, // 允许图标重叠
        'icon-ignore-placement': true, // 忽略图标的碰撞
        'icon-anchor': 'bottom'
      }
      // paint: {
      //   'text-halo-width': 1,
      //   'text-opacity': 1,
      //   'text-color': '#fff',
      // },
    });
  };

  private _bindEvent = () => {
    this._unbindEvent();
    this.map.on('render', this._mapRenderEvent);
    this.map.on('click', this.getLayerIds(), this._mapClickEvent);
    // this.map.on('dblclick', this.getLayerIds(), this._mapClickEvent);
  };

  private _unbindEvent = () => {
    this.map.off('render', this._mapRenderEvent);
    this.map.off('click', this.getLayerIds(), this._mapClickEvent);
    // this.map.off('dblclick', this.getLayerIds(), this._mapClickEvent);
  };

  private _preview = (features: Feature[]) => {
    this.map.dispatch({
      type: 'geographyPhotos.preview',
      featureCollection: featureCollection(features)
    });
  };

  private _mapClickEvent = (e: MapLayerEventType['click']) => {
    if (!e.features?.length) return;
    const feature = e.features[0];
    const clusterId = feature.properties?.cluster_id;
    if (!clusterId) return this._preview(e.features);
    this.source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      if (zoom >= this.map.getMaxZoom()) {
        this.source.getClusterChildren(clusterId, (error, features) => {
          if (error) return this._preview([feature]);
          this._preview(features);
        });
        return;
      }
      this.map.easeTo({
        center: { lng: feature.properties!.lng, lat: feature.properties!.lat },
        zoom
      });
    });
  };

  private _mapRenderEvent = () => {
    if (!this.map.isSourceLoaded(this.sourceId)) return;
    this._updateMarkers();
  };

  private _updateMarkers = () => {
    const features = this.map.querySourceFeatures(this.sourceId);
    features.forEach((feature) => {
      const {
        id: i,
        thumbUrl,
        point_count_abbreviated = 1
      } = feature.properties as IGeographtPhotosClusterFeatureProperties;
      const id = `${i}_${point_count_abbreviated}`;
      // const id = i;
      const record = this._loadIconImageQueue.get(id);
      if (record && record.status !== 'error') return;
      if (thumbUrl && id && !this.map.hasImage(id)) {
        this._loadIconImageQueue.set(id, { id, status: 'loading' });
        this.map.loadImage(thumbUrl, (error, image) => {
          if (error || !image) {
            this._loadIconImageQueue.set(id, { id, status: 'error' });
            return;
          }
          this._loadIconImageQueue.set(id, { id, status: 'loaded' });
          const source = image2Base64(image);
          if (!source) {
            console.warn(`geography photos 加载图标 ${id} 失败`);
            return;
          }
          const updatedSvgContent = tplSvg
            .replace(/(<img\s+[^>]*src=")[^"]*("[^>]*>)/, `$1${source}$2`)
            .replace('{9}', `${point_count_abbreviated}`);
          this.map.addImage(id, updatedSvgContent, { pixelRatio: 2 });
        });
      }
    });
  };

  get source() {
    return this.map.getSource(this.sourceId) as ISMapGeoJsonSource;
  }

  getLayerIds: IGeographyPhotos['getLayerIds'] = () => {
    return [this.clusterLayerId, this.clusterMarkerLayerId];
  };

  protected onStatusChange() {
    if (this.enabled) {
      this.map.orderLayer();
      this._bindEvent();
    } else {
      this._unbindEvent();
      this.source.setData(featureCollection([]));
    }
    super.onStatusChange();
  }

  setData: IGeographyPhotos['setData'] = (data) => {
    if (this.enabled) this.source.setData(data);
  };

  addData: IGeographyPhotos['addData'] = (data) => {
    if (this.enabled) this.source.addData(data);
  };

  deleteData: IGeographyPhotos['deleteData'] = ({ ids }) => {
    if (this.enabled) this.source.deleteData((f) => ids.includes(f.properties?.id));
  };
}
