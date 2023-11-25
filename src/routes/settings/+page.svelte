<script lang="ts">
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
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';
	import type { UpdateLinguisticVariable } from '$lib/types';
	import LinguisticVar from '$lib/linguistic_varaibles/LinguisticVar.svelte';
	import Desmos from '$lib/desmos/Desmos.svelte';

	const settings = createQuery({
		queryKey: ['settings'],
		queryFn: () => api().getSettings()
	});

	const linguisticVarOptions = ['rsi', 'bb', 'custom'];
	let currLinguisticVarOpt = linguisticVarOptions[0];
	let customName = '';

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
				[currLinguisticVarOpt === 'custom' ? customName : currLinguisticVarOpt]: {
					lowerBoundary: 0,
					upperBoundary: 0,
					shapes: {}
				}
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
				<Desmos
					graphId={name}
					boundary={{ left: info.lowerBoundary, right: info.upperBoundary }}
					graphs={Object.values(info.graphs).map((v) => v.latex)}
					names={Object.keys(info.graphs)}
				/>
				<LinguisticVar {info} {name} />
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
			{#if currLinguisticVarOpt === 'custom'}
				<label>
					name
					<input type="text" bind:value={customName} class="border border-black" />
				</label>
			{/if}
		</div>
	</div>
	<div class="mt-5">
		<h1 class="text-xl">Rules</h1>
	</div>
</div>
