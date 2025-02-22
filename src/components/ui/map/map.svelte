<script module>
  import { onMount } from 'svelte';
  import { SMap, type ISMap, type ISMapOptions } from '../../map-kit';

  export type IMapProps = Pick<ISMapOptions, 'dispatch'> & {
    onReady?: (map: ISMap) => void;
  };
</script>

<script lang="ts">
  import { getGeovisInitStyle } from '@gvol-org/geovis-mapbox-sdk';

  const { dispatch, onReady }: IMapProps = $props();
  let mapElement: HTMLElement;
  let smap: ISMap;

  const onWindowResize = () => {
    console.log('window resized');
    smap.resize();
  };

  onMount(() => {
    const style = getGeovisInitStyle() as any;
    style.fog = {
      color: 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      range: [0.5, 10],
      'space-color': ['interpolate', ['linear'], ['zoom'], 4, '#010b19', 7, '#367ab9'],
      'star-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.35, 6, 0]
    };
    smap = new SMap({
      container: 'map',
      style: '/style/style.json',
      dispatch
    });
    smap.once('style.load', () => onReady?.(smap));
  });
</script>

<svelte:window onresize={onWindowResize} />
<div bind:this={mapElement} id="map" class="flex h-full w-full flex-1 rounded-[4px]"></div>
