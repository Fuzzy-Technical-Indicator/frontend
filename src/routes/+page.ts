import { ApiClient } from '$lib/apiClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const apiClient = new ApiClient(fetch);
	return {
		ohlc: await apiClient.ohlc(),
		bb: await apiClient.bb(),
		apiClient: apiClient
	};
};
