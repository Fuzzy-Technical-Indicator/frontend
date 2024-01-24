<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	const backtests = createQuery({
		queryKey: ['backtests'],
		queryFn: () => api().getBacktestReports()
	});
	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			confirm('Are you sure you want to delete this backtest report?');
			return api().deleteBacktestReport(id);
		},
		onSuccess: () => $backtests.refetch()
	});
</script>

<button
	on:click={() => goto('/backtests/run')}
	class="bg-slate-100 text-black p-2 rounded-md hover:bg-slate-200 font-normal">Run Backtest</button
>

<div>
	{#if $backtests.isSuccess}
		{#each $backtests.data as item (item._id)}
			<div class="mt-6">
				<BacktestReport data={item} />
				<button
					class="bg-red-600 rounded-md hover:bg-red-500 p-2 mt-2"
					on:click={() => $deleteMutation.mutate(item._id)}>Delete</button
				>
			</div>
		{/each}
	{/if}
</div>
