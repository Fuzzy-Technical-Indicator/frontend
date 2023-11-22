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
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api, type UpdateLinguisticVariable } from '$lib/apiClient';

	const settings = createQuery({
		queryKey: ['settings'],
		queryFn: () => api().getSettings()
	});

	const linguisticVarOptions = ['rsi', 'bb'];
	let currLinguisticVarOpt = linguisticVarOptions[0];

	const client = useQueryClient();
	const updateMutation = createMutation({
		mutationFn: (data: UpdateLinguisticVariable) => api().updateSettings(data),
		onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] })
	});

	const handleAddLinguisticVar = () => {
		if (
			$settings.isSuccess &&
			!Object.keys($settings.data.linguisticVariables).includes(currLinguisticVarOpt)
		) {
			const data = {
				[currLinguisticVarOpt]: { lowerBoundary: 0, upperBoundary: 0, shapes: {} }
			};
			$updateMutation.mutate(data);
		}
	};

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
				<LinguisticVar {info} />
			{/each}
		{/if}

		<div class="mt-5">
			<button class="border border-black" on:click={handleAddLinguisticVar}
				>Add new Linguistic Variable</button
			>
			<select bind:value={currLinguisticVarOpt}>
				{#each linguisticVarOptions as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
		</div>
	</div>
</div>
