<script lang="ts">
	import { CandlestickSeries, Chart, LineSeries, TimeScale } from 'svelte-lightweight-charts';
	import type { PageData } from './$types';
	import type { IChartApi, LogicalRange, PriceFormatterFn } from 'lightweight-charts';

	export let data: PageData;
	let { ohlc, long, short /* rsi, sma, bb_lower, bb_upper */ } = data;

	let main: IChartApi | null;
	let rsi_chart: IChartApi | null;

	const handleLogicalRangeChange = (
		e: CustomEvent<LogicalRange | null> & { type: 'visibleLogicalRangeChange' },
		api: IChartApi | null
	) => {
		const range = e.detail;
		if (api && range) {
			api.timeScale().setVisibleLogicalRange(range);
		}
	};

	const priceFn: PriceFormatterFn = (price: number) => {
		return `${price.toFixed(2).padEnd(10)}`;
	};

	let c_sty = '';

	const handleResize = () => {
		// could be more generic
		const w1 = main ? main.priceScale('right').width() : 0;
		const w2 = rsi_chart ? rsi_chart.priceScale('right').width() : 0;
		const margin = Math.max(w1, w2) - Math.min(w1, w2);
		c_sty = `width: calc(100% - ${margin}px)`;
	};
</script>

<div class="w-screen h-screen">
	<Chart
		ref={(ref) => (main = ref)}
		container={{ class: 'h-5/6', style: '' }}
		autoSize={true}
		localization={{ priceFormatter: priceFn }}
	>
		<TimeScale
			visible={true}
			on:visibleLogicalRangeChange={(e) => {
				handleLogicalRangeChange(e, rsi_chart);
				handleResize(); // TODO: this is a hack
			}}
		/>
		<CandlestickSeries data={ohlc} />
		<!-- 
		<LineSeries lineWidth={1} data={sma} />
		<LineSeries lineWidth={1} color={"blue"} data={bb_lower} />
		<LineSeries lineWidth={1} color={"blue"}  data={bb_upper} /> 
		-->
	</Chart>
	<Chart
		ref={(ref) => (rsi_chart = ref)}
		container={{ class: 'h-1/6', style: c_sty }}
		autoSize={true}
		localization={{ priceFormatter: priceFn }}
	>
		<TimeScale
			on:visibleLogicalRangeChange={(e) => {
				handleLogicalRangeChange(e, main);
				handleResize(); // TODO: this is a hack
			}}
		/>
		<!-- 
		<LineSeries lineWidth={2} data={rsi} />
		-->
		<LineSeries lineWidth={2} data={long} color={'green'} />
		<LineSeries lineWidth={2} data={short} color={'red'} />
	</Chart>
</div>
