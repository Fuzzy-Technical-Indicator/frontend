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
		Authorization: `Bearer ${get(username)}`,
		...headers
	};
	return { method, body, headers: defaultHeader, keepalive: true };
}

const indicatorUrl = (url: string) => `${url}/api/indicators`;
export const api = (customFetch = fetch, url = PUBLIC_API_URL) => ({
	ohlc: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${url}/api/ohlc?symbol=${symbol}&interval=${interval}`,
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
	bb: async (options = getDefaultOption({})) => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorUrl(url)}/bb?symbol=${symbol}&interval=${interval}`,
			options
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
			`${indicatorUrl(url)}/stoch?symbol=${symbol}&interval=${interval}`,
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
			`${indicatorUrl(url)}/macd?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const macdLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const signalLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		const histogram: HistogramData[] = toSingleValueDataOfIdx(json, 2);
		return { macdLine, signalLine, histogram };
	},
	transformed_macd: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorUrl(url)}/macd/transformed?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number>[];
		const data: LineData[] = toSingleValueData(json);
		return data;
	},
	aroon: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorUrl(url)}/aroon?symbol=${symbol}&interval=${interval}`,
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
			`${url}/api/fuzzy?symbol=${symbol}&interval=${interval}&preset=${preset}`,
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
			`${indicatorUrl(url)}/rsi?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	adx: async () => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorUrl(url)}/adx?symbol=${symbol}&interval=${interval}`,
			getDefaultOption({})
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	},
	obv: async (): Promise<[LineData[], boolean]> => {
		const { symbol, interval } = get(chartSettings);
		const resp = await customFetch(
			`${indicatorUrl(url)}/obv?symbol=${symbol}&interval=${interval}`,
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
			`${indicatorUrl(url)}/accumdist?symbol=${symbol}&interval=${interval}`,
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
		const resp = await customFetch(`${url}/api/settings?preset=${preset}`, getDefaultOption({}));
		const json = (await resp.json()) as Settings;
		return json;
	},
	updateLinguisticVars: async (linguisticVariables: UpdateLinguisticVariable, preset: string) => {
		const body = JSON.stringify(linguisticVariables);
		const resp = await customFetch(
			`${url}/api/settings/linguisticvars?preset=${preset}`,
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
			`${url}/api/settings/linguisticvars/${name}?preset=${preset}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	addFuzzyRules: async (data: NewFuzzyRule, preset: string) => {
		const resp = await customFetch(
			`${url}/api/settings/fuzzyrules?preset=${preset}`,
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
			`${url}/api/settings/fuzzyrules/${id}?preset=${preset}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	getPresets: async (options = getDefaultOption({})) => {
		const resp = await customFetch(`${url}/api/settings/presets`, options);
		const json = (await resp.json()) as [string, boolean][];
		return json;
	},
	addPreset: async (presetName: string) => {
		const resp = await customFetch(
			`${url}/api/settings/presets/${presetName}`,
			getDefaultOption({ method: 'POST' })
		);
		return resp;
	},
	deletePreset: async (presetName: string) => {
		const resp = await customFetch(
			`${url}/api/settings/presets/${presetName}`,
			getDefaultOption({ method: 'DELETE' })
		);
		return resp;
	},
	isUsernameOkay: async (username: string) => {
		const resp = await customFetch(`${url}/api/user`, {
			keepalive: true,
			headers: { Authorization: `Bearer ${username}` }
		});

		if (resp.status === 401) {
			return false;
		}
		return true;
	},
	getUserSettings: async (options = getDefaultOption({})) => {
		const resp = await customFetch(`${url}/api/settings/users`, options);
		const json = (await resp.json()) as UserSettings;
		return json;
	},
	updateUserSetting: async (data: UpdateUserSettings) => {
		const resp = await customFetch(
			`${url}/api/settings/users`,
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
		const resp = await customFetch(`${url}/api/backtesting/running`, getDefaultOption({}));
		const json = (await resp.json()) as number;
		return json;
	},
	getBacktestReports: async () => {
		const resp = await customFetch(`${url}/api/backtesting`, getDefaultOption({}));
		const json = (await resp.json()) as BacktestReport[];
		return json;
	},
	getBacktestReport: async (id: string) => {
		const resp = await customFetch(`${url}/api/backtesting/${id}`, getDefaultOption({}));
		const json = (await resp.json()) as BacktestReport;
		return json;
	},
	deleteBacktestReport: async (id: string) => {
		const resp = await customFetch(
			`${url}/api/backtesting/${id}`,
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
			`${url}/api/backtesting/run?symbol=${symbol}&interval=${interval}&preset=${preset}`,
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
		const resp = await customFetch(`${url}/api/pso/running`, getDefaultOption({}));
		const json = (await resp.json()) as number;
		return json;
	},
	getPsoResult: async () => {
		const resp = await customFetch(`${url}/api/pso`, getDefaultOption({}));
		const json = (await resp.json()) as PsoResult[];
		return json;
	},
	deletePsoResult: async (id: string) => {
		const resp = await customFetch(`${url}/api/pso/${id}`, getDefaultOption({ method: 'DELETE' }));
		return resp;
	}
});
