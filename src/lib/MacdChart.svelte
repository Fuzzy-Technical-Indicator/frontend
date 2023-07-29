<script lang="ts">
	import type { HistogramData, IChartApi, LineData, LogicalRange } from 'lightweight-charts';
	import { Chart, HistogramSeries, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { type DTValue, api_url, toSingleValueDataOfIdx } from './utils';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;

	const getData = async () => {
		const resp = await fetch(`${api_url}/api/indicator/macd?symbol=ETH/USDT&interval=1d`);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const macd_line: LineData[] = toSingleValueDataOfIdx(json, 0);
		const signal_line: LineData[] = toSingleValueDataOfIdx(json, 1);
		const histogram: HistogramData[] = toSingleValueDataOfIdx(json, 2);

		return [macd_line, signal_line, histogram];
	};
</script>

<Chart {ref} container={{ class: 'h-1/6 relative', style: offsetStyle }} autoSize={true}>
	<div class="absolute z-10 top-2 left-2">MACD</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} data={dt[0]} />
		<LineSeries lastValueVisible={false} lineWidth={1} color={'orange'} data={dt[1]} />
		<HistogramSeries data={dt[2]} />
	{/await}
</Chart>
