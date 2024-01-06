import type { BarPrice, PriceFormatterFn } from 'lightweight-charts';
import { writable } from 'svelte/store';

const K = 1000;
const M = 1000 * K;

export const priceFn: PriceFormatterFn = (price: BarPrice) => {
	return `${price.toFixed(2).padEnd(10)}`;
};

export const formatterM: PriceFormatterFn = (price: BarPrice) => {
	const value = price / M;
	return `${value.toFixed(2)}M`.padEnd(10);
};

export const chartTheme = {
	layout: {
		background: {
			color: '#1A1A1A'
		},
		lineColor: '#000000',
		textColor: '#A6A6A6'
	},
	grid: {
		vertLines: { color: '#313131' },
		horzLines: { color: '#313131' }
	}
};

export const desmosLoaded = writable(false);
