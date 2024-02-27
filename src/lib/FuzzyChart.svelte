<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { api, getQueryKey } from './apiClient';
	import { createQuery } from '@tanstack/svelte-query';
	import { chartTheme } from './utils';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;
	export let preset: string;

	const fuzzy = createQuery({
		queryKey: getQueryKey(['fuzzy', preset]),
		queryFn: () => api().fuzzy(preset)
	});
</script>

<div class="h-1/6 relative">
	<div class="absolute z-10 top-2 px-4 bg-black bg-opacity-50 rounded flex">
		<p>FUZZY {preset}</p>
	</div>
	<Chart
		ref={(r) => {
			ref(r);
		}}
		container={{ class: 'chart-container h-full relative pt-2', style: offsetStyle }}
		autoSize={true}
		{...chartTheme}
	>
		<TimeScale
			on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
		/>
		{#if $fuzzy.isSuccess}
			<LineSeries data={$fuzzy.data.first} lineWidth={1} lastValueVisible={false} color="green" />
			<LineSeries data={$fuzzy.data.second} lineWidth={1} lastValueVisible={false} color="red" />
		{/if}
	</Chart>
</div>
