<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Button, { Label, Icon } from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';

	const backtests = createQuery({
		queryKey: ['backtests'],
		queryFn: () => api().getBacktestReports()
	});
	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			// confirm('Are you sure you want to delete this backtest report?');
			return api().deleteBacktestReport(id);
		},
		onSuccess: () => $backtests.refetch()
	});

	const runningBacktests = createQuery({
		queryKey: ['runningBacktests'],
		queryFn: () => api().getRunningBacktest(),
		refetchInterval: 5000
	});

	let open = false;
	let openItemId = '';
</script>

<h1 class="font-roboto uppercase my-8 text-center text-2xl font-bold">Backtesting</h1>

<div class="flex justify-between">
	<Button variant="raised" on:click={() => goto('/backtests/run')}>
		<Icon class="material-icons">speed</Icon>
		<Label>Run Backtest</Label>
	</Button>

	<h3>
		Running
		{#if $runningBacktests.isSuccess}
			{$runningBacktests.data}
		{:else}
			0
		{/if}
	</h3>
</div>

<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Confirm</Title>
	<Content id="simple-content">Are you sure you want to delete this backtest report?</Content>
	<Actions>
		<Button>
			<Label>No</Label>
		</Button>
		<Button on:click={() => $deleteMutation.mutate(openItemId)}>
			<Label>Yes</Label>
		</Button>
	</Actions>
</Dialog>

<div class="mt-8">
	{#if $backtests.isSuccess}
		{#each $backtests.data as item (item._id)}
			<div class="border border-[#313131] rounded p-4 my-4">
				<BacktestReport data={item} />
				<!-- <Button class="mt-4" variant="outlined" on:click={() => $deleteMutation.mutate(item._id)}>
					<Icon class="material-icons">delete</Icon>
					<Label>Remove</Label>
				</Button> -->
				<Button
					class="mt-4"
					variant="outlined"
					on:click={() => {
						open = true;
						openItemId = item._id;
					}}
				>
					<Icon class="material-icons">delete</Icon>
					<Label>Remove</Label>
				</Button>
			</div>
		{/each}
	{/if}
</div>
