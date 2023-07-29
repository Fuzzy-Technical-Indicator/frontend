import type { BarPrice, PriceFormatterFn, SingleValueData, UTCTimestamp } from 'lightweight-charts';
import { PUBLIC_API_URL } from '$env/static/public';

const K = 1000;

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

export function nullToNan(x: number | null): number {
	return x == null ? NaN : x;
}

export function getTime<T>(x: Ohlc | DTValue<T>): UTCTimestamp {
	return (x.time / 1000) as UTCTimestamp;
}

export function toSingleValueData(data: DTValue<number>[]): SingleValueData[] {
	return data.map((x) => {
		return { time: getTime(x), value: nullToNan(x.value) } as SingleValueData;
	});
}

export function toSingleValueDataOfIdx(data: DTValue<number[]>[], idx: number): SingleValueData[] {
	return data.map((x) => {
		return { time: getTime(x), value: nullToNan(x.value[idx]) } as SingleValueData;
	});
}

export const priceFn: PriceFormatterFn = (price: BarPrice) => {
	return `${price.toFixed(2).padEnd(10)}`;
};

export const formatterK: PriceFormatterFn = (price: BarPrice) => {
	const value = price / K;
	return `${value.toFixed(2)}K`.padEnd(10);
};

export const API_URL = PUBLIC_API_URL;
export const COIN = 'ETH/USDT';
export const INTERVAL = '1d';
