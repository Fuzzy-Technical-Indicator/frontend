<script lang="ts">
	import type { IChartApi, LineData, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;

	const getData = async () => {
		const resp = await fetch(`/api/aroon`);
		const data = (await resp.json()) as { upper: LineData[]; lower: LineData[] };
		return data;
	};
</script>

<Chart {ref} container={{ class: 'h-1/6 relative', style: offsetStyle }} autoSize={true}>
	<div class="absolute z-10 top-2 left-2">AROON</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} color={'orange'} data={dt.upper} />
		<LineSeries lastValueVisible={false} lineWidth={1} data={dt.lower} />
	{/await}
</Chart>
