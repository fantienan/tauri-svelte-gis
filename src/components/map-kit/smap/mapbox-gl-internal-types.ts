// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { MapEventOf, MapEventType, GeoJSONFeature } from 'mapbox-gl';

export type EventData = object;
export type Listener$1<T extends MapEventType> = (event: MapEventOf<T>) => void;

export type FeaturesetDescriptor = Required<GeoJSONFeature>['featureset'];

export type EventRegistry = Record<string, EventData | void>;

export type StyleImageMetadata = {
  pixelRatio: number;
  sdf: boolean;
  stretchX?: Array<[number, number]>;
  stretchY?: Array<[number, number]>;
  content?: [number, number, number, number];
};
