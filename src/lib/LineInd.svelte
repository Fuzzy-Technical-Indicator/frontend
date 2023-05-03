<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { to_svd, type DTValue } from './utills';

	export let main_api: IChartApi | null;
	export let handleVisibleLogicalRangeChange: (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		apis: (IChartApi | null)[]
	) => void;
	export let ref: (ref: IChartApi | null) => void;
	export let ind_type: string;
	export let color: string | undefined = undefined;
	export let offset_style: string;

	const get_data = async () => {
		const resp = await fetch(
			`http://127.0.0.1:8000/api/indicator/${ind_type.toLowerCase()}?symbol=ETH/USDT&interval=1d`
		);
		const json = (await resp.json()) as DTValue<number>[];
		return to_svd(json);
	};
</script>

<Chart
	{ref}
	container={{ class: 'h-1/6 relative', style: offset_style }}
	autoSize={true}
>
	<div class="absolute z-10 top-0 left-0">close</div>
	<TimeScale on:visibleLogicalRangeChange={(e) => handleVisibleLogicalRangeChange(e, [main_api])} />

	{#await get_data() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} {color} data={dt} />
	{/await}
</Chart>
