import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { IAttachmentRecord } from '@/types';
import type { ISMap, ISMapGeoJsonSource } from '../smap';
import type { IBaseKit } from '../base-kit';

export interface IGeographyPhotos extends IBaseKit {
  map: ISMap;
  name: string;
  sourceId: string;
  clusterLayerId: string;
  clusterMarkerLayerId: string;
  markerIconImage: string;
  source: ISMapGeoJsonSource;
  enabled: boolean;
  setData: (data: FeatureCollection<Geometry, IGeographyPhotosProperties>) => void;
  addData: (data: FeatureCollection<Geometry, IGeographyPhotosProperties>) => void;
  deleteData: (data: { ids: string[] }) => void;
  getLayerIds: () => string[];
}
export type IGeographyPhotosOptions = {
  map: ISMap;
};

export type IGeographyPhotosProperties = IAttachmentRecord;

export type IGeographyPhotosFeature = Feature<Geometry, IGeographyPhotosProperties>;

export type IGeographyPhotosEvent = {
  target: ISMap;
  type: 'geographyPhotos.preview';
  featureCollection: FeatureCollection<Geometry, IGeographyPhotosProperties>;
};

export type IGeographtPhotosClusterFeatureProperties = Pick<IGeographyPhotosProperties, 'id' | 'thumbUrl'> & {
  cluster: boolean;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: number;
};
