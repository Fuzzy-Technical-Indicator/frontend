<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { priceFn, tickers } from '$lib/utils';
	import SingleLineChart from '$lib/SingleLineChart.svelte';
	import MacdChart from '$lib/MacdChart.svelte';
	import FuzzyChart from '$lib/FuzzyChart.svelte';
	import AroonChart from '$lib/AroonChart.svelte';
	import StochChart from '$lib/StochChart.svelte';
	import { createQuery, useIsFetching } from '@tanstack/svelte-query';
	import { api, getQueryKey, chartSettings } from '$lib/apiClient';
	import { get } from 'svelte/store';
	import { Interval } from '$lib/types';
	import { chartTheme } from '$lib/utils';
	import Button, { Label, Icon } from '@smui/button';
	import Dialog from '@smui/dialog';
	import CircularProgress from '@smui/circular-progress';
	import BbSetting from '$lib/dialogs/BBSetting.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	const ohlc = createQuery({
		queryKey: getQueryKey(['ohlc']),
		queryFn: () => api().ohlc()
	});

	const bbData = createQuery({
		queryKey: getQueryKey(['bb']),
		queryFn: () => api().bb()
	});

	const presets = createQuery({
		queryKey: ['presets'],
		queryFn: () => api().getPresets()
	});

	const userSettings = createQuery({
		queryKey: ['userSettings'],
		queryFn: () => api().getUserSettings()
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
		{ opt: 'accumdist', use: false },
		{ opt: 'transformed macd', use: false }
	];

	let bb = false;
	let macd = false;
	let aroon = false;
	let stoch = false;
	let settingDialogOpen = {
		bb: false
	};

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

	let fuzzyDialogOpen = false;
	let fuzzyPresets: { [key: string]: boolean } = {};

	const isFetching = useIsFetching();
</script>

{#if $isFetching > 0}
	<div class="z-20 absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
		<CircularProgress style="height: 128px; width: 128px;" indeterminate />
	</div>
{/if}

<div class="flex py-4">
	<Wrapper>
		<select
			class="bg-[#232428] text-[#F8F9FA] pl-2 rounded mr-4 custom-select"
			on:change={handleSymbolChange}
		>
			{#each tickers as ticker}
				<option value={ticker}>{ticker}</option>
			{/each}
		</select>
		<Tooltip>Select stock.</Tooltip>
	</Wrapper>

	<Wrapper>
		<select
			class="bg-[#232428] text-[#F8F9FA] pl-2 rounded custom-select"
			on:change={handleIntervalChange}
		>
			<option value={Interval.OneDay}>1D</option>
			<option value={Interval.FourHour}>4H</option>
			<option value={Interval.OneHour}>1H</option>
		</select>
		<Tooltip>Select interval.</Tooltip>
	</Wrapper>

	<Wrapper>
		<Button
			class="ml-4 my-primary-button"
			variant="raised"
			on:click={() => {
				fuzzyDialogOpen = true;
			}}
		>
			<Icon class="material-icons">menu</Icon>
			<Label>Fuzzy Presets</Label>
		</Button>
		<Tooltip>Select your fuzzy presets then plotting chart.</Tooltip>
	</Wrapper>
</div>

{#if $presets.isSuccess}
	<Dialog bind:open={fuzzyDialogOpen}>
		<div class="p-4">
			<h1 class="text-lg">Fuzzy Presets</h1>
			{#each $presets.data as preset}
				<div class="flex">
					<input class="mr-2" type="checkbox" bind:checked={fuzzyPresets[preset]} />
					<span class="font-thin">{preset}</span>
				</div>
			{/each}
		</div>
	</Dialog>
{/if}

{#if $userSettings.isSuccess}
	<BbSetting bind:open={settingDialogOpen.bb} data={$userSettings.data.bb} />
{/if}

{#key $ohlc.data && $bbData.data}
	<div class="flex-row h-screen">
		<Chart
			ref={(ref) => (main = ref)}
			container={{ class: 'chart-container relative h-4/6' }}
			autoSize={true}
			{...chartTheme}
			localization={{ priceFormatter: priceFn }}
		>
			<div
				class="absolute z-10 top-0 left-0 p-2 pr-4 bg-black bg-opacity-50 rounded drop-shadow-lg shadow-xl"
			>
				{$chartSettings.symbol.toLocaleUpperCase()}
				-
				{$chartSettings.interval.toUpperCase()}
				<Legend
					name="BB"
					onSettingClick={() => {
						settingDialogOpen.bb = true;
					}}
				>
					<input type="checkbox" bind:checked={bb} />
				</Legend>

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

		{#if $userSettings.isSuccess}
			{#each Array.from(singleLineCharts.entries()) as [kind, visible]}
				{#if visible}
					<SingleLineChart
						userSetting={$userSettings.data}
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
					userSetting={$userSettings.data}
					ref={(ref) => otherCharts.set('macd', ref)}
					offsetStyle={offsetStyles.get('macd')}
					mainChart={main}
					{handleVisibleLogicalRangeChange}
				/>
			{/if}

			{#if aroon}
				<AroonChart
					userSetting={$userSettings.data}
					ref={(ref) => otherCharts.set('aroon', ref)}
					offsetStyle={offsetStyles.get('aroon')}
					mainChart={main}
					{handleVisibleLogicalRangeChange}
				/>
			{/if}

			{#if stoch}
				<StochChart
					userSetting={$userSettings.data}
					ref={(ref) => otherCharts.set('stoch', ref)}
					offsetStyle={offsetStyles.get('stoch')}
					mainChart={main}
					{handleVisibleLogicalRangeChange}
				/>
			{/if}

			{#each Object.entries(fuzzyPresets) as [preset, enable]}
				{#if enable}
					<FuzzyChart
						{preset}
						ref={(ref) => otherCharts.set(`fuzzy-${preset}`, ref)}
						offsetStyle={offsetStyles.get(`fuzzy-${preset}`)}
						mainChart={main}
						{handleVisibleLogicalRangeChange}
					/>
				{/if}
			{/each}
		{/if}
	</div>
{/key}
