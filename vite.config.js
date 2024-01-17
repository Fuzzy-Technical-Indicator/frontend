import { sveltekit } from '@sveltejs/kit/vite';
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	ssr: {
		noExternal: ['svelte-lightweight-charts', 'lightweight-charts', 'fancy-canvas']
	},
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib")
		}
	}
};

export default config;
