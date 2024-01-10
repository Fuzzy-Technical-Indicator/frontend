<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { formatterM } from './utils';
	import { getQueryKey, api } from './apiClient';
	import { createQuery } from '@tanstack/svelte-query';
	import { chartTheme } from './utils';
	import Legend from './components/Legend.svelte';
	import RsiSetting from './dialogs/RsiSetting.svelte';
	import type { UserSettings } from './types';
	import { any as rany } from 'ramda';
	import AdxSetting from './dialogs/AdxSetting.svelte';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let kind: string;
	export let color: string | undefined = undefined;
	export let offsetStyle: string | undefined;

	export let userSetting: UserSettings;

	let dialogOpen = false;
	let exceed1M = false;
	const queryKey = getQueryKey([kind]);
	const line = createQuery({
		queryKey,
		queryFn: async () => {
			if (kind === 'rsi') {
				return api().rsi();
			}
			if (kind === 'adx') {
				return api().adx();
			}
			if (kind === 'obv') {
				let [result, isExceed1M] = await api().obv();
				exceed1M = isExceed1M;
				return result;
			}

			if (kind === 'accumdist') {
				let [result, isExceed1M] = await api().accumdist();
				exceed1M = isExceed1M;
				return result;
			}

			throw Error('something wrong');
		}
	});

	const showSettingButton = rany((x) => kind === x)(['rsi', 'aroon', 'adx']);
</script>

{#if kind === 'rsi'}
	<RsiSetting bind:open={dialogOpen} data={userSetting.rsi} />
{/if}
{#if kind === 'adx'}
	<AdxSetting bind:open={dialogOpen} data={userSetting.adx} />
{/if}

<Chart
	{ref}
	container={{ class: 'chart-container h-1/6 relative pt-2', style: offsetStyle }}
	autoSize={true}
	localization={{ priceFormatter: exceed1M ? formatterM : undefined }}
	{...chartTheme}
>
	<div class="absolute z-10 top-2 left-2">
		<Legend
			name={kind.toUpperCase()}
			onSettingClick={() => {
				dialogOpen = true;
			}}
			{showSettingButton}
		/>
	</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#key $line.data}
		{#if $line.isSuccess}
			<LineSeries
				lastValueVisible={false}
				lineWidth={1}
				{color}
				data={$line.data}
				reactive={true}
			/>
		{/if}
	{/key}
</Chart>
