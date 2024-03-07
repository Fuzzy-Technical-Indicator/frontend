import { PUBLIC_API_SERVER_URL } from '$env/static/public';
import { api } from '$lib/apiClient';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	const username = cookies.get('session-username');

	const presets = await api(fetch, PUBLIC_API_SERVER_URL).getPresets({
		keepalive: true,
		headers: { Authorization: `Bearer ${username}` }
	});

	return { presets };
};

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session-username');
		throw redirect(303, '/login');
	}
} satisfies Actions;
