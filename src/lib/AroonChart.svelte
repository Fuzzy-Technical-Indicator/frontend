<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { api, getQueryKey } from './apiClient';
	import { chartTheme } from './utils';
	import Legend from './components/Legend.svelte';
	import AroonSetting from './dialogs/AroonSetting.svelte';
	import type { UserSettings } from './types';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let offsetStyle: string | undefined;
	export let userSetting: UserSettings;

	const aroon = createQuery({
		queryKey: getQueryKey(['aroon']),
		queryFn: () => api().aroon()
	});
	let dialogOpen = false;
</script>

<AroonSetting bind:open={dialogOpen} data={userSetting.aroon} />

<Chart
	{ref}
	container={{ class: 'chart-container h-1/6 relative pt-2', style: offsetStyle }}
	autoSize={true}
	{...chartTheme}
>
	<div class="absolute z-10 top-2 bg-black bg-opacity-50 rounded">
		<Legend
			name={'AROON'}
			onSettingClick={() => {
				dialogOpen = true;
			}}
		/>
	</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $aroon.isSuccess}
		<LineSeries
			lastValueVisible={false}
			lineWidth={1}
			color={'orange'}
			data={$aroon.data.upper}
			reactive={true}
		/>
		<LineSeries lastValueVisible={false} lineWidth={1} data={$aroon.data.lower} reactive={true} />
	{/if}
</Chart>
