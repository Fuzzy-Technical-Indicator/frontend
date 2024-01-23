/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['sans-serif'],
				open: ['Open Sans'],
				roboto: ['Roboto'],
				yuji: ['Trade Winds']
			}
		}
	},
	plugins: []
};
