import { api, getQueryKey } from '$lib/apiClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { queryClient } = await parent();

	await queryClient.prefetchQuery({
		queryKey: getQueryKey(['ohlc']),
		queryFn: () => api(fetch).ohlc()
	});

	await queryClient.prefetchQuery({
		queryKey: ['presets'],
		queryFn: () => api().getPresets()
	});
};
