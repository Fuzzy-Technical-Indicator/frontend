import type { PageLoad } from './$types';
import type { CandlestickData, LineData } from 'lightweight-charts/dist/typings';
import { getTime, type DTValue, type Ohlc, toSingleValueDataOfIdx, API_URL, COIN, INTERVAL } from '$lib/utils';

type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

async function ohlc_from(fetch: Fetch): Promise<CandlestickData[]> {
	const resp = await fetch(`${API_URL}/api/ohlc?symbol=${COIN}&interval=${INTERVAL}`);
	const ohlc = (await resp.json()) as Ohlc[];
	const data: CandlestickData[] = ohlc.map((x) => {
		return {
			time: getTime(x),
			open: x.open,
			high: x.high,
			low: x.low,
			close: x.close
		} as CandlestickData;
	});
	return data;
}

async function bb_from(fetch: Fetch): Promise<[LineData[], LineData[], LineData[]]> {
	const resp = await fetch(`${API_URL}/api/indicator/bb?symbol=${COIN}&interval=${INTERVAL}`);
	const json = (await resp.json()) as DTValue<[number, number, number]>[];
	return [
		toSingleValueDataOfIdx(json, 0),
		toSingleValueDataOfIdx(json, 1),
		toSingleValueDataOfIdx(json, 2)
	];
}

async function fuzzy_from(fetch: Fetch): Promise<[LineData[], LineData[]]> {
	const resp = await fetch(`${API_URL}/api/fuzzy?symbol=${COIN}&interval=${INTERVAL}`);
	const json = (await resp.json()) as DTValue<number[]>[];
	const dt1: LineData[] = toSingleValueDataOfIdx(json, 0);
	const dt2: LineData[] = toSingleValueDataOfIdx(json, 1);
	return [dt1, dt2];
}

export const load: PageLoad = async ({ fetch }) => {
	const ohlc = await ohlc_from(fetch);
	const [sma, lower, upper] = await bb_from(fetch);

	return {
		ohlc: ohlc,
		bb: [sma, lower, upper]
	};
};
