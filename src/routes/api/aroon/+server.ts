import { API_URL, COIN, INTERVAL, toSingleValueDataOfIdx, type DTValue } from '$lib/utils';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { LineData } from 'lightweight-charts';

export const GET: RequestHandler = async ({ fetch }) => {
	const resp = await fetch(`${API_URL}/api/indicator/aroon?symbol=${COIN}&interval=${INTERVAL}`);
	const data = (await resp.json()) as DTValue<[number, number, number]>[];
	const upper: LineData[] = toSingleValueDataOfIdx(data, 0);
	const lower: LineData[] = toSingleValueDataOfIdx(data, 1);
	return json({ upper, lower });
};
