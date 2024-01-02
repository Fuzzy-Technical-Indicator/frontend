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
	return data.map((x) => ({ time: getTime(x), value: nullToNan(x.value) } as SingleValueData));
}

function toSingleValueDataOfIdx(data: DTValue<number[]>[], idx: number): SingleValueData[] {
	return data.map((x) => ({ time: getTime(x), value: nullToNan(x.value[idx]) } as SingleValueData));
}

export const chartSettings = writable({ symbol: 'ETH/USDT', interval: Interval.OneDay });
export function getQueryKey(keys: string[]): string[] {
	const { symbol, interval } = get(chartSettings);
	return [symbol, interval, ...keys];
}

const defaultOption = {
	headers: { Connection: 'keep-alive' }
};
const indicatorBaseUrl = `${PUBLIC_API_URL}/api/indicators`;
export const api = (customFetch = fetch) => ({
	ohlc: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/ohlc?symbol=${symbol}&interval=${interval}`,
			defaultOption
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
			`${indicatorBaseUrl}/bb?symbol=${symbol}&interval=${interval}&length=${length}&stdev=${stdev}`,
			defaultOption
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
			`${indicatorBaseUrl}/stoch?symbol=${symbol}&interval=${interval}&k=${k}&d=${d}&length=${length}`,
			defaultOption
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const kLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const dLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		return { kLine, dLine };
	},
	macd: async (fast = 12, slow = 26, smooth = 9) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/macd?symbol=${symbol}&interval=${interval}&fast=${fast}&slow=${slow}&smooth=${smooth}`,
			defaultOption
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
			`${indicatorBaseUrl}/aroon?symbol=${symbol}&interval=${interval}&length=${length}`,
			defaultOption
		);
		const data = (await resp.json()) as DTValue<[number, number, number]>[];
		const upper: LineData[] = toSingleValueDataOfIdx(data, 0);
		const lower: LineData[] = toSingleValueDataOfIdx(data, 1);
		return { upper, lower };
	},
	fuzzy: async (preset: string) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/fuzzy?symbol=${symbol}&interval=${interval}&preset=${preset}`,
			defaultOption
		);
		const json = (await resp.json()) as DTValue<number[]>[];
		const result = Array.from({ length: json.length }, (_, i) => toSingleValueDataOfIdx(json, i));
		return result;
	},
	rsi: async (length = 14) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/rsi?symbol=${symbol}&interval=${interval}&length=${length}`,
			defaultOption
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	adx: async (length = 14) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/adx?symbol=${symbol}&interval=${interval}&length=${length}`,
			defaultOption
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	obv: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/obv?symbol=${symbol}&interval=${interval}`,
			defaultOption
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
	accumdist: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/accumdist?symbol=${symbol}&interval=${interval}`,
			defaultOption
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
	getSettings: async (preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings?preset=${preset}`,
			defaultOption
		);
		const json = (await resp.json()) as Settings;
		return json;
	},
	updateLinguisticVars: async (linguisticVariables: UpdateLinguisticVariable, preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/linguisticvars?preset=${preset}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Connection: 'keep-alive'
				},
				body: JSON.stringify(linguisticVariables)
			}
		);
		return resp;
	},
	deleteLinguisticVar: async (name: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/linguisticvars/${name}`, {
			method: 'DELETE',
			...defaultOption
		});
		return resp;
	},
	addFuzzyRules: async (data: NewFuzzyRule, preset: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/fuzzyrules?preset=${preset}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Connection: 'keep-alive'
			},
			body: JSON.stringify(data)
		});
		return resp;
	},
	deleteFuzzyRule: async (id: string, preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/fuzzyrules/${id}?preset=${preset}`,
			{
				method: 'DELETE',
				...defaultOption
			}
		);
		return resp;
	},
	getPresets: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/presets`, defaultOption);
		const json = (await resp.json()) as string[];
		return json;
	},
	addPreset: async (presetName: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/presets/${presetName}`, {
			method: 'POST',
			...defaultOption
		});
		return resp;
	},
	deletePreset: async (presetName: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/presets/${presetName}`, {
			method: 'DELETE',
			...defaultOption
		});
		return resp;
	}
});
