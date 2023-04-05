import type { PageLoad } from './$types';
import type { CandlestickData, LineData, UTCTimestamp } from 'lightweight-charts/dist/typings';

interface MongoTime {
	$date: {
		$numberLong: number;
	};
}

interface Ohlc {
	ticker: string;
	time: MongoTime;
	open: number;
	high: number;
	low: number;
	close: number;
}

interface RsiValue {
	time: MongoTime;
	value: number;
}

async function fetch_ohlc(resp: Response): Promise<CandlestickData[]> {
	const ohlc = (await resp.json()) as Ohlc[];
	const data: CandlestickData[] = ohlc.map((x) => {
		const t = x.time.$date.$numberLong;
		return {
			time: (t / 1000) as UTCTimestamp,
			open: x.open,
			high: x.high,
			low: x.low,
			close: x.close
		} as CandlestickData;
	});
	return data;
}

async function fetch_rsi(resp: Response): Promise<LineData[]> {
	const json = (await resp.json()) as RsiValue[];
	const data: LineData[] = json.map((x) => {
		const t = x.time.$date.$numberLong;
		return {
			time: (t / 1000) as UTCTimestamp,
			value: x.value
		};
	});
	return data;
}

export const load: PageLoad = async ({ fetch }) => {
	// this is hardcoded for now
	const ohlc = await fetch_ohlc(
		await fetch(`http://127.0.0.1:8000/api/ohlc?symbol=BTC/USDT&interval=1d`)
	);
	const rsi = await fetch_rsi(
		await fetch(`http://127.0.0.1:8000/api/indicator?symbol=BTC/USDT&interval=1d&kind=rsi`)
	);

	const filler = ohlc.filter((x) => x.time < rsi[0].time).map((x) => {return {time: x.time, value: NaN } as LineData});
	rsi.unshift(...filler)

	return {
		ohlc: ohlc,
		rsi: rsi
	};
};
