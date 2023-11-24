<script lang="ts">
	import { api } from '$lib/apiClient';
	import { ShapeType, type FuzzySet, type LinguisticVariable } from '$lib/types';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { omit } from 'ramda';
	import TriangleInputs from './TriangleInputs.svelte';
	import TrapezoidInputs from './TrapezoidInputs.svelte';

	export let info: LinguisticVariable;
	export let name: string;

	let lowerBoundary = info.lowerBoundary;
	let upperBoundary = info.upperBoundary;
	let graphs: Record<string, Omit<FuzzySet, 'data'>> = info.graphs;

	const handleRemoveFuzzySet = (name: string) => {
		graphs = omit([name], graphs);
	};

	let newFuzzySetType = ShapeType.Triangle;
	let newFuzzySetName = '';
	let newFuzzySetParameters: Record<string, number> = {};

	const handleAddNewFuzzySet = () => {
		if (!(newFuzzySetName in graphs)) {
			graphs[newFuzzySetName] = {
				type: newFuzzySetType,
				parameters: newFuzzySetParameters
			};
		}
	};

	const client = useQueryClient();
	const updateMutation = createMutation({
		mutationFn: () =>
			api().updateSettings({
				[name]: {
					lowerBoundary,
					upperBoundary,
					shapes: Object.fromEntries(
						Object.entries(graphs).map(([k, v]) => {
							return [k, { shapeType: v.type, parameters: v.parameters }];
						})
					)
				}
			}),
		onSuccess: () => client.invalidateQueries({ queryKey: ['settings'] })
	});
</script>

<div>
	<div class="flex space-x-2">
		<p>universe:</p>
		<label>
			lowerBoundary
			<input type="number" bind:value={lowerBoundary} class="border border-black" />
		</label>
		<label>
			upperBoundary
			<input type="number" bind:value={upperBoundary} class="border border-black" />
		</label>
	</div>

	{#each Object.entries(graphs) as [name, shape] (name)}
		<div class="flex space-x-5 mt-2">
			<p>{`${name}, ${shape.type}: `}</p>
			{#if shape.type === ShapeType.Triangle}
				<TriangleInputs bind:parameters={graphs[name].parameters} />
			{:else if shape.type === ShapeType.Trapezoid}
				<TrapezoidInputs bind:parameters={graphs[name].parameters} />
			{/if}
			<button class="border border-black" on:click={() => handleRemoveFuzzySet(name)}>remove</button
			>
		</div>
	{/each}
	<div class="my-3">
		<button class="border border-black" on:click={handleAddNewFuzzySet}>Add new Fuzzy Set</button>
		<label>
			name
			<input type="text" bind:value={newFuzzySetName} class="border border-black" />
		</label>
		<select bind:value={newFuzzySetType}>
			{#each Object.values(ShapeType) as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
		{#if newFuzzySetType === ShapeType.Triangle}
			<TriangleInputs bind:parameters={newFuzzySetParameters} />
		{:else if newFuzzySetType === ShapeType.Trapezoid}
			<TrapezoidInputs bind:parameters={newFuzzySetParameters} />
		{/if}
	</div>
	<button
		class="border-black border p-1"
		on:click={() => {
			$updateMutation.mutate();
		}}>save</button
	>
</div>
