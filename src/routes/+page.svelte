<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { priceFn } from '$lib/utils';
	import SingleLineChart from '$lib/SingleLineChart.svelte';
	import MacdChart from '$lib/MacdChart.svelte';
	import FuzzyChart from '$lib/FuzzyChart.svelte';
	import AroonChart from '$lib/AroonChart.svelte';
	import StochChart from '$lib/StochChart.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { api, getQueryKey, chartSettings } from '$lib/apiClient';
	import { get } from 'svelte/store';
	import { Interval } from '$lib/types';

	const ohlc = createQuery({
		queryKey: getQueryKey(['ohlc']),
		queryFn: () => api().ohlc()
	});

	const bbData = createQuery({
		queryKey: getQueryKey(['bb']),
		queryFn: () => api().bb()
	});

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

	let singleLineOptions = [
		{ opt: 'rsi', use: false },
		{ opt: 'adx', use: false },
		{ opt: 'obv', use: false },
		{ opt: 'accumdist', use: false }
	];

	let bb = false;
	let macd = false;
	let fuzzy = false;
	let aroon = false;
	let stoch = false;

	let otherCharts = new Map<string, IChartApi | null>();
	let singleLineCharts = new Map<string, boolean>();

	const addSingleLineChart = (kind: string) => {
		if (singleLineCharts.has(kind)) {
			let v = singleLineCharts.get(kind);
			singleLineCharts.set(kind, !v);
		} else {
			singleLineCharts.set(kind, true);
		}

		// use this to make svelte update UI
		singleLineCharts = singleLineCharts;
	};

	const handleSymbolChange = (e: any) => {
		chartSettings.set({ symbol: e.target.value, interval: get(chartSettings).interval });
		$ohlc.refetch();
		$bbData.refetch();
	};

	const handleIntervalChange = (e: any) => {
		chartSettings.set({ symbol: get(chartSettings).symbol, interval: e.target.value });
		$ohlc.refetch();
		$bbData.refetch();
	};

	const chartTheme = {
		layout: {
			background: {
				color: '#1A1A1A'
			},
			lineColor: '#000000',
			textColor: '#A6A6A6'
		},
		grid: {
			vertLines: { color: '#313131' },
			horzLines: { color: '#313131' }
		}
	};
</script>

<div class="flex py-4">
	<h1 class="pr-2 text-[#A6A6A6]">Chart :</h1>
	<select
		class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md mr-4"
		on:change={handleSymbolChange}
	>
		<option value="ETH/USDT">ETH/USDT</option>
		<option value="BTC/USDT">BTC/USDT</option>
		<option value="BNB/USDT">BNB/USDT</option>
		<option value="AAPL/USD">AAPL/USD</option>
		<option value="IBM/USD">IBM/USD</option>
		<option value="JPM/USD">JPM/USD</option>
		<option value="MSFT/USD">MSFT/USD</option>
		<option value="NKE/USD">NKE/USD</option>
		<option value="TSLA/USD">TSLA/USD</option>
	</select>

	<h1 class="pr-2 text-[#A6A6A6]">Interval :</h1>
	<select
		class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md"
		on:change={handleIntervalChange}
	>
		<option value={Interval.OneDay}>1D</option>
		<option value={Interval.FourHour}>4H</option>
		<option value={Interval.OneHour}>1H</option>
	</select>
</div>

{#key $ohlc.data && $bbData.data}
	<div class="flex-row h-screen">
		<Chart
			ref={(ref) => (main = ref)}
			container={{ class: 'chart-container relative h-4/6' }}
			autoSize={true}
			{...chartTheme}
			localization={{ priceFormatter: priceFn }}
		>
			<div class="absolute z-10 top-0 left-0 p-2">
				{$chartSettings.symbol.toLocaleUpperCase()}
				-
				{$chartSettings.interval.toUpperCase()}
				<div>
					<input type="checkbox" bind:checked={bb} />
					<span class="font-thin">BB</span>
				</div>

				{#each singleLineOptions as { opt, use }}
					<div>
						<input type="checkbox" bind:checked={use} on:click={() => addSingleLineChart(opt)} />
						<span class="font-thin">{opt.toUpperCase()}</span>
					</div>
				{/each}

				<div>
					<input
						type="checkbox"
						bind:checked={macd}
						on:click={() => {
							macd = !macd;
						}}
					/>
					<span class="font-thin">MACD</span>
				</div>

				<div>
					<input
						type="checkbox"
						bind:checked={aroon}
						on:click={() => {
							aroon = !aroon;
						}}
					/>
					<span class="font-thin">AROON</span>
				</div>

				<div>
					<input
						type="checkbox"
						bind:checked={stoch}
						on:click={() => {
							stoch = !stoch;
						}}
					/>
					<span class="font-thin">STOCH</span>
				</div>

				<div>
					<input
						type="checkbox"
						bind:checked={fuzzy}
						on:click={() => {
							fuzzy = !fuzzy;
						}}
					/>
					<span class="font-thin">NORMAL FUZZY</span>
				</div>
			</div>

			<TimeScale
				visible={true}
				on:visibleLogicalRangeChange={(e) =>
					handleVisibleLogicalRangeChange(e, Array.from(otherCharts.values()))}
			/>
			<CandlestickSeries data={$ohlc.data ? $ohlc.data : []} />
			{#if bb && $bbData.isSuccess}
				<LineSeries lineWidth={1} data={$bbData.data.sma} />
				<LineSeries lineWidth={1} color={'blue'} data={$bbData.data.lower} />
				<LineSeries lineWidth={1} color={'blue'} data={$bbData.data.upper} />
			{/if}
		</Chart>

		{#each Array.from(singleLineCharts.entries()) as [kind, visible]}
			{#if visible}
				<SingleLineChart
					ref={(ref) => otherCharts.set(kind, ref)}
					offsetStyle={offsetStyles.get(kind)}
					mainChart={main}
					{handleVisibleLogicalRangeChange}
					{kind}
				/>
			{/if}
		{/each}

		{#if macd}
			<MacdChart
				ref={(ref) => otherCharts.set('macd', ref)}
				offsetStyle={offsetStyles.get('macd')}
				mainChart={main}
				{handleVisibleLogicalRangeChange}
			/>
		{/if}

		{#if aroon}
			<AroonChart
				ref={(ref) => otherCharts.set('aroon', ref)}
				offsetStyle={offsetStyles.get('aroon')}
				mainChart={main}
				{handleVisibleLogicalRangeChange}
			/>
		{/if}

		{#if stoch}
			<StochChart
				ref={(ref) => otherCharts.set('stoch', ref)}
				offsetStyle={offsetStyles.get('stoch')}
				mainChart={main}
				{handleVisibleLogicalRangeChange}
			/>
		{/if}

		{#if fuzzy}
			<FuzzyChart
				ref={(ref) => otherCharts.set('fuzzy', ref)}
				offsetStyle={offsetStyles.get('fuzzy')}
				mainChart={main}
				{handleVisibleLogicalRangeChange}
			/>
		{/if}
	</div>
{/key}
