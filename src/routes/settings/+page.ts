import { api } from '$lib/apiClient';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ parent, fetch }) => {
	const { queryClient } = await parent();

	await queryClient.prefetchQuery({
		queryKey: ['settings'],
		queryFn: () => api(fetch).getSettings()
	});
};
