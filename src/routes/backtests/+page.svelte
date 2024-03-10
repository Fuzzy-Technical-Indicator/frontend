<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Button, { Label, Icon } from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import CircularProgress from '@smui/circular-progress';

	const backtests = createQuery({
		queryKey: ['backtests'],
		queryFn: () => api().getBacktestReports()
	});
	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			return api().deleteBacktestReport(id);
		},
		onSuccess: () => $backtests.refetch()
	});

	const runningBacktests = createQuery({
		queryKey: ['runningBacktests'],
		queryFn: () => api().getRunningBacktest(),
		refetchInterval: 5000
	});

	const setCurrentRunAndShow = (curr: number) => {
		currentRunning = curr;
		return curr;
	};

	$: if ($runningBacktests.isSuccess && $runningBacktests.data !== currentRunning) {
		$backtests.refetch();
	}

	let open = false;
	let openItemId = '';
	let currentRunning = 0;
</script>

<h1 class="font-roboto uppercase my-8 text-center text-lg lg:text-2xl font-bold">Backtesting</h1>

<div class="flex justify-between">
	<Button variant="raised" on:click={() => goto('/backtests/run')}>
		<Icon class="material-icons">speed</Icon>
		<Label class="text-xs md:text-sm">Run Backtest</Label>
	</Button>

	<h3>
		Running:
		{#if $runningBacktests.isSuccess}
			{setCurrentRunAndShow($runningBacktests.data)}
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
				<Button
					class="mt-4"
					variant="outlined"
					on:click={() => {
						open = true;
						openItemId = item._id;
					}}
				>
					<Icon class="material-icons">delete</Icon>
					<Label class="text-xs sm:text-sm">Remove</Label>
				</Button>
			</div>
		{/each}
		{#if $backtests.data.length === 0}
			<div class="text-center">
				<h1 class="text-xs md:text-lg">No backtest result.</h1>
			</div>
		{/if}
	{:else}
		<div class="z-50 absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
			<CircularProgress style="height: 128px; width: 128px;" indeterminate />
		</div>
	{/if}
</div>
