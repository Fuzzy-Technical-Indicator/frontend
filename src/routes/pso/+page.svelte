<script lang="ts">
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import Plotly from '$lib/plotly/Plotly.svelte';
	import type { PsoResult } from '$lib/types';
	import { secondsToHms, toDateTimeString } from '$lib/utils';
	import Dialog from '@smui/dialog';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	import Button, { Label, Icon } from '@smui/button';
	import { goto } from '$app/navigation';

	const psoResult = createQuery({
		queryKey: ['pso'],
		queryFn: () => api().getPsoResult()
	});

	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			confirm('Are you sure you want to delete this pso report?');
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
</script>

<h1 class="font-roboto uppercase my-8 text-center text-lg lg:text-2xl font-bold">PSO</h1>

<div class="flex justify-between">
	<Button variant="raised" on:click={() => goto('/pso/run')}>
		<Icon class="material-icons">speed</Icon>
		<Label class="text-xs md:text-sm">Run PSO</Label>
	</Button>

	<h3>
		Running
		{#if $runningPSO.isSuccess}
			{$runningPSO.data}
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

{#if $psoResult.isSuccess}
	{#each $psoResult.data as item (item._id)}
		<div class="mt-6">
			<div>
				test_f {item.test_f},
				<a href={`/settings/${item.preset}`} class="text-blue-400"> {item.preset}</a>
				<p>time used: {secondsToHms(item.time_used)}</p>
				<p>run at: {toDateTimeString(item.run_at)}</p>
			</div>
			<Plotly data={getLineData(item)} title="Validation Graph" />
			<!-- <Plotly data={getScatterData(item)} title="Training Progress" /> -->
			<div class="flex mt-2 space-x-4">
				<button
					class="bg-red-600 rounded-md hover:bg-red-500 p-2"
					on:click={() => $deleteMutation.mutate(item._id)}>Delete</button
				>
				<button
					class="bg-gray-900 hover:bg-gray-800 rounded-md p-2"
					on:click={() => {
						backtest_id = item.backtest_id;
						currTimestamp = new Date();
						$backtest.refetch();
						dialogOpen = true;
					}}>Test Result</button
				>
			</div>
		</div>
	{/each}
{/if}
