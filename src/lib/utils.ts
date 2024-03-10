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

export function toDateTimeString(timestamp: number) {
	const dt = new Date(timestamp);
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		timeZoneName: 'short'
	};

	const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(dt);
	return formattedDate.replace(',', ' ');
}

export function secondsToHms(seconds: number) {
	// https://stackoverflow.com/questions/37096367/how-to-convert-seconds-to-minutes-and-hours-in-javascript
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor((seconds % 3600) % 60);

	const hDisplay = h > 0 ? h + ' hrs ' : '';
	const mDisplay = m > 0 ? m + ' mins ' : '';
	const sDisplay = s > 0 ? s + ' secs ' : '';
	return hDisplay + mDisplay + sDisplay;
}

export const chartTheme = {
	layout: {
		background: {
			color: '#20202080'
		},
		lineColor: '#000000',
		textColor: '#A6A6A6'
	},
	grid: {
		vertLines: { color: '#3D404580' },
		horzLines: { color: '#3D404580' }
	}
};

export const tickers = [
	'ETH/USDT',
	'BTC/USDT',
	'BNB/USDT',
	'AAPL/USD',
	'IBM/USD',
	'JPM/USD',
	'MSFT/USD',
	'NKE/USD',
	'TSLA/USD'
];
