import type { BarPrice, IChartApi, PriceFormatterFn, SingleValueData, UTCTimestamp } from "lightweight-charts";

interface MongoTime {
	$date: {
		$numberLong: number;
	};
}

export interface DTValue<T> {
	time: MongoTime;
	value: T;
}

export interface Ohlc {
	ticker: string;
	time: MongoTime;
	open: number;
	high: number;
	low: number;
	close: number;
}

function null_to_nan(x: number | null): number {
	return x == null ? NaN : x;
}

function get_time<T>(x: Ohlc | DTValue<T>): UTCTimestamp {
	return (x.time.$date.$numberLong / 1000) as UTCTimestamp;
}

export function to_svd(data: DTValue<number>[]): SingleValueData[] {
	return data.map((x) => {
		return { time: get_time(x), value: null_to_nan(x.value) } as SingleValueData;
	});
}

export const priceFn: PriceFormatterFn = (price: BarPrice) => {
	return `${price.toFixed(2).padEnd(10)}`;
};