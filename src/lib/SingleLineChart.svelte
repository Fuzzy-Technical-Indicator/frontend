<script lang="ts">
	import type { IChartApi, LineData, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { formatterM } from './utils';
	import type { ApiClient } from './apiClient';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let kind: string;
	export let color: string | undefined = undefined;
	export let offsetStyle: string | undefined;
	export let apiClient: ApiClient;

	let exceed1M = false;
	const getData = async () => {
		if (kind === 'rsi') {
			return apiClient.rsi(14);
		}

		if (kind === 'adx') {
			return apiClient.adx(14);
		}

		if (kind === 'obv') {
			let [result, isExceed1M] = await apiClient.obv();
			exceed1M = isExceed1M;
			return result;
		}

		if (kind === 'accumdist') {
			let [result, isExceed1M] = await apiClient.accumdist();
			exceed1M = isExceed1M;
			return result;
		}

		return [] as LineData[];
	};
</script>

<Chart
	{ref}
	container={{ class: 'h-1/6 relative', style: offsetStyle }}
	autoSize={true}
	localization={{ priceFormatter: exceed1M ? formatterM : undefined }}
>
	<div class="absolute z-10 top-2 left-2">{kind.toUpperCase()}</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} {color} data={dt} />
	{/await}
</Chart>
