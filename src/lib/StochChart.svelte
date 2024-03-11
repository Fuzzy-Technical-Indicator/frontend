<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { getQueryKey, api } from './apiClient';
	import { createQuery } from '@tanstack/svelte-query';
	import { chartTheme } from './utils';
	import Legend from './components/Legend.svelte';
	import StochSetting from './dialogs/StochSetting.svelte';
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
	const stoch = createQuery({
		queryKey: getQueryKey(['stoch']),
		queryFn: () => api().stoch()
	});
</script>

<StochSetting bind:open={dialogOpen} data={userSetting.stoch} />

<Chart
	{ref}
	container={{ class: 'chart-container h-2/6 md:h-1/6 relative pt-2', style: offsetStyle }}
	autoSize={true}
	{...chartTheme}
>
	<div class="absolute z-10 top-2 px-4 bg-black bg-opacity-50 rounded">
		<Legend
			name={'STOCH'}
			onSettingClick={() => {
				dialogOpen = true;
			}}
		/>
	</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $stoch.isSuccess}
		<LineSeries lastValueVisible={false} lineWidth={1} data={$stoch.data.dLine} reactive={true} />
		<LineSeries
			lastValueVisible={false}
			lineWidth={1}
			color={'orange'}
			data={$stoch.data.kLine}
			reactive={true}
		/>
	{/if}
</Chart>
