<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';
	import Button from '@smui/button';
	import { goto } from '$app/navigation';

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
		<input type="text" bind:value={currNewPresetName} class="bg-zinc-900 text-white mr-2" />
		<Button
			variant="raised"
			on:click={() => {
				$addMutation.mutate(currNewPresetName);
				let temp = currNewPresetName;
				currNewPresetName = '';
				goto(`/settings/${temp}`);
			}}>Add new preset</Button
		>
	</div>
	{#if $presets.isSuccess}
		{#each $presets.data as preset}
			<div class="flex mt-2">
				<a href={`/settings/${preset}`} class="border border-gray-600 rounded-sm py-1 px-16 mr-4"
					>{preset}</a
				>
				<Button
					class="red-button"
					variant="raised"
					on:click={() => {
						if (confirm('Are you sure?')) {
							$deleteMutation.mutate(preset);
						}
					}}>remove</Button
				>
			</div>
		{/each}
	{/if}
</div>
