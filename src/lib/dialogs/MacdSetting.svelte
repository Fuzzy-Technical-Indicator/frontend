<script lang="ts">
	import { getQueryKey } from '$lib/apiClient';
	import type { UserSettings } from '$lib/types';
	import BaseSetting from './BaseSetting.svelte';

	export let open: boolean;
	export let data: UserSettings['macd'];

	let dt = { macd: data };
	const qKey = getQueryKey(['macd']);
</script>

<BaseSetting bind:open bind:data={dt} queryKeyToInvalidate={qKey}>
	<span>fast</span>
	<input
		type="number"
		placeholder="fast"
		bind:value={dt.macd.fast}
		class="bg-zinc-900 text-white col-span-2"
	/>
	<span>slow</span>
	<input
		type="number"
		placeholder="slow"
		bind:value={dt.macd.slow}
		class="bg-zinc-900 text-white col-span-2"
	/>
	<span>smooth</span>
	<input
		type="number"
		placeholder="smooth"
		bind:value={dt.macd.smooth}
		class="bg-zinc-900 text-white col-span-2"
	/>
</BaseSetting>
