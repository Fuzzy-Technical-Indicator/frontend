import { api } from '$lib/apiClient';
import type { PageServerLoad } from '../$types';
import { API_SERVER_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const username = cookies.get('session-username');

	const client = api(fetch, API_SERVER_URL);
	const options: RequestInit = {
		keepalive: true,
		headers: { Authorization: `Bearer ${username}` }
	};
	const psoData = await client.getPsoResult(options);

	return { psoData };
};
