import { api } from '$lib/apiClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch, params }) => {
	const { queryClient } = await parent();

	const currPreset = params.preset;
	await queryClient.prefetchQuery({
		queryKey: ['settings', currPreset],
		queryFn: () => api(fetch).getSettings(currPreset)
	});

	return { currPreset };
};
