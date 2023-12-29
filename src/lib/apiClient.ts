import { PUBLIC_API_URL } from '$env/static/public';
import type {
	CandlestickData,
	HistogramData,
	LineData,
	SingleValueData,
	UTCTimestamp
} from 'lightweight-charts';
import { get, writable } from 'svelte/store';
import {
	Interval,
	type DTValue,
	type NewFuzzyRule,
	type Ohlc,
	type Settings,
	type UpdateLinguisticVariable
} from './types';

function nullToNan(x: number | null): number {
	return x == null ? NaN : x;
}

function getTime<T>(x: Ohlc | DTValue<T>): UTCTimestamp {
	return (x.time / 1000) as UTCTimestamp;
}

function toSingleValueData(data: DTValue<number>[]): SingleValueData[] {
	return data.map((x) => {
		return { time: getTime(x), value: nullToNan(x.value) } as SingleValueData;
	});
}

function toSingleValueDataOfIdx(data: DTValue<number[]>[], idx: number): SingleValueData[] {
	return data.map((x) => {
		return { time: getTime(x), value: nullToNan(x.value[idx]) } as SingleValueData;
	});
}

export const chartSettings = writable({ symbol: 'ETH/USDT', interval: Interval.OneDay });
export function getQueryKey(keys: string[]): string[] {
	const { symbol, interval } = get(chartSettings);
	return [symbol, interval, ...keys];
}

const indicatorBaseUrl = `${PUBLIC_API_URL}/api/indicators`;
export const api = (customFetch = fetch) => ({
	ohlc: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/ohlc?symbol=${symbol}&interval=${interval}`
		);
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
	},
	bb: async (length = 20, stdev = 2) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/bb?symbol=${symbol}&interval=${interval}&length=${length}&stdev=${stdev}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		return {
			sma: toSingleValueDataOfIdx(json, 0),
			lower: toSingleValueDataOfIdx(json, 1),
			upper: toSingleValueDataOfIdx(json, 2)
		};
	},
	stoch: async (k = 14, d = 3, length = 1) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/stoch?symbol=${symbol}&interval=${interval}&k=${k}&d=${d}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const kLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const dLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		return { kLine, dLine };
	},
	macd: async (fast = 12, slow = 26, smooth = 9) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/macd?symbol=${symbol}&interval=${interval}&fast=${fast}&slow=${slow}&smooth=${smooth}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const macdLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const signalLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		const histogram: HistogramData[] = toSingleValueDataOfIdx(json, 2);
		return { macdLine, signalLine, histogram };
	},
	aroon: async (length = 14) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/aroon?symbol=${symbol}&interval=${interval}&length=${length}`
		);
		const data = (await resp.json()) as DTValue<[number, number, number]>[];
		const upper: LineData[] = toSingleValueDataOfIdx(data, 0);
		const lower: LineData[] = toSingleValueDataOfIdx(data, 1);
		return { upper, lower };
	},
	fuzzy: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/fuzzy?symbol=${symbol}&interval=${interval}`
		);
		const json = (await resp.json()) as DTValue<[number, number]>[];
		const long: LineData[] = toSingleValueDataOfIdx(json, 0);
		const short: LineData[] = toSingleValueDataOfIdx(json, 1);
		return { long, short };
	},
	rsi: async (length = 14) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/rsi?symbol=${symbol}&interval=${interval}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	adx: async (length = 14) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/adx?symbol=${symbol}&interval=${interval}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},

	obv: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(`${indicatorBaseUrl}/obv?symbol=${symbol}&interval=${interval}`);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		let maxValue = Number.MIN_VALUE;
		let exceed1M = false;
		for (let i = 0; i < result.length; i++) {
			const v = Math.abs(result[i].value);
			if (v > maxValue) {
				maxValue = v;
			}

			if (maxValue > 1000000) {
				exceed1M = true;
				break;
			}
		}

		return [result, exceed1M];
	},
	accumdist: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/accumdist?symbol=${symbol}&interval=${interval}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		let maxValue = Number.MIN_VALUE;
		let exceed1M = false;
		for (let i = 0; i < result.length; i++) {
			const v = Math.abs(result[i].value);
			if (v > maxValue) {
				maxValue = v;
			}

			if (maxValue > 1000000) {
				exceed1M = true;
				break;
			}
		}
		return [result, exceed1M];
	},
	getSettings: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings`);
		const json = (await resp.json()) as Settings;
		return json;
	},
	updateLinguisticVars: async (linguisticVariables: UpdateLinguisticVariable) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/linguisticvars`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(linguisticVariables)
		});
		return resp;
	},
	deleteLinguisticVar: async (name: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/linguisticvars/${name}`, {
			method: 'DELETE'
		});
		return resp;
	},
	addFuzzyRules: async (data: NewFuzzyRule) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/fuzzyrules`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		return resp;
	},
	deleteFuzzyRule: async (id: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/fuzzyrules/${id}`, {
			method: 'DELETE'
		});
		return resp;
	}
});
