<script lang="ts">
	import { Chart, LineSeries } from 'svelte-lightweight-charts';
	const data = [
		{ time: '2019-04-11', value: 80.01 },
		{ time: '2019-04-12', value: 96.63 },
		{ time: '2019-04-13', value: 76.64 },
		{ time: '2019-04-14', value: 81.89 },
		{ time: '2019-04-15', value: 74.43 },
		{ time: '2019-04-16', value: 80.01 },
		{ time: '2019-04-17', value: 96.63 },
		{ time: '2019-04-18', value: 76.64 },
		{ time: '2019-04-19', value: 81.89 },
		{ time: '2019-04-20', value: 74.43 }
	];
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Chart width={800} height={600}>
	<LineSeries {data} />
</Chart>
