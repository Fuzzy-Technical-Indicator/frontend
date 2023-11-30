import type { BarPrice, PriceFormatterFn } from 'lightweight-charts';

const K = 1000;
const M = 1000 * K;

export const priceFn: PriceFormatterFn = (price: BarPrice) => {
	return `${price.toFixed(2).padEnd(10)}`;
};

export const formatterM: PriceFormatterFn = (price: BarPrice) => {
	const value = price / M;
	return `${value.toFixed(2)}M`.padEnd(10);
};
