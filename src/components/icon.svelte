<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  let { name, ...restProps }: HTMLAttributes<SVGSVGElement> & { name: string } = $props();

  let href = `/font-gis/font-gis.svg#${name}`;
</script>

<svg {...restProps}>
  <use xlink:href={href} />
</svg>
