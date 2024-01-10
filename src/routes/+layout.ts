import { browser } from '$app/environment';
import { username } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { QueryClient } from '@tanstack/svelte-query';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	if (browser && get(username) === '' && url.pathname !== '/login') {
		throw redirect(307, '/login');
	}

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
				refetchOnWindowFocus: false
			}
		}
	});

	return { queryClient };
};
