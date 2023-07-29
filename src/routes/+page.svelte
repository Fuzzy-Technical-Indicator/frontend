<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import type { PageData } from './$types';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { priceFn } from '$lib/utils';
	import SingleLineChart from '$lib/SingleLineChart.svelte';
	import MacdChart from '$lib/MacdChart.svelte';

	export let data: PageData;
	let ohlc = data.ohlc;
	let [sma, bb_lower, bb_upper] = data.bb;

	let main: IChartApi | null;
	let offsetStyles = new Map<string, string>();

	const handleResize = (
		main: IChartApi | null,
		apis: Map<string, IChartApi | null>
	): Map<string, string> => {
		const mainW = main ? main.priceScale('right').width() : 0;

		let offsetStyle = new Map();
		for (const [kind, api] of apis) {
			let w = api ? api.priceScale('right').width() : 0;
			const margin = Math.max(mainW, w) - Math.min(mainW, w);
			offsetStyle.set(kind, `width: calc(100% - ${margin}px)`);
		}
		return offsetStyle;
	};

	const handleVisibleLogicalRangeChange = (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => {
		offsetStyles = handleResize(main, otherCharts); // a hack

		const range = e.detail;
		if (!range) return;

		for (const api of apis) {
			if (api) {
				api.timeScale().setVisibleLogicalRange(range);
			}
		}
	};

	let singleLineOptions = ['rsi', 'adx', 'obv'];

	let bb = true;
	let macd = false;

	let otherCharts = new Map<string, IChartApi | null>();
	let singleLineCharts: Set<string> = new Set();

	const addSingleLineChart = (selected: string) => {
		singleLineCharts.add(selected);
	};
</script>

<div class="flex-row w-screen h-screen">
	<Chart
		ref={(ref) => (main = ref)}
		container={{ class: 'relative h-4/6' }}
		autoSize={true}
		localization={{ priceFormatter: priceFn }}
	>
		<div class="absolute z-10 top-0 left-0 p-2 ">
			<div>
				<input type="checkbox" bind:checked={bb} />
				BB
			</div>

			{#each singleLineOptions as opt}
				<div>
					<input type="checkbox" on:click={(_) => addSingleLineChart(opt)} />
					{opt.toUpperCase()}
				</div>
			{/each}

			<div>
				<input
					type="checkbox"
					on:click={(_) => {
						macd = !macd;
					}}
				/>
				MACD
			</div>
		</div>

		<TimeScale
			visible={true}
			on:visibleLogicalRangeChange={(e) =>
				handleVisibleLogicalRangeChange(e, Array.from(otherCharts.values()))}
		/>
		<CandlestickSeries data={ohlc} />
		{#if bb}
			<LineSeries lineWidth={1} data={sma} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_lower} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_upper} />
		{/if}
	</Chart>

	{#each Array.from(singleLineCharts) as kind, i}
		<SingleLineChart
			ref={(ref) => otherCharts.set(kind, ref)}
			offsetStyle={offsetStyles.get(kind)}
			mainChart={main}
			{handleVisibleLogicalRangeChange}
			{kind}
		/>
	{/each}

	{#if macd}
		<MacdChart
			ref={(ref) => otherCharts.set('macd', ref)}
			offsetStyle={offsetStyles.get('macd')}
			mainChart={main}
			{handleVisibleLogicalRangeChange}
		/>
	{/if}
</div>
