<script lang="ts">
	import type { BacktestResult } from '$lib/types';
	import { chartTheme } from '$lib/utils';
	import type { SingleValueData } from 'lightweight-charts';
	import { Chart, LineSeries, PriceLine } from 'svelte-lightweight-charts';

	export let data: BacktestResult;
	let metadata = data.metadata;
	let initial_capital = metadata.capital;
	let end_time: string;

	let start_time = new Date(metadata.start_time).toDateString();
	if (metadata.tag === 'NormalBackTest') {
		end_time = new Date(metadata.end_time).toDateString();
	} else if (metadata.tag === 'PsoBackTest') {
		end_time = new Date(metadata.validation_end_time).toDateString();
	}

	let cumalative_return = data.cumalative_return as SingleValueData[];
</script>

<div>
	Initial Capital = {metadata.capital}, Start = {start_time}, End = {end_time}
	{#each metadata.signal_conditions as condition, i}
		<div>
			Condition {i + 1} → index: {condition.signal_index}, threshold: {condition.signal_threshold}
			type: {condition.signal_do_command}, entry size %: {condition.entry_size_percent}
			take profit %: {condition.take_profit_when}
			stop losss %: {condition.stop_loss_when}
		</div>
	{/each}
</div>

<div class="flex space-x-8 mt-2">
	<div>
		Overview
		<p>pnl: {data.total.pnl.toFixed(2)}</p>
		<p>pnl_percent: {data.total.pnl_percent.toFixed(2)} %</p>
		<p>trades: {data.total.trades}</p>
	</div>

	<div>
		Profit Trades
		<p>pnl: {data.profit_trades.pnl.toFixed(2)}</p>
		<p>pnl_percent: {data.profit_trades.pnl_percent.toFixed(2)} %</p>
		<p>trades: {data.profit_trades.trades}</p>
	</div>

	<div>
		Loss Trades
		<p>pnl: {data.loss_trades.pnl.toFixed(2)}</p>
		<p>pnl_percent: {data.loss_trades.pnl_percent.toFixed(2)} %</p>
		<p>trades: {data.loss_trades.trades}</p>
	</div>
	<div>
		Maximum Drawdown
		<p>amount: {data.maximum_drawdown.amount.toFixed(2)}</p>
		<p>percent: {data.maximum_drawdown.percent.toFixed(2)} %</p>
	</div>
</div>

<Chart container={{ class: 'mt-2 chart-container' }} height={200} autoSize={true} {...chartTheme}>
	<LineSeries data={cumalative_return} lineWidth={1}>
		<PriceLine title="initial capital" price={initial_capital} />
	</LineSeries>
</Chart>
