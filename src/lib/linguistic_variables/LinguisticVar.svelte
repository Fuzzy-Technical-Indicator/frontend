<script lang="ts">
	import { api } from '$lib/apiClient';
	import { ShapeType, type FuzzySet, type LinguisticVariable } from '$lib/types';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import omit from 'ramda/src/omit';
	import TriangleInputs from './TriangleInputs.svelte';
	import TrapezoidInputs from './TrapezoidInputs.svelte';

	export let info: LinguisticVariable;
	export let name: string;

	let lowerBoundary = info.lowerBoundary;
	let upperBoundary = info.upperBoundary;
	let shapes: Record<string, Omit<FuzzySet, 'data' | 'latex'>> = info.shapes;

	const handleRemoveFuzzySet = (name: string) => {
		shapes = omit([name], shapes);
	};

	let newFuzzySetType = ShapeType.Triangle;
	let newFuzzySetName = '';
	let newFuzzySetParameters: Record<string, number> = {};

	const handleAddNewFuzzySet = () => {
		if (!(newFuzzySetName in shapes)) {
			shapes[newFuzzySetName] = {
				shapeType: newFuzzySetType,
				parameters: newFuzzySetParameters
			};
			$updateMutation.mutate();
		}
	};

	const client = useQueryClient();
	const updateMutation = createMutation({
		mutationFn: () =>
			api().updateLinguisticVars({
				[name]: {
					lowerBoundary,
					upperBoundary,
					shapes: Object.fromEntries(
						Object.entries(shapes).map(([k, v]) => {
							return [k, { shapeType: v.shapeType, parameters: v.parameters }];
						})
					),
					kind: info.kind
				}
			}),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ['settings'] });
			newFuzzySetName = '';
			newFuzzySetParameters = {};
		}
	});

	const deleteMutation = createMutation({
		mutationFn: () => api().deleteLinguisticVar(name),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ['settings'] });
		}
	});
</script>

<div class="py-8">
	<div class="flex space-x-2">
		<p class="font-bold text-lg">universe:</p>
		<label class="px-2">
			lowerBoundary - 
			<input type="number" bind:value={lowerBoundary} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
		</label>
		<label class="px-2">
			upperBoundary - 
			<input type="number" bind:value={upperBoundary} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
		</label>
	</div>

	{#each Object.entries(shapes) as [name, shape] (name)}
		<div class="flex space-x-5 mt-2">
			<p class="font-bold text-lg">{`${name}, ${shape.shapeType}: `}</p>
			{#if shape.shapeType === ShapeType.Triangle}
				<TriangleInputs bind:parameters={shapes[name].parameters} />
			{:else if shape.shapeType === ShapeType.Trapezoid}
				<TrapezoidInputs bind:parameters={shapes[name].parameters} />
			{/if}
			<button class="bg-[#ff3232] text-[#FFFFFF] font-thin text-sm border border-[#313131] rounded-md px-2" on:click={() => handleRemoveFuzzySet(name)}>Remove</button
			>
		</div>
	{/each}
	<div class="my-3">
		<button class="border border-black" on:click={handleAddNewFuzzySet}><span class="font-bold text-lg">Fuzzy Set: </span></button>
		<label>
			name - 
			<input type="text" bind:value={newFuzzySetName} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
		</label>
		<select class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" bind:value={newFuzzySetType}>
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
		class="bg-[#4e7ffa] text-[#FFFFFF] font-thin text-sm border border-[#313131] rounded-md px-2 py-2"
		on:click={() => {
			$updateMutation.mutate();
		}}>Save</button
	>
	<button
		class="bg-[#ff3232] text-[#FFFFFF] font-thin text-sm border border-[#313131] rounded-md px-2 py-2"
		on:click={() => {
			$deleteMutation.mutate();
		}}
	>
		Remove
	</button>
</div>
