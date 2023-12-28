/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				mono: ['Nunito Sans', 'monospace'],
				nunito: ['Nunito Sans', 'sans-serif']
			}
		}
	},
	plugins: []
};
