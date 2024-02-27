import { PUBLIC_API_URL } from '$env/static/public';
import type {
	CandlestickData,
	HistogramData,
	LineData,
	SingleValueData,
	UTCTimestamp
} from 'lightweight-charts';
import { get, writable } from 'svelte/store';
import { username } from './auth';
import {
	Interval,
	type BacktestReport,
	type BacktestRequest,
	type DTValue,
	type NewFuzzyRule,
	type Ohlc,
	type PsoResult,
	type Settings,
	type UpdateLinguisticVariable,
	type UpdateUserSettings,
	type UserSettings
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

function getDefaultOption({
	method,
	headers,
	body
}: {
	method?: string;
	headers?: Record<string, string>;
	body?: BodyInit;
}): RequestInit {
	const defaultHeader: HeadersInit = {
		Connection: 'keep-alive',
		Authorization: `Bearer ${get(username)}`,
		...headers
	};
	return { method, body, headers: defaultHeader };
}

const indicatorBaseUrl = `${PUBLIC_API_URL}/api/indicators`;
export const api = (customFetch = fetch) => ({
	ohlc: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/ohlc?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
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
	bb: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/bb?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		return {
			sma: toSingleValueDataOfIdx(json, 0),
			lower: toSingleValueDataOfIdx(json, 1),
			upper: toSingleValueDataOfIdx(json, 2)
		};
	},
	stoch: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/stoch?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const kLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const dLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		return { kLine, dLine };
	},
	macd: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/macd?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const macdLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const signalLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		const histogram: HistogramData[] = toSingleValueDataOfIdx(json, 2);
		return { macdLine, signalLine, histogram };
	},
	aroon: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/aroon?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
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
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number[]>[];

		const result = {
			first: toSingleValueDataOfIdx(json, 0),
			second: toSingleValueDataOfIdx(json, 1)
		};
		return result;
	},
	rsi: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/rsi?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	adx: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/adx?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	obv: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorBaseUrl}/obv?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
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
			getDefaultOption({})
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
			getDefaultOption({})
		);
		const json = (await resp.json()) as Settings;
		return json;
	},
	updateLinguisticVars: async (linguisticVariables: UpdateLinguisticVariable, preset: string) => {
		console.log(linguisticVariables);
		const body = JSON.stringify(linguisticVariables);
		console.log(body);

		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/linguisticvars?preset=${preset}`,
			getDefaultOption({
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body
			})
		);
		return resp;
	},
	deleteLinguisticVar: async (name: string, preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/linguisticvars/${name}?preset=${preset}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	addFuzzyRules: async (data: NewFuzzyRule, preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/fuzzyrules?preset=${preset}`,
			getDefaultOption({
				body: JSON.stringify(data),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			})
		);
		return resp;
	},
	deleteFuzzyRule: async (id: string, preset: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/fuzzyrules/${id}?preset=${preset}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	getPresets: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/presets`, getDefaultOption({}));
		const json = (await resp.json()) as string[];
		return json;
	},
	addPreset: async (presetName: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/presets/${presetName}`,
			getDefaultOption({ method: 'POST' })
		);
		return resp;
	},
	deletePreset: async (presetName: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/presets/${presetName}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	/**
	 * Special Fake API for checking if username is valid
	 */
	isUsernameOkay: async (username: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/presets`, {
			headers: { Authorization: `Bearer ${username}` }
		});

		if (resp.status === 401) {
			return false;
		}
		return true;
	},
	getUserSettings: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/settings/users`, getDefaultOption({}));
		const json = (await resp.json()) as UserSettings;
		return json;
	},
	updateUserSetting: async (data: UpdateUserSettings) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/settings/users`,
			getDefaultOption({
				method: 'PUT',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			})
		);
		return resp;
	},
	getRunningBacktest: async () => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/backtesting/running`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as number;
		return json;
	},
	getBacktestReports: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/backtesting`, getDefaultOption({}));
		const json = (await resp.json()) as BacktestReport[];
		return json;
	},
	getBacktestReport: async (id: string) => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/backtesting/${id}`, getDefaultOption({}));
		const json = (await resp.json()) as BacktestReport;
		return json;
	},
	deleteBacktestReport: async (id: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/backtesting/${id}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	createBacktestReport: async (
		data: Omit<BacktestRequest, 'tag'>,
		symbol: string,
		interval: Interval,
		preset: string
	) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/backtesting/run?symbol=${symbol}&interval=${interval}&preset=${preset}`,
			getDefaultOption({
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			})
		);
		return resp;
	},
	getRunningPso: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/pso/running`, getDefaultOption({}));
		const json = (await resp.json()) as number;
		return json;
	},
	getPsoResult: async () => {
		const resp = await customFetch(`${PUBLIC_API_URL}/api/pso`, getDefaultOption({}));
		const json = (await resp.json()) as PsoResult[];
		return json;
	},
	deletePsoResult: async (id: string) => {
		const resp = await customFetch(
			`${PUBLIC_API_URL}/api/pso/${id}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	}
});
