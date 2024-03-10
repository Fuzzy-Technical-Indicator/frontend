<script lang="ts">
	import { api } from '$lib/apiClient';
	import type { UpdateUserSettings } from '$lib/types';
	import Button from '@smui/button';
	import Dialog from '@smui/dialog';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';

	export let open: boolean;
	export let data: UpdateUserSettings;
	export let queryKeyToInvalidate: string[];

	const client = useQueryClient();
	const updateMutation = createMutation({
		mutationFn: () => api().updateUserSetting(data),
		onSuccess: async () => {
			await client.invalidateQueries({ queryKey: queryKeyToInvalidate });
			open = false;
		}
	});
</script>

<div class="absolute z-20">
	<Dialog bind:open>
		<div class="p-4 grid grid-cols-3 gap-y-2">
			<slot />
			<Button variant="raised" class="mt-2 col-span-3" on:click={() => $updateMutation.mutate()}>Ok</Button
			>
		</div>
	</Dialog>
</div>
