<script lang="ts">
	import type { BacktestReport } from '$lib/types';
	import { chartTheme, toDateTimeString } from '$lib/utils';
	import type { SingleValueData } from 'lightweight-charts';
	import { Chart, LineSeries, PriceLine } from 'svelte-lightweight-charts';

	export let data: BacktestReport;
	export let timestamp = new Date();

	let backtest_result = data.backtest_result;
	let metadata = backtest_result.metadata;
	let initial_capital = metadata.capital;
	let cumalative_return = backtest_result.cumalative_return as SingleValueData[];
</script>

<h1>
	{data.ticker}
	{data.interval}
	<a href={`/settings/${data.fuzzy_preset}`} class="text-blue-400">{data.fuzzy_preset}</a>
	{toDateTimeString(data.run_at)}
</h1>

<div>
	Initial Capital = {metadata.capital},
	{#if metadata.tag === 'NormalBackTest'}
		Start = {toDateTimeString(metadata.start_time)}, End = {toDateTimeString(metadata.end_time)}
	{/if}
	{#each metadata.signal_conditions as condition, i}
		<div>
			Condition {i + 1} → index: {condition.signal_index}, threshold: {condition.signal_threshold}
			type: {condition.signal_do_command}, entry size %: {condition.capital_management
				.entry_size_percent}
			take profit %: {condition.take_profit_when}
			stop losss %: {condition.stop_loss_when}
		</div>
	{/each}
</div>

<div class="flex space-x-8 mt-2">
	<div>
		Overview
		<p>pnl: {backtest_result.total.pnl.toFixed(2)}</p>
		<p>pnl_percent: {backtest_result.total.pnl_percent.toFixed(2)} %</p>
		<p>trades: {backtest_result.total.trades}</p>
	</div>

	<div>
		Profit Trades
		<p>pnl: {backtest_result.profit_trades.pnl.toFixed(2)}</p>
		<p>pnl_percent: {backtest_result.profit_trades.pnl_percent.toFixed(2)} %</p>
		<p>trades: {backtest_result.profit_trades.trades}</p>
	</div>

	<div>
		Loss Trades
		<p>pnl: {backtest_result.loss_trades.pnl.toFixed(2)}</p>
		<p>pnl_percent: {backtest_result.loss_trades.pnl_percent.toFixed(2)} %</p>
		<p>trades: {backtest_result.loss_trades.trades}</p>
	</div>
	<div>
		Maximum Drawdown
		<p>amount: {backtest_result.maximum_drawdown.amount.toFixed(2)}</p>
		<p>percent: {backtest_result.maximum_drawdown.percent.toFixed(2)} %</p>
	</div>
</div>

{#key timestamp}
	<Chart container={{ class: 'mt-2 chart-container' }} height={200} autoSize={true} {...chartTheme}>
		<LineSeries data={cumalative_return} lineWidth={1}>
			<PriceLine title="initial capital" price={initial_capital} />
		</LineSeries>
	</Chart>
{/key}
