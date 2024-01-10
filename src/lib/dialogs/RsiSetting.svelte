<script lang="ts">
	import { getQueryKey } from '$lib/apiClient';
	import type { UserSettings } from '$lib/types';
	import BaseSetting from './BaseSetting.svelte';

	export let open: boolean;
	export let data: UserSettings['rsi'];

	let dt = { rsi: data };
	const qKey = getQueryKey(['rsi']);
</script>

<BaseSetting bind:open bind:data={dt} queryKeyToInvalidate={qKey}>
	<span>length</span>
	<input
		type="number"
		placeholder="length"
		bind:value={dt.rsi.length}
		class="bg-zinc-900 text-white col-span-2"
	/>
</BaseSetting>
