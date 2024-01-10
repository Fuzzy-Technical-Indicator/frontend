<script lang="ts">
	import { getQueryKey } from '$lib/apiClient';
	import type { UserSettings } from '$lib/types';
	import BaseSetting from './BaseSetting.svelte';

	export let open: boolean;
	export let data: UserSettings['bb'];

	let dt = { bb: data };
	const qKey = getQueryKey(['bb']);
</script>

<BaseSetting bind:open queryKeyToInvalidate={qKey} bind:data={dt}>
	<span>length</span>
	<input
		type="number"
		placeholder="length"
		bind:value={dt.bb.length}
		class="bg-zinc-900 text-white col-span-2"
	/>
	<span>stdev</span>
	<input
		type="number"
		placeholder="stdev"
		bind:value={dt.bb.stdev}
		class="bg-zinc-900 text-white col-span-2"
	/>
</BaseSetting>
