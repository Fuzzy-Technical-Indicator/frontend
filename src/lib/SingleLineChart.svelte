<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { formatterM } from './utils';
	import { getQueryKey, api } from './apiClient';
	import { createQuery } from '@tanstack/svelte-query';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let kind: string;
	export let color: string | undefined = undefined;
	export let offsetStyle: string | undefined;

	let exceed1M = false;
	const line = createQuery({
		queryKey: getQueryKey([kind]),
		queryFn: async () => {
			if (kind === 'rsi') {
				return api().rsi(14);
			}
			if (kind === 'adx') {
				return api().adx(14);
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
</script>

<Chart
	{ref}
	container={{ class: 'h-1/6 relative', style: offsetStyle }}
	autoSize={true}
	localization={{ priceFormatter: exceed1M ? formatterM : undefined }}
>
	<div class="absolute z-10 top-2 left-2">{kind.toUpperCase()}</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#if $line.isSuccess}
		<LineSeries lastValueVisible={false} lineWidth={1} {color} data={$line.data} />
	{/if}
</Chart>
