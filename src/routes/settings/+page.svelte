<script lang="ts">
	import { Line } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		Colors
	} from 'chart.js';
	import type { PageData } from './$types';
	import LinguisticVar from '$lib/components/LinguisticVar.svelte';

	export let data: PageData;

	const { apiClient, settings } = data;

	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		Colors
	);
</script>

<div class="p-10">
	<h1 class="text-xl">Username</h1>
	<div>
		<h1 class="text-xl">Linguistic Variables</h1>
		{#each Object.entries(settings.linguisticVariables) as [name, info]}
			<h3 class="text-lg text-center">{name}</h3>
			<Line
				data={{
					labels: info.labels,
					datasets: Object.entries(info.graphs).map(([k, v]) => {
						return { label: k, data: v.data, pointStyle: false };
					})
				}}
				options={{ responsive: true }}
			/>
			<LinguisticVar {info} {apiClient} />
		{/each}
	</div>
</div>
