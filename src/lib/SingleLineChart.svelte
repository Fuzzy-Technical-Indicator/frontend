<script lang="ts">
	import type { IChartApi, LogicalRange } from 'lightweight-charts';
	import { Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import { toSingleValueData, type DTValue, INTERVAL, COIN, API_URL, formatterM } from './utils';

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
	const getData = async () => {
		const resp = await fetch(
			`${API_URL}/api/indicator/${kind.toLowerCase()}?symbol=${COIN}&interval=${INTERVAL}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		let result = toSingleValueData(json);

		let maxValue = Number.MIN_VALUE;
		for (let i = 0; i < result.length; i++) {
			let v = Math.abs(result[i].value);
			if (v > maxValue) {
				maxValue = v;
			}

			if (maxValue > 1000000) {
				exceed1M = true;
				break;
			}
		}
		return result;
	};
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

	{#await getData() then dt}
		<LineSeries lastValueVisible={false} lineWidth={1} {color} data={dt} />
	{/await}
</Chart>
