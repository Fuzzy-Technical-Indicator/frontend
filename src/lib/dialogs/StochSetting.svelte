<script lang="ts">
	import { getQueryKey } from '$lib/apiClient';
	import type { UserSettings } from '$lib/types';
	import BaseSetting from './BaseSetting.svelte';

	export let open: boolean;
	export let data: UserSettings['stoch'];

	let dt = { stoch: data };
	const qKey = getQueryKey(['stoch']);
</script>

<BaseSetting bind:open bind:data={dt} queryKeyToInvalidate={qKey}>
	<span>k</span>
	<input
		type="number"
		placeholder="k"
		bind:value={dt.stoch.k}
		class="bg-zinc-900 text-white col-span-2"
	/>
	<span>d</span>
	<input
		type="number"
		placeholder="d"
		bind:value={dt.stoch.d}
		class="bg-zinc-900 text-white col-span-2"
	/>
	<span>length</span>
	<input
		type="number"
		placeholder="length"
		bind:value={dt.stoch.length}
		class="bg-zinc-900 text-white col-span-2"
	/>
</BaseSetting>
