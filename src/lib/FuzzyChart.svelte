<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, TimeScale } from 'svelte-lightweight-charts';
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

	let chart: IChartApi;
	$: {
		if ($fuzzy.isSuccess && chart) {
			// this is fucking ugly but neccessary to make lightweight chart work
			// if we loop through $fuzzy.data, the web will crash (maybe because of svelte weird shit)
			if ($fuzzy.data.length >= 1) {
				const lineSeries = chart.addLineSeries({
					lineWidth: 1,
					lastValueVisible: false,
					color: 'green'
				});
				lineSeries.setData($fuzzy.data[0]);
			}
			if ($fuzzy.data.length >= 2) {
				const lineSeries = chart.addLineSeries({
					lineWidth: 1,
					lastValueVisible: false,
					color: 'red'
				});
				lineSeries.setData($fuzzy.data[1]);
			}
			if ($fuzzy.data.length >= 3) {
				const lineSeries = chart.addLineSeries({ lineWidth: 1, lastValueVisible: false });
				lineSeries.setData($fuzzy.data[2]);
			}
		}
	}
</script>

<div class="h-1/6 relative">
	<div class="absolute z-10 top-2 left-2 flex">
		<p>FUZZY {preset}</p>
	</div>
	<Chart
		ref={(r) => {
			ref(r);
			if (r != null) {
				chart = r;
			}
		}}
		container={{ class: 'chart-container h-full relative pt-2', style: offsetStyle }}
		autoSize={true}
		{...chartTheme}
	>
		<TimeScale
			on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
		/>
	</Chart>
</div>
