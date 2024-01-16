<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import BacktestResult from '$lib/components/BacktestResult.svelte';
	import { createQuery } from '@tanstack/svelte-query';

	const backtests = createQuery({
		queryKey: ['backtest'],
		queryFn: () => api().getBacktestReports()
	});
</script>

<button
	on:click={() => goto('/backtests/run')}
	class="bg-slate-100 text-black p-2 rounded-md hover:bg-slate-200 font-normal">Run Backtest</button
>

<div>
	{#if $backtests.isSuccess}
		{#each $backtests.data as item}
			<div class="mt-6">
				{item.ticker}
				{item.interval}
				<a href={`/settings/${item.fuzzy_preset}`} class="text-blue-400">{item.fuzzy_preset}</a>
				{new Date(item.run_at).toUTCString()}
				<BacktestResult data={item.backtest_result} />
			</div>
		{/each}
	{/if}
</div>
