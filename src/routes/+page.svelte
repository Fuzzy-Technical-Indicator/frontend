<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, PriceScale, TimeScale } from 'svelte-lightweight-charts';
	import type { PageData } from './$types';
	import type { IChartApi, LogicalRange, Range } from 'lightweight-charts';

	export let data: PageData;
	let { ohlc, rsi } = data;

	let chart: IChartApi | null;
	let axis: IChartApi | null;

	const handleChartLogicalRangeChange = (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' }
	) => {
		const range = e.detail;
		if (axis && range) axis.timeScale().setVisibleLogicalRange(range);
	};

	const handleAxisLogicalRangeChange = (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' }
	) => {
		const range = e.detail;
		if (chart && range) chart.timeScale().setVisibleLogicalRange(range);
	};
</script>

<div class="w-screen h-screen">
	<Chart ref={(ref) => (chart = ref)} container={{ class: 'w-10/12 h-5/6' }} autoSize={true}>
		<TimeScale visible={true} on:visibleLogicalRangeChange={handleChartLogicalRangeChange} />
		<CandlestickSeries data={ohlc} />
	</Chart>
	<Chart ref={(ref) => (axis = ref)} container={{ class: 'w-10/12 h-1/6' }} autoSize={true}>
		<TimeScale on:visibleLogicalRangeChange={handleAxisLogicalRangeChange} />
		<LineSeries data={rsi} />
	</Chart>
</div>
