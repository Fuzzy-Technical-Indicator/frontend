<script lang="ts">
    import { api } from '$lib/apiClient';
    import { Interval, PosType, CapitalManagementType, type PsoParams, type SignalCondition } from '$lib/types';
    import { tickers } from '$lib/utils';
    import { createMutation, createQuery } from '@tanstack/svelte-query';

    import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import Button, { Label, Icon } from '@smui/button';
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import CircularProgress from '@smui/circular-progress';
	import { goto } from '$app/navigation';

    const defaultPsoParams: PsoParams = {
        limit: 10,
        particle_groups: 5,
        particle_amount: 10,
    }

    let psoParams = defaultPsoParams;

    const defaultCondition: SignalCondition = {
		signal_index: 0,
		signal_threshold: 0,
		signal_do_command: PosType.Long,
		capital_management: {
			type: CapitalManagementType.Normal,
			min_entry_size: 10,
			entry_size_percent: 10
		},
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

    let validation_period: number = 1;

    let test_start_date = '';
	let test_end_date = '';
	let test_start = 0;
	let test_end = 0;

    $: test_start = test_start_date ? new Date(test_start_date).getTime() : 0;
	$: test_end = test_end_date ? new Date(test_end_date).getTime() : 0;

    let runMutation = createMutation({
		mutationFn: () =>
			api().createPsoReport(
				{ ...psoParams, capital, validation_period, test_start, test_end, signal_conditions },
				ticker,
				interval,
				preset
			)
	});

    let fakeLoad = false;

</script>

{#if fakeLoad}
	<div class="z-20 absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
		<CircularProgress style="height: 128px; width: 128px;" indeterminate />
	</div>
{/if}

<div>
	<h1 class="font-roboto uppercase my-8 text-center text-lg lg:text-2xl font-bold">Setup PSO</h1>
</div>

<div class="p-4">
	<h1 class="text-center text-lg lg:text-xl mb-12">Particle Swarm Optimization</h1>
	<div class="grid grid-cols-2">
		<span class="pr-2">Limit</span>
		<Textfield variant="filled" type="number" bind:value={psoParams.limit} label="Limit" />

        <span class="pr-2">Particle Groups</span>
		<Textfield variant="filled" type="number" bind:value={psoParams.particle_groups} label="Particle Groups" />

        <span class="pr-2">Particle Amout</span>
		<Textfield variant="filled" type="number" bind:value={psoParams.particle_amount} label="Particle Amout" />
	</div>
</div>

<div class="p-4">
	<h1 class="text-center text-lg lg:text-xl mb-12">Trading Essentials</h1>
	<div class="grid grid-cols-2">
		<span class="pr-2">Ticker</span>
		<Select variant="filled" bind:value={ticker} label="Ticker">
			{#each tickers as ticker}
				<Option value={ticker}>{ticker}</Option>
			{/each}
		</Select>

		<span class="pr-2">Interval</span>
		<Select variant="filled" bind:value={interval} label="Interval">
			{#each Object.values(Interval) as interval}
				<Option value={interval}>{interval.toUpperCase()}</Option>
			{/each}
		</Select>

		<span class="pr-2">Fuzzy Preset</span>
		<Select variant="filled" bind:value={preset} label="Fuzzy Preset">
			{#if $presets.isSuccess}
				{#each $presets.data as preset}
					<Option value={preset[0]}>{preset[0]}</Option>
				{/each}
			{/if}
		</Select>

		<span class="pr-2">Initial Capital</span>
		<Textfield variant="filled" type="number" bind:value={capital} label="Capital" />

		<span class="pr-2">Start time</span>
		<input
			class="py-3 px-4 rounded-t bg-black text-white border-b border-[#717171]"
			type="date"
			placeholder="start time"
			bind:value={test_start_date}
		/>

		<span class="pr-2">End time</span>
		<input
			class="py-3 px-4 rounded-t bg-black text-white border-b border-[#717171]"
			type="date"
			placeholder="end time"
			bind:value={test_end_date}
		/>

        <span class="pr-2">Validation Period (months)</span>
		<Textfield variant="filled" type="number" bind:value={validation_period} label="Validation Period (months)" />
	</div>
</div>

<div class="p-4">
	<h1 class="text-center text-lg lg:text-xl mt-12">Ordering Conditions</h1>
	<div class="flex justify-between py-4">
		<h1 class="font-bold">Condition Setup</h1>
		<Button
			class=""
			variant="raised"
			on:click={() => {
				const newCondition = JSON.parse(JSON.stringify(condition)); // Deep copy the condition
				signal_conditions.push(newCondition);
				signal_conditions = signal_conditions;
				condition = defaultCondition;
			}}
		>
			<Icon class="material-icons">add</Icon>
			<Label class="text-xs md:text-sm">Add Condition</Label>
		</Button>
	</div>

	<div class="grid grid-cols-2">
		<span>Signal Index</span>
		<Textfield
			variant="filled"
			type="number"
			bind:value={condition.signal_index}
			label="Signal Index"
		/>

		<span>Signal Threshold</span>
		<Textfield
			variant="filled"
			type="number"
			bind:value={condition.signal_threshold}
			label="Signal Threshold"
		/>

		<span>Signal Do Command</span>
		<Select variant="filled" bind:value={condition.signal_do_command} label="Signal Do Command">
			<Option value="long">Long</Option>
			<Option value="short">Short</Option>
		</Select>

		<span>Capital Management Type</span>
		<Select
			variant="filled"
			bind:value={condition.capital_management.type}
			label="Capital Management Type"
		>
			<Option value={CapitalManagementType.Normal}>{CapitalManagementType.Normal}</Option>
			<Option value={CapitalManagementType.LiquidF}>{CapitalManagementType.LiquidF}</Option>
		</Select>

		{#if condition.capital_management.type === CapitalManagementType.Normal}
			<span>Minimum Entry Size</span>
			<Textfield
				variant="filled"
				type="number"
				bind:value={condition.capital_management.min_entry_size}
				label="Minimum Entry Size"
			/>

			<span>Entry size (%)</span>
			<Textfield
				variant="filled"
				type="number"
				bind:value={condition.capital_management.entry_size_percent}
				label="Entry size (%)"
			/>
		{:else if condition.capital_management.type === CapitalManagementType.LiquidF}
			<span>Minimum Entry Size</span>
			<Textfield
				variant="filled"
				type="number"
				bind:value={condition.capital_management.min_entry_size}
				label="Minimum Entry Size"
			/>
		{/if}

		<span>Take profit (%)</span>
		<Textfield
			variant="filled"
			type="number"
			bind:value={condition.take_profit_when}
			label="Take profit (%)"
		/>

		<span>Stop loss (%)</span>
		<Textfield
			variant="filled"
			type="number"
			bind:value={condition.stop_loss_when}
			label="Stop loss (%)"
		/>
	</div>
</div>

<div class="mx-auto text-center mt-8">
	<DataTable table$aria-label="Condition List" style="max-width: 100%;">
		<Head>
			<Row>
				<Cell numeric>No.</Cell>
				<Cell numeric>Signal Index</Cell>
				<Cell numeric>Signal Threshold</Cell>
				<Cell>Signal Do Command</Cell>
				<Cell>Capital Management Type</Cell>
				<Cell numeric>Minimum Entry Size</Cell>
				<Cell numeric>Entry size (%)</Cell>
				<Cell numeric>Take profit (%)</Cell>
				<Cell numeric>Stop loss (%)</Cell>
			</Row>
		</Head>
		<Body>
			{#each signal_conditions as cond}
				<Row>
					<Cell class="text-center" numeric>{signal_conditions.indexOf(cond) + 1}</Cell>
					<Cell class="text-center" numeric>{cond.signal_index}</Cell>
					<Cell class="text-center" numeric>{cond.signal_threshold}</Cell>
					<Cell class="text-center">{cond.signal_do_command}</Cell>
					<Cell class="text-center">{cond.capital_management.type}</Cell>
					<Cell class="text-center" numeric>{cond.capital_management.min_entry_size}</Cell>
					<Cell class="text-center" numeric
						>{cond.capital_management.type === CapitalManagementType.Normal
							? cond.capital_management.entry_size_percent
							: 'N/A'}</Cell
					>
					<Cell class="text-center" numeric>{cond.take_profit_when}</Cell>
					<Cell class="text-center" numeric>{cond.stop_loss_when}</Cell>
				</Row>
			{/each}
		</Body>
	</DataTable>
</div>

<div class="text-center my-12">
	<Button
		class=""
		variant="raised"
		on:click={() => {
			$runMutation.mutate();
			fakeLoad = true;
			setTimeout(() => {
				fakeLoad = false;
				goto('/pso');
			}, 500);
		}}
	>
		<Icon class="material-icons">speed</Icon>
		<Label class="text-xs sm:text-sm">Run PSO</Label>
	</Button>
</div>