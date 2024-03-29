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

<div>
	<h1 class="text-sm md:text-base">
		<span class="font-bold">{data.ticker}</span>
		<span class="font-bold uppercase">{data.interval}</span>
		<a href={`/settings/${data.fuzzy_preset}`} class="text-blue-400 font-bold"
			>{data.fuzzy_preset}</a
		>
		{toDateTimeString(data.run_at)}
	</h1>

	<div class="text-sm md:text-base">
		<span class="font-bold">Initial Capital</span> = {metadata.capital},
		{#if metadata.tag === 'NormalBackTest'}
			<span class="font-bold">Start</span> = {toDateTimeString(metadata.start_time)},
			<span class="font-bold">End</span>
			= {toDateTimeString(metadata.end_time)}
		{/if}
		{#each metadata.signal_conditions as condition, i}
			<div>
				<span class="font-bold">Condition</span>
				{i + 1} → index: {condition.signal_index}, threshold: {condition.signal_threshold}
				type: {condition.signal_do_command}, capital manage: {condition.capital_management.type},
				min entry: {condition.capital_management.min_entry_size}, entry size %: {condition
					.capital_management.type === 'Normal'
					? condition.capital_management.entry_size_percent
					: 'N/A'}, take profit %: {condition.take_profit_when}, stop loss %: {condition.stop_loss_when}
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-4 gap-8 mt-2 text-xs md:text-sm">
		<div>
			<span class="font-bold">Overview</span>
			<p>pnl: {backtest_result.total.pnl.toFixed(2)}</p>
			<p>pnl_percent: {backtest_result.total.pnl_percent.toFixed(2)} %</p>
			<p>trades: {backtest_result.total.trades}</p>
		</div>

		<div>
			<span class="font-bold">Profit Trades</span>
			<p>pnl: {backtest_result.profit_trades.pnl.toFixed(2)}</p>
			<p>pnl_percent: {backtest_result.profit_trades.pnl_percent.toFixed(2)} %</p>
			<p>trades: {backtest_result.profit_trades.trades}</p>
		</div>

		<div>
			<span class="font-bold">Loss Trades</span>
			<p>pnl: {backtest_result.loss_trades.pnl.toFixed(2)}</p>
			<p>pnl_percent: {backtest_result.loss_trades.pnl_percent.toFixed(2)} %</p>
			<p>trades: {backtest_result.loss_trades.trades}</p>
		</div>
		<div>
			<span class="font-bold">Maximum Drawdown</span>
			<p>amount: {backtest_result.maximum_drawdown.amount.toFixed(2)}</p>
			<p>percent: {backtest_result.maximum_drawdown.percent.toFixed(2)} %</p>
		</div>
	</div>

	{#key timestamp}
		<Chart
			container={{ class: 'mt-2 chart-container' }}
			height={200}
			autoSize={true}
			{...chartTheme}
		>
			<LineSeries data={cumalative_return} lineWidth={1}>
				<PriceLine title="initial capital" price={initial_capital} />
			</LineSeries>
		</Chart>
	{/key}
</div>
