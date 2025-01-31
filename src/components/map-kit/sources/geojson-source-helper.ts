/* eslint-disable @typescript-eslint/no-explicit-any */
import { featureCollection } from '@turf/turf';
import { featureEach } from '@turf/turf';
import type { GeoJSONSource } from 'mapbox-gl';
import type { FeatureCollection, GeoJsonProperties, Geometry, Feature } from 'geojson';
import type { ISMap } from '../smap';

export type IGeoJsonSourceChangeEvent = {
  type: 'source.change';
  target: ISMap;
  sourceId: string;
};

export interface IGeoJsonSourceHelper {
  /** 数据源id */
  sourceId: string;
  /** 地图示例 */
  map: ISMap;
  /** mapbox数据源 */
  rawSource: GeoJSONSource;
  /** 查找 */
  findData: <G extends Geometry = Geometry, P extends GeoJsonProperties = GeoJsonProperties>(
    where?: IGeoJsonSourceHelperWhere | ((feature: Feature, i: number) => boolean),
    operator?: IGeoJsonSourceOperator
  ) => FeatureCollection<G, P>;
  /** 增加 GeoJSON 数据并重新渲染地图 */
  addData: (data: Feature<Geometry> | FeatureCollection<GeoJSON.Geometry>) => IGeoJsonSourceHelper;
  /** 删除 GeoJSON 数据并重新渲染地图 */
  deleteData: (
    options:
      | {
          where: IGeoJsonSourceHelperWhere;
          operator?: IGeoJsonSourceOperator;
        }
      | ((feature: Feature, i: number) => boolean)
  ) => IGeoJsonSourceHelper;

  /** 更新 GeoJSON 数据并重新渲染地图  */
  updateData: (
    data: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>
  ) => IGeoJsonSourceHelper;
  /** 获取 */
  getData: <
    G extends Geometry = Geometry,
    P extends GeoJsonProperties = GeoJsonProperties
  >() => FeatureCollection<G, P>;
  /** 遍历 */
  eachData: <G extends Geometry = Geometry, P extends GeoJsonProperties = GeoJsonProperties>(
    callback: (currentFeature: Feature<G, P>, featureIndex: number) => void
  ) => void;
  /** 过滤 */
  filterData: <G extends Geometry = Geometry, P extends GeoJsonProperties = GeoJsonProperties>(
    callback: (f: Feature<G, P>, i: number) => boolean
  ) => FeatureCollection<G, P>;
  /** 根据id更新feature */
  updateFeatureProperties: (options: {
    properties: Record<string, any>;
    where: IGeoJsonSourceHelperWhere;
    id?: string; // 更新feature的id
    operator?: IGeoJsonSourceOperator;
  }) => IGeoJsonSourceHelper;
  clearData: () => IGeoJsonSourceHelper;
}

export type IGeoJsonSourceHelperOptions = Pick<
  IGeoJsonSourceHelper,
  'map' | 'sourceId' | 'rawSource'
>;

type IGeoJsonSourceHelperWhere = {
  id?: string;
  properties?: {
    id?: string;
    [key: string]: any;
  };
};

type IGeoJsonSourceOperator = 'and' | 'or';

type IGeoJsonSourceOperationOptions = {
  where?: IGeoJsonSourceHelperWhere;
  operator?: IGeoJsonSourceOperator;
  feature: Feature;
};

export class GeoJsonSourceHelper implements IGeoJsonSourceHelper {
  sourceId: IGeoJsonSourceHelper['sourceId'];
  map: IGeoJsonSourceHelper['map'];
  rawSource: GeoJSONSource;
  constructor(options: IGeoJsonSourceHelperOptions) {
    this.sourceId = options.sourceId;
    this.map = options.map;
    this.rawSource = options.rawSource ?? (this.map.getSource(this.sourceId) as GeoJSONSource);
    if (!this.rawSource) {
      throw new Error('GeoJsonSourceHelper: Source not found');
    }
    const originalSetData = this.rawSource.setData;
    this.rawSource.setData = (data) => {
      originalSetData.call(this.rawSource, data);
      this.map.fire('source.change', { sourceId: this.sourceId });
      return this.rawSource;
    };
  }

