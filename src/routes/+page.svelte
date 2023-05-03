<script lang="ts">
	import {
		CandlestickSeries,
		Chart,
		HistogramSeries,
		LineSeries,
		TimeScale
	} from 'svelte-lightweight-charts';
	import type { PageData } from './$types';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { priceFn } from '$lib/utills';
	import LineInd from '$lib/LineInd.svelte';

	export let data: PageData;
	let ohlc = data.ohlc;
	let [sma, bb_lower, bb_upper] = data.bb;

	let main: IChartApi | null;

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

	let offset_style: string[] = [];
	const handleVisibleLogicalRangeChange = (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => {
		offset_style = handleResize(main, other_apis); // a hack

		const range = e.detail;
		if (!range) return;

		for (const api of apis) {
			if (api) {
				api.timeScale().setVisibleLogicalRange(range);
			}
		}
	};
	//
	let bb = true;
	
	let options = [
		"RSI",
		"ADX"
	]; 
	let selected = options[0]; 

	let other_apis: (IChartApi | null)[] = [];
	let added_charts: string[] = [];
	const handleAdd = (selected: string) => {
		added_charts.push(selected)
	};
</script>

<div class="flex-row w-screen h-screen">
	<div class="p-4">
		<select bind:value={selected}>
			{#each options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
		<button class="bg-blue-600 p-2 text-white" on:click={(_) => handleAdd(selected)}>ADD</button>
	</div>

	<Chart
		ref={(ref) => (main = ref)}
		container={{ class: 'relative h-4/6' }}
		autoSize={true}
		localization={{ priceFormatter: priceFn }}
	>
		<div class="absolute z-10 top-0 left-0 p-2 ">
			BB blabla
			<input type="checkbox" bind:checked={bb} />
		</div>
		<TimeScale
			visible={true}
			on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, other_apis)}
		/>
		<CandlestickSeries data={ohlc} />
		{#if bb}
			<LineSeries lineWidth={1} data={sma} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_lower} />
			<LineSeries lineWidth={1} color={'blue'} data={bb_upper} />
		{/if}
	</Chart>
	
	{#each added_charts as type, i}

	<LineInd 
	 	ref={(ref) => (other_apis.push(ref))}
		offset_style={offset_style[i]}
		main_api={main}
		{handleVisibleLogicalRangeChange}
		ind_type={type}
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
