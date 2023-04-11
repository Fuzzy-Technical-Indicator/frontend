import type { PageLoad } from './$types';
import type { CandlestickData, LineData, UTCTimestamp } from 'lightweight-charts/dist/typings';

type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

interface MongoTime {
	$date: {
		$numberLong: number;
	};
}

interface Ohlc {
	ticker: string;
	time: MongoTime;
	open: number;
	high: number;
	low: number;
	close: number;
}

interface DTValue<T> {
	time: MongoTime;
	value: T;
}

async function ohlc_from(fetch: Fetch): Promise<CandlestickData[]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/ohlc?symbol=BTC/USDT&interval=1d`);
	const ohlc = (await resp.json()) as Ohlc[];
	const data: CandlestickData[] = ohlc.map((x) => {
		const t = x.time.$date.$numberLong;
		return {
			time: (t / 1000) as UTCTimestamp,
			open: x.open,
			high: x.high,
			low: x.low,
			close: x.close
		} as CandlestickData;
	});
	return data;
}

async function rsi_from(fetch: Fetch): Promise<LineData[]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/indicator/rsi?symbol=BTC/USDT&interval=1d`);
	const json = (await resp.json()) as DTValue<number>[];
	const data: LineData[] = json.map((x) => {
		const t = x.time.$date.$numberLong;
		return {
			time: (t / 1000) as UTCTimestamp,
			value: x.value
		};
	});
	return data;
}

function bb_idx(data: DTValue<[number, number, number]>[], index: number): LineData[] {
	return data.map((x) => {
		return {
			time: (x.time.$date.$numberLong / 1000) as UTCTimestamp,
			value: x.value[index]
		} as LineData;
	});
}

async function bb_from(fetch: Fetch): Promise<[LineData[], LineData[], LineData[]]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/indicator/bb?symbol=BTC/USDT&interval=1d`);
	const json = (await resp.json()) as DTValue<[number, number, number]>[];
	return [bb_idx(json, 0), bb_idx(json, 1), bb_idx(json, 2)];
}

async function fuzzy_from(fetch: Fetch): Promise<[LineData[], LineData[]]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/fuzzy?symbol=BTC/USDT&interval=1d`);
	const json = (await resp.json()) as DTValue<number[]>[];
	const dt1: LineData[] = json.map((x) => {
		return {
			time: (x.time.$date.$numberLong / 1000) as UTCTimestamp,
			value: x.value[0]
		} as LineData;
	});
	const dt2: LineData[] = json.map((x) => {
		return {
			time: (x.time.$date.$numberLong / 1000) as UTCTimestamp,
			value: x.value[1]
		} as LineData;
	});
	return [dt1, dt2];
}

export const load: PageLoad = async ({ fetch }) => {
	// this is hardcoded for now
	const ohlc = await ohlc_from(fetch);
	//const rsi = await rsi_from(fetch);
	//const [sma, lower, upper] = await bb_from(fetch);
	const [long, short] = await fuzzy_from(fetch);

	const filler = ohlc
		.filter((x) => x.time < long[0].time)
		.map((x) => {
			return { time: x.time, value: NaN } as LineData;
		});
	/*
	rsi.unshift(...filler);
	sma.unshift(...filler);
	lower.unshift(...filler);
	upper.unshift(...filler);
	*/
	long.unshift(...filler);
	short.unshift(...filler);
	

	return {
		ohlc: ohlc,
		long: long,
		short: short,
		/*
		rsi: rsi,
		sma: sma,
		bb_lower: lower,
		bb_upper: upper
		*/
	};
};
