<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Button, { Label, Icon } from '@smui/button';

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

<h1 class="font-yuji my-8 text-center text-2xl font-bold">Backtesting</h1>

<!-- <button
	on:click={() => goto('/backtests/run')}
	class="bg-slate-100 text-black p-2 rounded-md hover:bg-slate-200 font-normal">Run Backtest</button
> -->

<Button variant="raised" on:click={() => goto('/backtests/run')}>
	<Icon class="material-icons">speed</Icon>
	<Label>Run Backtest</Label>
</Button>

<div class="mt-8">
	{#if $backtests.isSuccess}
		{#each $backtests.data as item (item._id)}
			<div class="border border-[#313131] rounded p-4 my-4">
				<BacktestReport data={item} />
				<Button class="mt-4" variant="outlined" on:click={() => $deleteMutation.mutate(item._id)}>
					<Icon class="material-icons">delete</Icon>
					<Label>Remove</Label>
				</Button>
			</div>
		{/each}
	{/if}
</div>
