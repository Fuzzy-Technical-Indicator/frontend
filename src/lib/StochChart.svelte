<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { getQueryKey, api } from './apiClient';
	import { createQuery } from '@tanstack/svelte-query';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;

	const stoch = createQuery({
		queryKey: getQueryKey(['stoch']),
		queryFn: () => api().stoch()
	});
</script>

<Chart {ref} container={{ class: 'h-1/6 relative', style: offsetStyle }} autoSize={true}>
	<div class="absolute z-10 top-2 left-2">STOCH</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $stoch.isSuccess}
		<LineSeries lastValueVisible={false} lineWidth={1} data={$stoch.data.kLine} />
		<LineSeries lastValueVisible={false} lineWidth={1} color={'orange'} data={$stoch.data.kLine} />
	{/if}
</Chart>
