import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const currPreset = params.preset;
	return { currPreset };
};
