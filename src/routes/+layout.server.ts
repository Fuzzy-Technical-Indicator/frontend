import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const username = cookies.get('session-username');
	if (url.pathname !== '/login' && !username) {
		throw redirect(303, '/login');
	}
	return { username };
};
