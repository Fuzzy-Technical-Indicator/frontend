<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';
	import { LinguisticVarKind, type UpdateLinguisticVariable } from '$lib/types';
	import LinguisticVar from '$lib/linguistic_variables/LinguisticVar.svelte';
	import Desmos from '$lib/desmos/Desmos.svelte';
	import RulesTable from '$lib/fuzzy_rules/RulesTable.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let currPreset = data.currPreset;

	const settings = createQuery({
		queryKey: ['settings', currPreset],
		queryFn: () => api().getSettings(currPreset)
	});

	const linguisticVarOptions = ['rsi', 'bb', 'custom'];
	let currLinguisticVarOpt = linguisticVarOptions[0];
	let customName = '';

	const client = useQueryClient();
	const updateLinguisticVarMutation = createMutation({
		mutationFn: (data: UpdateLinguisticVariable) => api().updateLinguisticVars(data, currPreset),
		onSuccess: () => client.invalidateQueries({ queryKey: ['settings', currPreset] })
	});

	const handleAddLinguisticVar = () => {
		if (
			$settings.isSuccess &&
			!Object.keys($settings.data.linguisticVariables).includes(currLinguisticVarOpt)
		) {
			const kind =
				currLinguisticVarOpt === 'custom' ? LinguisticVarKind.Output : LinguisticVarKind.Input;
			const data = {
				[currLinguisticVarOpt === 'custom' ? customName : currLinguisticVarOpt]: {
					lowerBoundary: 0,
					upperBoundary: 100,
					shapes: {},
					kind
				}
			};

			$updateLinguisticVarMutation.mutate(data);
		}
	};
</script>

<div>
	<a href="/settings"><button class="p-2 bg-gray-900">Back</button></a>
	<h1 class="text-3xl font-bold text-center py-4">{currPreset}</h1>
	{#if $settings.isSuccess}
		<div>
			<h1 class="text-2xl text-center py-4">Linguistic Variables</h1>
			{#each Object.entries($settings.data.linguisticVariables) as [name, info]}
				<h3 class="text-lg text-center">{name} ({info.kind})</h3>
				<Desmos
					graphId={name}
					boundary={{ left: info.lowerBoundary, right: info.upperBoundary }}
					graphs={Object.values(info.shapes).map((v) => v.latex)}
					names={Object.keys(info.shapes)}
				/>
				<LinguisticVar {info} {name} preset={currPreset} />
			{/each}

			<div class="mt-5">
				<button
					class="bg-[#4e7ffa] text-[#FFFFFF] border border-[#313131] rounded-md px-2 text-md font-thin"
					on:click={handleAddLinguisticVar}>Add new Linguistic Variable</button
				>
				<select
					class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md"
					bind:value={currLinguisticVarOpt}
				>
					{#each linguisticVarOptions as opt}
						<option value={opt}>{opt}</option>
					{/each}
				</select>
				{#if currLinguisticVarOpt === 'custom'}
					<label>
						name
						<input type="text" bind:value={customName} class="bg-zinc-900 text-white" />
					</label>
				{/if}
			</div>
		</div>
		<div class="mt-10">
			<h1 class="text-2xl">Rules</h1>
			<RulesTable
				linguisticVariables={$settings.data.linguisticVariables}
				fuzzyRules={$settings.data.fuzzyRules}
				{currPreset}
			/>
			<div class="flex space-x-2">
				<button
					class="bg-[#4e7ffa] text-[#FFFFFF] border border-[#313131] rounded-md px-2 text-md font-thin"
					>Add rule</button
				>
			</div>
		</div>
	{/if}
</div>
