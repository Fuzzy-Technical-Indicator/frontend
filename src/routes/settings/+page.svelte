<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/apiClient';
	import { goto } from '$app/navigation';
	import { username } from '$lib/auth';

	import Card, { Content, Actions } from '@smui/card';
	import Button, { Label } from '@smui/button';
	import { Icon } from '@smui/icon-button';
	import Textfield from '@smui/textfield';
	import Tooltip, { Wrapper } from '@smui/tooltip';

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
	<h1 class="font-yuji my-8 text-center text-2xl font-bold">Fuzzy Presets Setting</h1>
	<h1 class="text-center text-xl font-extralight">{$username}'s settings</h1>
	<div>
		<Textfield class="mr-4" bind:value={currNewPresetName} label="Preset" />
		<Wrapper>
			<Button
				variant="raised"
				on:click={() => {
					$addMutation.mutate(currNewPresetName);
					let temp = currNewPresetName;
					currNewPresetName = '';
					goto(`/settings/${temp}`);
				}}
			>
				<Icon class="material-icons">add</Icon>
				<Label>Add new preset</Label>
			</Button>
			<Tooltip>Add new fuzzy preset.</Tooltip>
		</Wrapper>
	</div>
	<div class="preset-container grid grid-cols-4 gap-4 mt-8">
		{#if $presets.isSuccess}
			{#each $presets.data as preset}
				<div class="card-container my-2">
					<Card variant="outlined">
						<Content><span class="font-bold">{preset[0]}</span></Content>
						<Actions>
							<Button variant="outlined" href={`/settings/${preset[0]}`}>
								<Icon class="material-icons">edit</Icon>
								<Label>Edit</Label>
							</Button>
							<Button
								variant="outlined"
								on:click={() => {
									if (confirm('Are you sure?')) {
										$deleteMutation.mutate(preset[0]);
									}
								}}
							>
								<Icon class="material-icons">delete</Icon>
								<Label>Remove</Label>
							</Button>
						</Actions>
					</Card>
				</div>
			{/each}
		{/if}
	</div>
</div>
