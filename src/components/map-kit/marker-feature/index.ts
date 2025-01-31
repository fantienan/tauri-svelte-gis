import { feature, featureCollection, point } from '@turf/turf';
import { getType } from '@turf/turf';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { BaseKit } from '../base-kit';
import type { MapboxGeoJSONFeature, MapLayerEventType } from 'mapbox-gl';
import type { DrawCreateEvent } from '@ttfn/mapbox-gl-draw';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { ISMapGeoJsonSource, ISMap } from '../smap';
import type { IMapMarker } from '../map-marker';
import type { IBaseKit, IBaseKitOptions } from '../base-kit';

export interface IMarkerFeature extends IBaseKit {
  name: string;
  map: ISMap;
  sourceId: string;
  marker: IMapMarker;
  layerIds: {
    point: string;
    line: string;
    fill: string;
  };
  source: ISMapGeoJsonSource;
  defaultIconImage: string;
  defaultColor: string;
  defaultOpacity: number;
  groupId?: string;
  feature?: IMarkerFeatureType;
  cancel: () => void;
  genSourceData: (
    data: ({ geometry: Geometry } & IMarkerFeatureProperties)[]
  ) => FeatureCollection<Geometry, IMarkerFeatureProperties>;
  genFeatureProperties: (properties: IMarkerFeatureProperties) => IMarkerFeatureProperties;
  genFeatureId: (id: string) => string;
  edit: () => void;
  editFeature: (params: { feature: IMarkerFeatureType }) => void;
  find: (params: { feature: IMarkerFeatureType }) => void;
  delete: (id: string) => void;
  getLayerIds: () => string[];
}

export type IMarkerFeatureType = Feature<Geometry, IMarkerFeatureProperties>;

export type IMarkerFeatureOptions = Pick<IMarkerFeature, 'defaultIconImage' | 'defaultColor'> &
  IBaseKitOptions & {
    getExternalLayerIds?: () => string[];
  };

export type IMarkerFeatureProperties = {
  id: string;
  iconImage: string;
  color: string;
  opacity?: number;
};

export type IMarkerFeatureEvent = {
  target: ISMap;
  type: 'markerFeature.cancel' | 'markerFeature.loaded';
};

export type IMarkerFeatureFindEvent = {
  target: ISMap;
  type:
    | 'markerFeature.find'
    | 'markerFeature.edit'
    | 'markerFeature.create'
    | 'markerFeature.editFeature'
    | 'markerFeature.delete';
  featureCollection: FeatureCollection<Geometry, IMarkerFeatureProperties>;
};

export type IMarkerFeatureEventType = IMarkerFeatureEvent['type'] | IMarkerFeatureFindEvent['type'];

export class MarkerFeature extends BaseKit implements IMarkerFeature {
  sourceId: IMarkerFeature['sourceId'];
  layerIds: IMarkerFeature['layerIds'];
  marker!: IMarkerFeature['marker'];
  groupId: IMarkerFeature['groupId'];
  defaultIconImage: IMarkerFeature['defaultIconImage'];
  defaultColor: IMarkerFeature['defaultColor'];
  defaultOpacity: IMarkerFeature['defaultOpacity'];
  feature?: IMarkerFeature['feature'];
  private _options: IMarkerFeatureOptions;
  constructor(options: IMarkerFeatureOptions) {
    super(options);
    this.sourceId = 'marker-feature-source';
    this.layerIds = {
      point: 'marker-feature-point',
      line: 'marker-feature-line',
      fill: 'marker-feature-fill'
    };
    this.defaultIconImage = options.defaultIconImage;
    this.defaultColor = options.defaultColor;
    this.defaultOpacity = 0.5;
    this._options = options;
    this._init();
  }

  private _init = () => {
    if (this.map.getLayer(this.layerIds.point)) this.map.removeLayer(this.layerIds.point);
    if (this.map.getLayer(this.layerIds.line)) this.map.removeLayer(this.layerIds.line);
    if (this.map.getLayer(this.layerIds.fill)) this.map.removeLayer(this.layerIds.fill);
    if (this.map.getSource(this.sourceId)) this.map.removeSource(this.sourceId);
    this.map.addSource(this.sourceId, { type: 'geojson', data: featureCollection([]) });
    this.map.addLayer({
      id: this.layerIds.line,
      type: 'line',
      source: this.sourceId,
      filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': ['coalesce', ['get', 'color'], this.defaultColor],
        'line-width': 2
      }
    });

