<script lang="ts">
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import type { PsoResult } from '$lib/types';
	import { toDateTimeString } from '$lib/utils';
	import Dialog from '@smui/dialog';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { Chart as ChartJS, LinearScale, PointElement } from 'chart.js';
	import { Scatter } from 'svelte-chartjs';

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

	const colorList = [
		'rgba(255, 99, 132, 0.5)',
		'rgba(54, 162, 235, 0.5)',
		'rgba(255, 205, 86, 0.5)'
	];

	/** this is shit code */
	const mapData = (data: PsoResult) => {
		let m = new Map();
		for (const dt of data.train_progress) {
			if (!m.has(dt.group)) {
				m.set(dt.group, {
					label: dt.group,
					data: [],
					backgroundColor: colorList[dt.group % colorList.length]
				});
			}
			m.get(dt.group).data.push({ x: dt.epoch, y: dt.f });
		}
		let datasets = [];
		for (const [, v] of m.entries()) {
			datasets.push(v);
		}
		return { datasets };
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

	ChartJS.register(LinearScale, PointElement);
</script>

<div>
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
				test_f {item.validation_f},
				<a href={`/settings/${item.preset}`} class="text-blue-400"> {item.preset}</a>
				<p>run at: {toDateTimeString(item.run_at)}</p>
			</div>
			<Scatter data={mapData(item)} />
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
					}}>Validation Result</button
				>
			</div>
		</div>
	{/each}
{/if}
