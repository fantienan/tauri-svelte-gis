import pointPng from './images/img_dingwei02.png';
import qidianPng from './images/img_qidian.png';
import type { AnyLayer, Map, SymbolLayout } from 'mapbox-gl';

const activeColor = '#E1361B';
const inactiveColor = '#E1361B';
const editPointIconImage = '_edit-point-icon-image';

export const secondToLastPoint: SymbolLayout & { url: string; id: string } = {
  url: pointPng,
  id: 'draw-second-to-last-point',
  'icon-anchor': 'bottom',
  'icon-size': 0.7,
};

type IDrawThemeOptions = {
  map: Map;
  secondToLastPointShowIcon?: boolean;
  prefix?: string;
};

export const defaultIdPrefix = 'gl-draw';

export const getDrawTheme = (options: IDrawThemeOptions) => {
  const { map, secondToLastPointShowIcon, prefix = defaultIdPrefix } = options;
  const theme: AnyLayer[] = [
    {
      id: `${prefix}-polygon-fill-inactive`,
      type: 'fill',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      paint: {
        'fill-color': inactiveColor,
        'fill-outline-color': inactiveColor,
        'fill-opacity': 0.1,
      },
    },
    {
      id: `${prefix}-polygon-fill-active`,
      type: 'fill',
      filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': activeColor,
        'fill-outline-color': activeColor,
        'fill-opacity': 0.1,
      },
    },
    {
      id: `${prefix}-polygon-midpoint`,
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
      paint: {
        'circle-radius': 3,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-polygon-stroke-inactive`,
      type: 'line',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': inactiveColor,
        'line-width': 2,
      },
    },
    {
      id: `${prefix}-polygon-stroke-active`,
      type: 'line',
      filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': activeColor,
        'line-width': 2,
      },
    },
    {
      id: `${prefix}-line-inactive`,
      type: 'line',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': inactiveColor,
        'line-width': 2,
      },
    },
    {
      id: `${prefix}-line-active`,
      type: 'line',
      filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': activeColor,
        'line-width': 2,
      },
    },

    {
      id: `${prefix}-polygon-and-line-vertex-stroke-ringlike-inactive`,
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 8,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-polygon-and-line-vertex-stroke-inactive`,
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 6,
        'circle-color': '#fff',
      },
    },
    {
      id: `${prefix}-polygon-and-line-vertex-inactive`,
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 4,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-point-point-stroke-inactive`,
      type: 'circle',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 5,
        'circle-opacity': 1,
        'circle-color': '#fff',
      },
    },
    {
      id: `${prefix}-point-inactive`,
      type: 'circle',
      filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
      paint: {
        'circle-radius': 5,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-point-stroke-ringlike-active`,
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
      paint: {
        'circle-radius': 9,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-point-stroke-active`,
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
      paint: {
        'circle-radius': 7,
        'circle-color': '#fff',
      },
    },
    {
      id: `${prefix}-point-active`,
      type: 'circle',
      filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['!has', 'user__edit-point']],
      paint: {
        'circle-radius': 5,
        'circle-color': activeColor,
      },
    },
    {
      id: `${prefix}-polygon-fill-static`,
      type: 'fill',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      paint: {
        'fill-color': '#404040',
        'fill-outline-color': '#404040',
        'fill-opacity': 0.1,
      },
    },
    {
      id: `${prefix}-polygon-stroke-static`,
      type: 'line',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#404040',
        'line-width': 2,
      },
    },
    {
      id: `${prefix}-line-static`,
      type: 'line',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#404040',
        'line-width': 2,
      },
    },
    {
      id: `${prefix}-point-static`,
      type: 'circle',
      filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 5,
        'circle-color': '#404040',
      },
    },
    {
      id: `${prefix}-point-active-symbol`,
      type: 'symbol',
      filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['==', 'user__edit-point', 'true']],
      layout: {
        'icon-anchor': ['coalesce', ['get', 'user__edit-point-icon-anchor'], 'bottom'],
        'icon-image': ['coalesce', ['get', 'user__edit-point-icon-image'], editPointIconImage],
        // 'icon-anchor': 'bottom',
        'icon-allow-overlap': true, // 允许图标重叠
        'text-ignore-placement': true, // 忽略文字的碰撞
        'icon-ignore-placement': true, // 忽略图标的碰撞
        'icon-size': ['coalesce', ['get', 'user__edit-point-icon-size'], 1],
        'icon-offset': ['coalesce', ['get', 'user__edit-point-icon-offset'], [0, 4]],
      },
    },
  ];

  map.loadImage(qidianPng, (error?: Error, image?: HTMLImageElement | ImageBitmap) => {
    if (!error && !map.hasImage(editPointIconImage) && image) map.addImage(editPointIconImage, image);
  });
  if (secondToLastPointShowIcon) {
    map.loadImage(secondToLastPoint.url, (error?: Error, image?: HTMLImageElement | ImageBitmap) => {
      if (!error && image && !map.hasImage(secondToLastPoint.id)) map.addImage(secondToLastPoint.id, image);
    });
    theme.push({
      id: `${prefix}-line-second_to_last_point`,
      type: 'symbol',
      filter: [
        'all',
        ['==', 'meta', 'second_to_last_point'],
        ['==', '$type', 'Point'],
        ['any', ['==', 'mode', 'draw_line_string'], ['==', 'mode', 'draw_polygon']],
      ],
      layout: {
        'icon-anchor': secondToLastPoint['icon-anchor'],
        'icon-image': secondToLastPoint.id,
        'icon-allow-overlap': true, // 允许图标重叠
        'text-ignore-placement': true, // 忽略文字的碰撞
        'icon-ignore-placement': true, // 忽略图标的碰撞
        'icon-size': secondToLastPoint['icon-size'],
      },
    });
  }
  return theme;
};
