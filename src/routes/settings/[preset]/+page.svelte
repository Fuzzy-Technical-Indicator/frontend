<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';
	import { LinguisticVarKind, type UpdateLinguisticVariable } from '$lib/types';
	import LinguisticVar from '$lib/linguistic_variables/LinguisticVar.svelte';
	import Desmos from '$lib/desmos/Desmos.svelte';
	import RulesTable from '$lib/fuzzy_rules/RulesTable.svelte';
	import type { PageData } from './$types';
	import Button, { Label } from '@smui/button';
	import { Icon } from '@smui/icon-button';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';

	export let data: PageData;
	let currPreset = data.currPreset;

	const settings = createQuery({
		queryKey: ['settings', currPreset],
		queryFn: () => api().getSettings(currPreset)
	});

	const linguisticVarOptions = [
		'rsi',
		'bb',
		'adx',
		'obv',
		'accumdist',
		'macd',
		'stoch',
		'aroonup',
		'aroondown',
		'custom'
	];
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
	<Button variant="outlined" class="mt-8" href="/settings">
		<Icon class="material-icons">arrow_back</Icon>
		<Label class="text-xs md:text-sm">Back</Label>
	</Button>
	<h1 class="text-lg lg:text-3xl font-bold text-center py-4">{currPreset}</h1>
	{#if $settings.isSuccess}
		<div class="">
			<h1 class="text-lg lg:text-2xl text-center py-4">Linguistic Variables</h1>
			<div class="linguistic-container grid grid-cols-1 xl:grid-cols-2 gap-4">
				{#each Object.entries($settings.data.linguisticVariables) as [name, info]}
					<div class="bg-[#00000080] my-8 p-4 border border-[#313131] rounded relative">
						<h3 class="text-base lg:text-lg text-center">{name} ({info.kind})</h3>
						<Desmos
							graphId={name}
							boundary={{ left: info.lowerBoundary, right: info.upperBoundary }}
							graphs={Object.values(info.shapes).map((v) => v.latex)}
							names={Object.keys(info.shapes)}
						/>
						<LinguisticVar {info} {name} preset={currPreset} />
					</div>
				{/each}
			</div>

			<div class="mt-5 text-center">
				<Select
					class="mr-4"
					variant="filled"
					bind:value={currLinguisticVarOpt}
					label="Linguistic Variable"
				>
					{#each linguisticVarOptions as opt}
						<Option value={opt}>{opt}</Option>
					{/each}
				</Select>

				{#if currLinguisticVarOpt === 'custom'}
					<Textfield class="mr-4" variant="filled" bind:value={customName} label="Name" />
				{/if}

				<Button class="mb-4" variant="raised" on:click={handleAddLinguisticVar}>
					<Icon class="material-icons">add</Icon>
					<Label class="text-xs sm:text-sm">Add Linguistic Variable</Label>
				</Button>
			</div>
		</div>
		<div class="mt-16">
			<h1 class="text-lg lg:text-2xl text-center py-4">Rules</h1>
			<RulesTable
				linguisticVariables={$settings.data.linguisticVariables}
				fuzzyRules={$settings.data.fuzzyRules}
				{currPreset}
			/>
			<!-- <div class="text-center">
				<Button class="mb-4" variant="raised" on:click={handleAddLinguisticVar}>
					<Icon class="material-icons">add</Icon>
					<Label>Add Linguistic Variable</Label>
				</Button>
			</div> -->
		</div>
	{/if}
</div>
