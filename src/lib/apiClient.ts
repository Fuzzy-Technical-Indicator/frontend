import { PUBLIC_API_URL } from '$env/static/public';
import type {
	CandlestickData,
	HistogramData,
	LineData,
	SingleValueData,
	UTCTimestamp
} from 'lightweight-charts';

export interface DTValue<T> {
	time: number;
	value: T;
}

export interface Ohlc {
	ticker: string;
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
}

export enum Interval {
	OneHour = '1h',
	FourHour = '4h',
	OneDay = '1d'
}

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

export class ApiClient {
	ticker: string;
	interval: Interval;
	fetchClient: typeof fetch;

	indicatorBaseUrl = `${PUBLIC_API_URL}/api/indicators`;

	public constructor(fetchClient: typeof fetch) {
		this.ticker = 'ETH/USDT';
		this.interval = Interval.OneDay;
		this.fetchClient = fetchClient;
	}

	public updateSetting(ticker: string, interval: Interval) {
		this.ticker = ticker;
		this.interval = interval;
	}

	public getTicker() {
		return this.ticker;
	}

	public getInterval() {
		return this.interval;
	}

	public async ohlc() {
		const resp = await this.fetchClient(
			`${PUBLIC_API_URL}/api/ohlc?symbol=${this.ticker}&interval=${this.interval}`
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
	}

	public async macd(
		fast: number,
		slow: number,
		smooth: number
	): Promise<[LineData[], LineData[], LineData[]]> {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/macd?symbol=${this.ticker}&interval=${this.interval}&fast=${fast}&slow=${slow}&smooth=${smooth}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const macd_line: LineData[] = toSingleValueDataOfIdx(json, 0);
		const signal_line: LineData[] = toSingleValueDataOfIdx(json, 1);
		const histogram: HistogramData[] = toSingleValueDataOfIdx(json, 2);

		return [macd_line, signal_line, histogram];
	}

	public async aroon(length: number): Promise<{ upper: LineData[]; lower: LineData[] }> {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/aroon?symbol=${this.ticker}&interval=${this.interval}&length=${length}`
		);
		const data = (await resp.json()) as DTValue<[number, number, number]>[];
		const upper: LineData[] = toSingleValueDataOfIdx(data, 0);
		const lower: LineData[] = toSingleValueDataOfIdx(data, 1);
		return { upper, lower };
	}

	public async stoch(k: number, d: number, length: number) {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/stoch?symbol=${this.ticker}&interval=${this.interval}&k=${k}&d=${d}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		const kLine: LineData[] = toSingleValueDataOfIdx(json, 0);
		const dLine: LineData[] = toSingleValueDataOfIdx(json, 1);
		return [kLine, dLine];
	}

	public async rsi(length: number) {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/rsi?symbol=${this.ticker}&interval=${this.interval}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	}

	public async adx(length: number) {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/adx?symbol=${this.ticker}&interval=${this.interval}&length=${length}`
		);
		const json = (await resp.json()) as DTValue<number>[];
		const result = toSingleValueData(json);

		return result;
	}

	public async obv(): Promise<[LineData[], boolean]> {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/obv?symbol=${this.ticker}&interval=${this.interval}`
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
	}

	public async accumdist(): Promise<[LineData[], boolean]> {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/accumdist?symbol=${this.ticker}&interval=${this.interval}`
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
	}

	public async bb(length = 20, stdev = 2) {
		const resp = await this.fetchClient(
			`${this.indicatorBaseUrl}/bb?symbol=${this.ticker}&interval=${this.interval}&length=${length}&stdev=${stdev}`
		);
		const json = (await resp.json()) as DTValue<[number, number, number]>[];
		return [
			toSingleValueDataOfIdx(json, 0),
			toSingleValueDataOfIdx(json, 1),
			toSingleValueDataOfIdx(json, 2)
		];
	}

	public async fuzzy() {
		const resp = await this.fetchClient(
			`${PUBLIC_API_URL}/api/fuzzy?symbol=${this.ticker}&interval=${this.interval}`
		);
		const json = (await resp.json()) as DTValue<[number, number]>[];
		const long: LineData[] = toSingleValueDataOfIdx(json, 0);
		const short: LineData[] = toSingleValueDataOfIdx(json, 1);
		return [long, short];
	}
}
