<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { api, getQueryKey } from './apiClient';
	import { chartTheme } from './utils';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;

	const aroon = createQuery({
		queryKey: getQueryKey(['aroon']),
		queryFn: () => api().aroon()
	});
</script>

<Chart
	{ref}
	container={{ class: 'chart-container h-1/6 relative pt-2', style: offsetStyle }}
	autoSize={true}
	{...chartTheme}
>
	<div class="absolute z-10 top-2 left-2">AROON</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $aroon.isSuccess}
		<LineSeries lastValueVisible={false} lineWidth={1} color={'orange'} data={$aroon.data.upper} />
		<LineSeries lastValueVisible={false} lineWidth={1} data={$aroon.data.lower} />
	{/if}
</Chart>
