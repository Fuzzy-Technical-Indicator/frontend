<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import type { PageData } from './$types';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { priceFn } from '$lib/utils';
	import SingleLineChart from '$lib/SingleLineChart.svelte';

	export let data: PageData;
	let ohlc = data.ohlc;
	let [sma, bb_lower, bb_upper] = data.bb;

	let main: IChartApi | null;
	let offsetStyles: string[] = [];

	const handleResize = (main: IChartApi | null, apis: (IChartApi | null)[]): string[] => {
		const main_w = main ? main.priceScale('right').width() : 0;

		let offset_style = [];
		for (const api of apis) {
			let w = api ? api.priceScale('right').width() : 0;
			const margin = Math.max(main_w, w) - Math.min(main_w, w);
			offset_style.push(`width: calc(100% - ${margin}px)`);
		}
		return offset_style;
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

  let options = {
    rsi: 'rsi',
    adx: 'adx',
    obv: 'obv'
  }

	let bb = true;
	let otherCharts: (IChartApi | null)[] = [];
	let addedCharts: Set<string> = new Set();

	const handleAdd = (selected: string) => {
		addedCharts.add(selected);
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
			<div>
				<input type="checkbox" on:click={(_) => handleAdd(options.rsi)}/>
        {options.rsi.toUpperCase()}
			</div>
			<div>
				<input type="checkbox" on:click={(_) => handleAdd(options.adx)}/>
        {options.adx.toUpperCase()}
			</div>
			<div>
				<input type="checkbox" on:click={(_) => handleAdd(options.obv)}/>
        {options.obv.toUpperCase()}
			</div>
		</div>

		<TimeScale
			visible={true}
			on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, otherCharts)}
		/>
		<CandlestickSeries data={ohlc} />
		{#if bb}
			<LineSeries lineWidth={1} data={sma} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_lower} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_upper} />
		{/if}
	</Chart>

	{#each Array.from(addedCharts) as kind, i}
		<SingleLineChart
			ref={(ref) => otherCharts.push(ref)}
			offsetStyle={offsetStyles[i]}
			mainChart={main}
			{handleVisibleLogicalRangeChange}
			kind={kind}
		/>
	{/each}
</div>

<!--
		<LineSeries lineWidth={1} data={my_macd} color={'red'} />
		<LineSeries lineWidth={1} data={adx} color={'red'} />
		<LineSeries lineWidth={1} data={macd[0]} />
		<LineSeries lineWidth={1} data={macd[1]} color={"orange"} />
		<HistogramSeries data={macd[2]}/>
		<LineSeries lineWidth={1} data={long} color={'green'} />
		<LineSeries lineWidth={1} data={short} color={'red'} />
-->
