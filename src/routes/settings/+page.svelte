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
	import LinguisticVar from '$lib/components/LinguisticVar.svelte';
	import { invalidateAll } from '$app/navigation';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';

	const settings = createQuery({
		queryKey: ['settings'],
		queryFn: () => api().getSettings()
	});

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
		{#if $settings.isSuccess}
			{#each Object.entries($settings.data.linguisticVariables) as [name, info]}
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
				<LinguisticVar
					{info}
					on:update={() => {
						invalidateAll();
					}}
				/>
			{/each}
		{/if}
	</div>
</div>
