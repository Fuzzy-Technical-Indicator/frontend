<script lang="ts">
	import { api } from '$lib/apiClient';
	import { Interval, PosType, type SignalCondition } from '$lib/types';
	import { tickers } from '$lib/utils';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	const defaultCondition: SignalCondition = {
		signal_index: 0,
		signal_threshold: 0,
		signal_do_command: PosType.Long,
		entry_size_percent: 10,
		take_profit_when: 20,
		stop_loss_when: 10
	};

	const presets = createQuery({
		queryKey: ['presets'],
		queryFn: () => api().getPresets()
	});

	let ticker = tickers[0];
	let interval = Interval.OneDay;
	let preset: string;

	let capital = 0;
	let signal_conditions: SignalCondition[] = [];
	let condition = defaultCondition;

	let start_time = 0; // TODO: need to change UI for this to calendar
	let end_time = 0;

	let runMutation = createMutation({
		mutationFn: () =>
			api().createBacktestReport(
				{ capital, start_time, end_time, signal_conditions },
				ticker,
				interval,
				preset
			)
	});
</script>

<div class="grid grid-cols-3 gap-2">
	<span>Ticker</span>
	<select bind:value={ticker}>
		{#each tickers as ticker}
			<option value={ticker}>{ticker}</option>
		{/each}
	</select>
	<span>Interval</span>
	<select bind:value={interval}>
		{#each Object.values(Interval) as interval}
			<option value={interval}>{interval}</option>
		{/each}
	</select>
	<span>Fuzzy Presets</span>
	<select bind:value={preset}>
		{#if $presets.isSuccess}
			{#each $presets.data as preset}
				<option value={preset}>{preset}</option>
			{/each}
		{/if}
	</select>
	<span>Initial Capital</span>
	<input type="number" placeholder="capital" bind:value={capital} />
	<span>Start time</span>
	<input type="number" placeholder="start time" bind:value={start_time} />
	<span>End time</span>
	<input type="number" placeholder="end time" bind:value={end_time} />
</div>

<div class="flex border-t mt-4 pt-4">
	<h3 class="mr-2 self-center">Conditions</h3>
	<button
		on:click={() => {
			signal_conditions.push(condition);
			signal_conditions = signal_conditions;
			condition = defaultCondition;
		}}>Add Condition</button
	>
</div>
<div class="grid grid-cols-3 gap-2">
	<span>signal index</span>
	<input type="number" placeholder="signal index" bind:value={condition.signal_index} />
	<span>threshold</span>
	<input type="number" placeholder="threshold" bind:value={condition.signal_threshold} />
	<span>type</span>
	<select bind:value={condition.signal_do_command} class="bg-zinc-900 text-white col-span-2">
		<option value="long">Long</option>
		<option value="short">Short</option>
	</select>
	<span>entry size %</span>
	<input type="number" placeholder="entry size %" bind:value={condition.entry_size_percent} />
	<span>take profit %</span>
	<input type="number" placeholder="take profit %" bind:value={condition.take_profit_when} />
	<span>stop loss %</span>
	<input type="number" placeholder="stop loss %" bind:value={condition.stop_loss_when} />
</div>

<div>
	{#each signal_conditions as cond}
		{JSON.stringify(cond)}
	{/each}
</div>

<button
	on:click={() => {
		$runMutation.mutate();
	}}>Run</button
>

<!-- <style lang="postcss">
	button {
		@apply bg-slate-100 text-black p-2 rounded-md font-normal;
	}
	button:hover {
		@apply bg-slate-200;
	}

	input {
		@apply bg-zinc-900 text-white border border-[#313131] rounded-md col-span-2 pl-1;
	}

	select {
		@apply bg-zinc-900 text-white border border-[#313131] rounded-md col-span-2;
	}
</style> -->
