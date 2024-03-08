import { API_SERVER_URL } from '$env/static/private';
import { api } from '$lib/apiClient';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ cookies, request, fetch }) => {
		const form = await request.formData();
		const username = form.get('username');

		if (username === null || username === '') {
			throw redirect(307, '/login');
		}
		const okay = await api(fetch, API_SERVER_URL).isUsernameOkay(username.toString());
		if (!okay) {
			return fail(400, { username, incorrect: true });
		}

		cookies.set('session-username', username.toString(), { path: '/', secure: false });
		throw redirect(303, '/');
	}
} satisfies Actions;
