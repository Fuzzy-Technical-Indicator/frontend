<script lang="ts">
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import Plotly from '$lib/plotly/Plotly.svelte';
	import type { PsoResult } from '$lib/types';
	import { secondsToHms, toDateTimeString } from '$lib/utils';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	import CircularProgress from '@smui/circular-progress';
	import Button, { Label, Icon } from '@smui/button';
	import { goto } from '$app/navigation';
	import TooltipDialog from '$lib/components/TooltipDialog.svelte';
	import PsoInfo from '$lib/dialogs/PsoInfo.svelte';

	const psoResult = createQuery({
		queryKey: ['pso'],
		queryFn: () => api().getPsoResult()
	});

	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			return api().deletePsoResult(id);
		},
		onSuccess: () => $psoResult.refetch()
	});

	const getScatterData = (data: PsoResult) => {
		let m = new Map<
			number,
			{
				x: number[];
				y: number[];
				type: string;
				mode: string;
				name: string;
				marker: Record<string, any>;
			}
		>();
		for (const dt of data.train_progress) {
			if (!m.has(dt.group)) {
				m.set(dt.group, {
					x: [],
					y: [],
					type: 'scatter',
					mode: 'markers',
					name: `group ${dt.group}`,
					marker: {
						opacity: 0.5
					}
				});
			}
			m.get(dt.group)?.x.push(dt.epoch);
			m.get(dt.group)?.y.push(dt.f);
		}
		return Array.from(m.values());
	};

	const getLineData = (data: PsoResult) => {
		return data.validation_progress.map((fold, i) => {
			return {
				x: fold.map((_, i) => i),
				y: fold,
				name: `fold ${i}`
			};
		});
	};

	let dialogOpen = false;
	let backtest_id = '';
	let currTimestamp = new Date();

	const backtest = createQuery({
		queryKey: ['backtest', backtest_id],
		queryFn: () => api().getBacktestReport(backtest_id),
		enabled: backtest_id !== ''
	});

	const runningPSO = createQuery({
		queryKey: ['runningPSO'],
		queryFn: () => api().getRunningPso(),
		refetchInterval: 5000
	});

	const setCurrentRunAndShow = (curr: number) => {
		currentRunning = curr;
		return curr;
	};

	let currentRunning = 0;

	$: if ($runningPSO.isSuccess && $runningPSO.data !== currentRunning) {
		$psoResult.refetch();
	}

	let open = false;
	let openItemId = '';
</script>

<h1 class="font-roboto uppercase my-8 text-center text-lg lg:text-2xl font-bold">PSO <TooltipDialog><PsoInfo/></TooltipDialog></h1>

<div class="flex justify-between">
	<Button variant="raised" on:click={() => goto('/pso/run')}>
		<Icon class="material-icons">speed</Icon>
		<Label class="text-xs md:text-sm">Run PSO</Label>
	</Button>

	<h3>
		Running:
		{#if $runningPSO.isSuccess}
			{setCurrentRunAndShow($runningPSO.data)}
		{:else}
			0
		{/if}
	</h3>
</div>

{#if $backtest.isSuccess}
	<Dialog bind:open={dialogOpen}>
		<div class="p-4">
			<BacktestReport data={$backtest.data} timestamp={currTimestamp} />
		</div>
	</Dialog>
{/if}

<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Confirm</Title>
	<Content id="simple-content">Are you sure you want to delete this pso report?</Content>
	<Actions>
		<Button>
			<Label>No</Label>
		</Button>
		<Button on:click={() => $deleteMutation.mutate(openItemId)}>
			<Label>Yes</Label>
		</Button>
	</Actions>
</Dialog>

{#if $psoResult.isSuccess}
	<div class="mt-6">
		{#each $psoResult.data as item (item._id)}
			<div class="h-1/6 border border-[#313131] rounded p-4 my-4">
				<span class="font-bold">test_f</span> {item.test_f},
				<a href={`/settings/${item.preset}`} class="text-blue-400"> {item.preset}</a>
				<p><span class="font-bold">time used</span>: {secondsToHms(item.time_used)}</p>
				<p><span class="font-bold">run at</span>: {toDateTimeString(item.run_at)}</p>
			<div class="my-4 border border-[#313131] h-1/6">
				<Plotly data={getLineData(item)} title="Validation Graph" />
			</div>
			<div class="flex mt-2 space-x-4">
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
				<Button
					class="mt-4"
					variant="outlined"
					on:click={() => {
						backtest_id = item.backtest_id;
						currTimestamp = new Date();
						$backtest.refetch();
						dialogOpen = true;
					}}
				>
					<Icon class="material-icons">search</Icon>
					<Label class="text-xs sm:text-sm">Test Result</Label>
				</Button>
			</div>
		</div>
		{/each}
	</div>
	{#if $psoResult.data.length === 0}
		<div class="text-center">
			<h1 class="text-xs md:text-lg">No PSO result.</h1>
		</div>
	{/if}
{:else}
	<div class="z-50 absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
		<CircularProgress style="height: 128px; width: 128px;" indeterminate />
	</div>
{/if}
