<script lang="ts">
	import { api, type FuzzySet, type Settings } from '$lib/apiClient';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { omit } from 'ramda';

	export let info: Settings['linguisticVariables'][keyof Settings['linguisticVariables']];

	let lowerBoundary = info.lowerBoundary;
	let upperBoundary = info.upperBoundary;
	let graphs: Record<string, Omit<FuzzySet, 'data'>> = info.graphs;

	const handleRemoveFuzzySet = (name: string) => {
		graphs = omit([name], graphs);
	};

	let newFuzzySetType = 'triangle';
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
				rsi: {
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
		{#if shape.type === 'triangle'}
			<div class="flex space-x-5 mt-2">
				<p>{`${name}, ${shape.type}: `}</p>
				<label>
					center
					<input
						type="number"
						bind:value={graphs[name].parameters.center}
						class="border-black border"
					/>
				</label>
				<label>
					width
					<input
						type="number"
						bind:value={graphs[name].parameters.width}
						class="border-black border"
					/>
				</label>
				<label>
					height
					<input
						type="number"
						bind:value={graphs[name].parameters.height}
						class="border-black border"
					/>
				</label>
				<button class="border border-black" on:click={() => handleRemoveFuzzySet(name)}
					>remove</button
				>
			</div>
		{/if}
	{/each}
	<div class="my-3">
		<button class="border border-black" on:click={handleAddNewFuzzySet}>Add new fuzzy set</button>
		<label>
			name
			<input type="text" bind:value={newFuzzySetName} class="border border-black" />
		</label>
		<select bind:value={newFuzzySetType}>
			<option value="triangle">triangle</option>
			<option value="trep">trep</option>
		</select>
		{#if newFuzzySetType === 'triangle'}
			<label>
				center
				<input
					type="number"
					bind:value={newFuzzySetParameters.center}
					class="border-black border"
				/>
			</label>
			<label>
				width
				<input type="number" bind:value={newFuzzySetParameters.width} class="border-black border" />
			</label>
			<label>
				height
				<input
					type="number"
					bind:value={newFuzzySetParameters.height}
					class="border-black border"
				/>
			</label>
		{/if}
	</div>
	<button
		class="border-black border p-1"
		on:click={() => {
			$updateMutation.mutate();
		}}>save</button
	>
</div>
