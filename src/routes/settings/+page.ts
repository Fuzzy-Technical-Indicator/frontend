import { ApiClient } from '$lib/apiClient';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch }) => {
	const apiClient = new ApiClient(fetch);
	const result = await apiClient.getSettings();
	return {
		settings: result,
		apiClient
	};
};
