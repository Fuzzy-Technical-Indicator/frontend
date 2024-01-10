<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, HistogramSeries, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { createQuery } from '@tanstack/svelte-query';
	import { api, getQueryKey } from './apiClient';
	import { chartTheme } from './utils';
	import Legend from './components/Legend.svelte';
	import MacdSetting from './dialogs/MacdSetting.svelte';
	import type { UserSettings } from './types';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;
	export let userSetting: UserSettings;

	let dialogOpen = false;

	const macd = createQuery({
		queryKey: getQueryKey(['macd']),
		queryFn: () => api().macd()
	});
</script>

<MacdSetting bind:open={dialogOpen} data={userSetting.macd} />

<Chart
	{ref}
	container={{ class: 'chart-container h-1/6 relative pt-2', style: offsetStyle }}
	autoSize={true}
	{...chartTheme}
>
	<div class="absolute z-10 top-2 left-2">
		<Legend
			name={'MACD'}
			onSettingClick={() => {
				dialogOpen = true;
			}}
		/>
	</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $macd.isSuccess}
		<LineSeries lastValueVisible={false} lineWidth={1} data={$macd.data.macdLine} reactive={true} />
		<LineSeries
			lastValueVisible={false}
			lineWidth={1}
			color={'orange'}
			data={$macd.data.signalLine}
			reactive={true}
		/>
		<HistogramSeries data={$macd.data.histogram} reactive={true} />
	{/if}
</Chart>
