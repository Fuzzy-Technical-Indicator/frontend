import { API_SERVER_URL } from '$env/static/private';
import { api } from '$lib/apiClient';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const username = cookies.get('session-username');

	const client = api(fetch, API_SERVER_URL);
	const options: RequestInit = {
		keepalive: true,
		headers: { Authorization: `Bearer ${username}` }
	};
	const presets = await client.getPresets(options);
	const bb = await client.bb(options);
	const users = await client.getUserSettings(options);

	return { presets, bb, users };
};

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session-username', { path: '/' });
		throw redirect(303, '/login');
	}
} satisfies Actions;
