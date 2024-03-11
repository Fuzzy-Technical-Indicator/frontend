<script lang="ts">
	import { api } from '$lib/apiClient';
	import BacktestReport from '$lib/components/BacktestReport.svelte';
	import Plotly from '$lib/plotly/Plotly.svelte';
	import type { PsoResult } from '$lib/types';
	import { secondsToHms, toDateTimeString } from '$lib/utils';
	import uFuzzy from '@leeoniya/ufuzzy';
	import Dialog from '@smui/dialog';
	import Textfield from '@smui/textfield';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import type { PageServerData } from './$types';

	export let data: PageServerData;
	const psoResult = createQuery({
		queryKey: ['pso'],
		queryFn: () => api().getPsoResult(),
		refetchOnMount: false,
		initialData: data.psoData
	});

	const deleteMutation = createMutation({
		mutationFn: (id: string) => {
			confirm('Are you sure you want to delete this pso report?');
			return api().deletePsoResult(id);
		},
		onSuccess: () => $psoResult.refetch()
	});

	const getLineData = (data: PsoResult) => {
		return data.validation_progress.map((fold, i) => {
			return {
				x: fold.map((_, i) => i),
				y: fold,
				name: `fold ${i}`
			};
		});
	};

	let searchTerm = '';
	$: psoArr = $psoResult.isSuccess ? $psoResult.data : [];

	const uf = new uFuzzy();
	let timer: ReturnType<typeof setTimeout>;
	const debounce = (data: PsoResult[], searchTerm: string) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const haystacks = data.map((item) => item.preset);
			let idxs = uf.filter(haystacks, searchTerm);
			if (idxs !== null) {
				psoArr = idxs.map((i) => data[i]);
			}
		}, 250);
	};

	$: if ($psoResult.isSuccess) {
		debounce($psoResult.data, searchTerm);
	}

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

<div class="flex justify-between items-center">
	<Textfield class="" bind:value={searchTerm} label="Search" />
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

{#each psoArr as item (item._id)}
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