  private _operation = (options: IGeoJsonSourceOperationOptions) => {
    const { where, feature, operator = 'or' } = options;
    const flag1 = feature.id === where?.id;
    let flag2 = false;
    if (feature.properties && where?.properties) {
      const keys = Object.keys(where.properties);
      if (!keys.length) {
        flag2 = false;
      } else if (operator === 'and') {
        flag2 =
          keys.length ===
          keys.filter((key) => where.properties![key] === feature.properties![key]).length;
      } else if (operator === 'or') {
        flag2 = keys.some((key) => where.properties![key] === feature.properties![key]);
      }
    }
    return operator === 'and' ? flag1 && flag2 : operator === 'or' ? flag1 || flag2 : false;
  };

  eachData: IGeoJsonSourceHelper['eachData'] = <
    G extends Geometry = Geometry,
    P extends GeoJsonProperties = GeoJsonProperties
  >(
    cb: (currentFeature: Feature<G, P>, featureIndex: number) => void
  ) => {
    featureEach(this.getData<G, P>(), cb);
  };

  filterData: IGeoJsonSourceHelper['filterData'] = <
    G extends Geometry = Geometry,
    P extends GeoJsonProperties = GeoJsonProperties
  >(
    cb: (f: Feature<G, P>, i: number) => boolean
  ) => {
    const data = this.getData<G, P>();
    data.features = data.features.filter(cb);
    return data;
  };

  findData: IGeoJsonSourceHelper['findData'] = <
    G extends Geometry = Geometry,
    P extends GeoJsonProperties = GeoJsonProperties
  >(
    where?: IGeoJsonSourceHelperWhere | ((feature: Feature, i: number) => boolean),
    operator?: IGeoJsonSourceOperator
  ) => {
    if (typeof where === 'function') {
      return this.filterData((f, i) => !where(f, i));
    }
    const fc = featureCollection<G, P>([]);
    if (where && (where.id || where.properties)) {
      this.eachData<G, P>((f) => {
        if (this._operation({ where, operator, feature: f })) fc.features.push(f);
      });
    }
    return fc;
  };

  getData: IGeoJsonSourceHelper['getData'] = <
    G extends Geometry = Geometry,
    P = GeoJsonProperties
  >() => {
    return (this.rawSource as any)._data as FeatureCollection<G, P>;
  };

  addData: IGeoJsonSourceHelper['addData'] = (data) => {
    const currentData = this.getData();
    if (data.type === 'FeatureCollection') {
      currentData.features.push(...data.features);
      this.rawSource.setData(currentData);
    } else if (data.type === 'Feature') {
      currentData.features.push(data);
      this.rawSource.setData(currentData);
    } else {
      console.warn('GeoJsonSourceHelper: addData: data type not supported');
    }
    return this;
  };

  deleteData: IGeoJsonSourceHelper['deleteData'] = (options) => {
    if (typeof options === 'function') {
      this.rawSource.setData(this.filterData((f, i) => !options(f, i)));
      return this;
    }
    const { where, operator } = options;
    if (!where || (!where.id && !where.properties)) return this;
    this.rawSource.setData(
      this.filterData((f) => !this._operation({ where, operator, feature: f }))
    );
    return this;
  };

  updateData: IGeoJsonSourceHelper['updateData'] = (data) => {
    if (data.type === 'Feature') {
      data = featureCollection([data]);
    }
    if (data.type !== 'FeatureCollection') {
      throw 'Data to update should be a feature or a feature collection.';
    }
    const obj = data.features.reduce(
      (prev, f) => {
        if (f.id) prev[f.id] = f;
        return prev;
      },
      {} as Record<string, Feature<Geometry>>
    );
    const newData = featureCollection([
      ...this.filterData((f) => !f.id || !obj[f.id]).features,
      ...data.features
    ]);
    this.rawSource.setData(newData);
    return this;
  };

  updateFeatureProperties: IGeoJsonSourceHelper['updateFeatureProperties'] = ({
    properties,
    where,
    id,
    operator
  }) => {
    const data = this.getData();
    data.features.forEach((f) => {
      if (this._operation({ where, feature: f, operator })) {
        f.properties = { ...f.properties, ...properties };
        f.id = id ?? f.id;
      }
    });
    this.rawSource.setData(data);
    return this;
  };

  clearData: IGeoJsonSourceHelper['clearData'] = () => {
    this.rawSource.setData(featureCollection([]));
    return this;
  };
}
