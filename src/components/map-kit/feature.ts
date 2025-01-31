import { getType, getGeom } from '@turf/turf';
import type { Feature, Geometry, LineString, MultiPolygon, Point, Polygon } from 'geojson';

export interface IFeatureHelper {
  getFirstCoordinate: <G extends Geometry>(geojson: Feature<G> | G) => [number, number];
}

export class FeatureHelper implements IFeatureHelper {
  getFirstCoordinate: IFeatureHelper['getFirstCoordinate'] = (geojson) => {
    switch (getType(geojson)) {
      case 'Point':
        return (getGeom(geojson) as Point).coordinates as [number, number];
      case 'LineString':
      case 'MultiPoint':
        return (getGeom(geojson) as LineString).coordinates[0] as [number, number];
      case 'Polygon':
      case 'MultiLineString':
        return (getGeom(geojson) as Polygon).coordinates[0][0] as [number, number];
      case 'MultiPolygon':
        return (getGeom(geojson) as MultiPolygon).coordinates[0][0][0] as [number, number];
      default:
        throw new Error('Unknown Geometry Type');
    }
  };
}
