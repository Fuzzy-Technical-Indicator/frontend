<script lang="ts">
	import type { IChartApi, LineData, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { type DTValue, toSingleValueDataOfIdx, COIN, INTERVAL, API_URL } from './utils';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;

	const getData = async () => {
		const resp = await fetch(`${API_URL}/api/indicator/aroon?symbol=${COIN}&interval=${INTERVAL}`);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const upper: LineData[] = toSingleValueDataOfIdx(json, 0);
		const lower: LineData[] = toSingleValueDataOfIdx(json, 1);
		return [upper, lower];
	};
</script>

<Chart {ref} container={{ class: 'h-1/6 relative', style: offsetStyle }} autoSize={true}>
	<div class="absolute z-10 top-2 left-2">AROON</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} color={'orange'} data={dt[0]} />
		<LineSeries lastValueVisible={false} lineWidth={1} data={dt[1]} />
	{/await}
</Chart>
