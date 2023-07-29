<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { toSingleValueData, type DTValue, api_url, formatterK } from './utils';

	export let mainChart: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let kind: string;
	export let color: string | undefined = undefined;
	export let offsetStyle: string | undefined;

	const getData = async () => {
		const resp = await fetch(
			`${api_url}/api/indicator/${kind.toLowerCase()}?symbol=ETH/USDT&interval=1d`
		);
		const json = (await resp.json()) as DTValue<number>[];
		return toSingleValueData(json);
	};
</script>

<Chart {ref} container={{ class: 'h-1/6 relative', style: offsetStyle }} autoSize={true}>
	<div class="absolute z-10 top-2 left-2">{kind.toUpperCase()}</div>
	<TimeScale
		on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [mainChart])}
	/>

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} {color} data={dt} />
	{/await}
</Chart>
