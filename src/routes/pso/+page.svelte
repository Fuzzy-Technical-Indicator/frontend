<script lang="ts">
	import { api } from '$lib/apiClient';
	import type { PsoResult } from '$lib/types';
	import { createQuery } from '@tanstack/svelte-query';
	import { Chart as ChartJS, LinearScale, PointElement } from 'chart.js';
	import { Scatter } from 'svelte-chartjs';

	const psoResult = createQuery({
		queryKey: ['backtest'],
		queryFn: () => api().getPsoResult()
	});

	const mapData = (data: PsoResult) => {
		let m = new Map();
		for (const dt of data.train_progress) {
			if (!m.has(dt.group)) {
				m.set(dt.group, {
					label: dt.group,
					data: [],
					backgroundColor: 'rgb(255, 99, 132)'
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

	ChartJS.register(LinearScale, PointElement);
</script>

{#if $psoResult.isSuccess}
	{#each $psoResult.data as item}
		<Scatter data={mapData(item)} />
	{/each}
{/if}
