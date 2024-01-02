<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';

	const presets = createQuery({
		queryKey: ['presets'],
		queryFn: () => api().getPresets()
	});
	let currNewPresetName = '';

	const client = useQueryClient();
	const addMutation = createMutation({
		mutationFn: (presetName: string) => api().addPreset(presetName),
		onSuccess: () => client.invalidateQueries({ queryKey: ['presets'] })
	});
	const deleteMutation = createMutation({
		mutationFn: (presetName: string) => api().deletePreset(presetName),
		onSuccess: () => client.invalidateQueries({ queryKey: ['presets'] })
	});
</script>

<div class="">
	<h1 class="text-xl font-extralight">Username's settings</h1>
	<div>
		<input type="text" bind:value={currNewPresetName} class="bg-zinc-900 text-white" />
		<button
			class="bg-gray-900 p-2"
			on:click={() => {
				$addMutation.mutate(currNewPresetName);
				currNewPresetName = '';
			}}>Add new preset</button
		>
	</div>
	{#if $presets.isSuccess}
		{#each $presets.data as preset}
			<div class="m-2">
				<a href={`/settings/${preset}`} class="bg-sky-900 py-2 px-16 mx-2">{preset}</a>
				<button
					class="bg-red-900 p-1"
					on:click={() => {
						$deleteMutation.mutate(preset);
					}}>remove</button
				>
			</div>
		{/each}
	{/if}
</div>