    this.map.addLayer({
      id: this.layerIds.fill,
      type: 'fill',
      source: this.sourceId,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['coalesce', ['get', 'color'], this.defaultColor],
        'fill-opacity': ['coalesce', ['get', 'opacity'], this.defaultOpacity]
      }
    });

    this.map.addLayer({
      id: this.layerIds.point,
      type: 'symbol',
      source: this.sourceId,
      filter: ['==', '$type', 'Point'],
      layout: {
        'icon-image': [
          'coalesce',
          ['concat', ['get', 'iconImage'], '-', ['get', 'color']],
          this.defaultIconImage
        ],
        'icon-offset': [0, -19],
        'icon-allow-overlap': true, // 允许图标重叠
        'text-ignore-placement': true, // 忽略文字的碰撞
        'icon-ignore-placement': true // 忽略图标的碰撞
      }
    });
    /** 创建marker */
    this.marker = this.map.markerFactory.create({
      element: document.createElement('div'),
      anchor: 'bottom',
      className: 'marker-feature'
    });
    this._bindEvents();
    this.map.dispatch({ type: 'markerFeature.loaded' });
  };

  getLayerIds: IMarkerFeature['getLayerIds'] = () => {
    return [...Object.values(this.layerIds), ...(this._options.getExternalLayerIds?.() ?? [])];
  };

  private _bindEvents = () => {
    this._unbindEvents();
    this.map.on('draw.create', this._drawCreateEvent);
    this.map.on('click', this.getLayerIds(), this._listenMapClick);
  };

  private _unbindEvents = () => {
    this.map.off('draw.create', this._drawCreateEvent);
    this.map.off('click', this.getLayerIds(), this._listenMapClick);
  };

  private _listenMapClick = (e: MapLayerEventType['click']) => {
    if (this.map.draw.getMode() !== 'simple_select') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const features = e.features?.map((f) => (f as any)?.toJSON() as MapboxGeoJSONFeature);
    if (!features?.length || features[0].source !== this.sourceId) return;
    this.find({ feature: features[0] as unknown as IMarkerFeatureType });
  };

  private _drawCreateEvent = (e: DrawCreateEvent) => {
    const { features } = e;
    if (!features.length) return;
    this.groupId = uuidv4();
    const markerFeature = features[0] as IMarkerFeatureType;
    const type = getType(markerFeature);
    const coord = this.map.featureHelper.getFirstCoordinate(markerFeature);
    const data = featureCollection([markerFeature]);
    let properties = this.genFeatureProperties({
      id: this.groupId,
      color: this.defaultColor,
      iconImage: this.defaultIconImage
    });
    if (this.feature) {
      this.groupId = this.feature.properties.id;
      properties = { ...this.feature.properties };
      if (getType(this.feature).includes('Point')) {
        this.source.deleteData({ where: { properties: { id: this.groupId } } });
      }
    }
    markerFeature.properties = { ...properties };
    markerFeature.id = this.genFeatureId(this.groupId);
    if (!type.includes('Point')) {
      data.features.push(point(coord, { ...properties }, { id: this.genFeatureId(this.groupId) }));
    }
    this.marker.setLngLat(coord).addTo(this.map);
    this.map.draw.deleteAll();
    this.source.addData(data);
    this.map.dispatch({
      type: this.feature ? 'markerFeature.editFeature' : 'markerFeature.create',
      featureCollection: featureCollection([markerFeature])
    });
    this.feature = undefined;
  };

  get source() {
    return this.map.getSource(this.sourceId) as ISMapGeoJsonSource;
  }

  protected onStatusChange = () => {
    super.onStatusChange();
  };

  genFeatureId: IMarkerFeature['genFeatureId'] = (id) => `${id}-${nanoid()}`;
  genFeatureProperties: IMarkerFeature['genFeatureProperties'] = ({ id, color, iconImage }) => {
    return { iconImage, color, id };
  };

  genSourceData: IMarkerFeature['genSourceData'] = (data) => {
    const features = data.reduce((prev, curr) => {
      prev.push(
        feature(curr.geometry, this.genFeatureProperties(curr), { id: this.genFeatureId(curr.id) })
      );
      if (getType(curr.geometry) !== 'Point') {
        prev.push(
          point(
            this.map.featureHelper.getFirstCoordinate(curr.geometry),
            this.genFeatureProperties(curr),
            {
              id: this.genFeatureId(curr.id)
            }
          )
        );
      }
      return prev;
    }, [] as IMarkerFeatureType[]);
    return featureCollection(features);
  };

  cancel: IMarkerFeature['cancel'] = () => {
    this.marker.remove();
    this.groupId = undefined;
    this.feature = undefined;
    this.map.dispatch({ type: 'markerFeature.cancel' });
  };

  edit: IMarkerFeature['edit'] = () => {
    const feature = this.source.findData<Geometry, IMarkerFeatureProperties>({
      properties: { id: this.groupId }
    }).features[0];
    this.map.dispatch({
      type: 'markerFeature.edit',
      featureCollection: featureCollection([feature])
    });
  };

  editFeature: IMarkerFeature['editFeature'] = ({ feature }) => {
    this.cancel();
    this.feature = feature;
    this.groupId = feature.properties.id;
    const type = getType(feature);
    if (type.includes('Point')) {
      this.map.draw.changeMode('draw_point');
      return;
    }
    this.source.deleteData({ where: { properties: { id: this.groupId } } });
    this.map.draw.edit(feature);
  };

  find: IMarkerFeature['find'] = ({ feature }) => {
    const id = feature.properties?.id;
    const fc = this.source.findData<Geometry, IMarkerFeatureProperties>({ properties: { id } });
    if (fc) {
      this.groupId = id;
      const center = this.map.featureHelper.getFirstCoordinate(feature);
      this.marker.setLngLat(center).addTo(this.map);
      this.map.dispatch({ type: 'markerFeature.find', featureCollection: fc });
      this.map.easeTo({ center, duration: 100 });
    }
  };

  delete: IMarkerFeature['delete'] = (id) => {
    const fc = this.source.findData<Geometry, IMarkerFeatureProperties>({ properties: { id } });
    this.source.deleteData({ where: { properties: { id } } });
    if (this.feature && fc.features[0].properties.id === this.groupId) {
      this.marker.remove();
      this.groupId = undefined;
      this.feature = undefined;
      this.map.draw.cancel();
    }
    this.map.dispatch({ type: 'markerFeature.delete', featureCollection: fc });
  };
}
