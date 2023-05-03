import type { PageLoad } from './$types';
import type {
	CandlestickData,
	HistogramData,
	LineData,
	SingleValueData,
	UTCTimestamp
} from 'lightweight-charts/dist/typings';

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

const COIN = 'ETH/USDT';
const INTERVAL = '1d';

function null_to_nan(x: number | null): number {
	return x == null ? NaN : x;
}

function get_time<T>(x: Ohlc | DTValue<T>): UTCTimestamp {
	return (x.time.$date.$numberLong / 1000) as UTCTimestamp;
}

function to_svd(data: DTValue<number>[]): SingleValueData[] {
	return data.map((x) => {
		return { time: get_time(x), value: null_to_nan(x.value) } as SingleValueData;
	});
}

function to_svd_idx(data: DTValue<number[]>[], idx: number): SingleValueData[] {
	return data.map((x) => {
		return { time: get_time(x), value: null_to_nan(x.value[idx]) } as SingleValueData;
	});
}

async function ohlc_from(fetch: Fetch): Promise<CandlestickData[]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/ohlc?symbol=${COIN}&interval=${INTERVAL}`);
	const ohlc = (await resp.json()) as Ohlc[];
	const data: CandlestickData[] = ohlc.map((x) => {
		return {
			time: get_time(x),
			open: x.open,
			high: x.high,
			low: x.low,
			close: x.close
		} as CandlestickData;
	});
	return data;
}

async function rsi_from(fetch: Fetch): Promise<LineData[]> {
	const resp = await fetch(
		`http://127.0.0.1:8000/api/indicator/rsi?symbol=${COIN}&interval=${INTERVAL}`
	);
	const json = (await resp.json()) as DTValue<number>[];
	return to_svd(json);
}
async function bb_from(fetch: Fetch): Promise<[LineData[], LineData[], LineData[]]> {
	const resp = await fetch(
		`http://127.0.0.1:8000/api/indicator/bb?symbol=${COIN}&interval=${INTERVAL}`
	);
	const json = (await resp.json()) as DTValue<[number, number, number]>[];
	return [to_svd_idx(json, 0), to_svd_idx(json, 1), to_svd_idx(json, 2)];
}

async function fuzzy_from(fetch: Fetch): Promise<[LineData[], LineData[]]> {
	const resp = await fetch(`http://127.0.0.1:8000/api/fuzzy?symbol=${COIN}&interval=${INTERVAL}`);
	const json = (await resp.json()) as DTValue<number[]>[];
	const dt1: LineData[] = to_svd_idx(json, 0);
	const dt2: LineData[] = to_svd_idx(json, 1);
	return [dt1, dt2];
}

async function macd_from(fetch: Fetch): Promise<[LineData[], LineData[], HistogramData[]]> {
	const resp = await fetch(
		`http://127.0.0.1:8000/api/indicator/macd?symbol=${COIN}&interval=${INTERVAL}`
	);
	const json = (await resp.json()) as DTValue<[number, number, number]>[];
	const macd_line: LineData[] = to_svd_idx(json, 0);
	const signal_line: LineData[] = to_svd_idx(json, 1);
	const histogram: HistogramData[] = to_svd_idx(json, 2);

	return [macd_line, signal_line, histogram];
}

async function adx_from(fetch: Fetch): Promise<LineData[]> {
	const resp = await fetch(
		`http://127.0.0.1:8000/api/indicator/adx?symbol=${COIN}&interval=${INTERVAL}`
	);
	const json = (await resp.json()) as DTValue<number>[];
	return to_svd(json);
}

async function mymacd_from(fetch: Fetch): Promise<LineData[]> {
	const resp = await fetch(
		`http://127.0.0.1:8000/api/indicator/mymacd?symbol=${COIN}&interval=${INTERVAL}`
	)
	const json = (await resp.json()) as DTValue<number>[];
	return to_svd(json);
}

export const load: PageLoad = async ({ fetch }) => {
	// this is hardcoded for now
	const ohlc = await ohlc_from(fetch);
	const [sma, lower, upper] = await bb_from(fetch);
	/*
	const rsi = await rsi_from(fetch);
	const [long, short] = await fuzzy_from(fetch);
	const macd = await macd_from(fetch);
	const adx = await adx_from(fetch);
	const mymacd = await mymacd_from(fetch);
	*/

	return {
		ohlc: ohlc,
		bb: [sma, lower, upper],
	};
};
