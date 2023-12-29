<script lang="ts">
	import { afterUpdate, onDestroy } from 'svelte';

	export let graphId: string;
	export let boundary: {
		left: number;
		right: number;
	};
	export let graphs: string[][];
	export let names: string[];

	const gId = `${graphId}-desmos-graph`;

	const colors = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#ffffff'];
	const colorsInvert = ['#38bbbf', '#d28f4c', '#c773b9', '#9fbd59', '#0581e6', '#000000']; // desmos dark-mode by myself
	// const loadDesmos = () => {
	// 	// FIX: SPA when change to settings page, Desmos not load
	// 	return new Promise((resolve, reject) => {
	// 		const script = document.createElement('script');
	// 		script.src =
	// 			'https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
	// 		script.id = 'desmos-script';
	// 		script.async = true;
	// 		script.onload = resolve;
	// 		script.onerror = reject;
	// 		document.head.appendChild(script);
	// 	});
	// };

	let g: any;
	afterUpdate(async () => {
		// await loadDesmos();

		if (g) {
			g.destroy();
		}

		let elt = document.getElementById(gId);
		// @ts-expect-error : Desmos is an object from the script
		// eslint-disable-next-line
		g = Desmos.GraphingCalculator(elt, {
			expressions: false,
			lockViewport: true,
			settingsMenu: false,
			keypad: false,
		});

		g.setMathBounds({
			left: boundary.left,
			right: boundary.right,
			bottom: 0,
			top: 1
		});

		for (let i = 0; i < graphs.length; i++) {
			for (let j = 0; j < graphs[i].length; j++) {
				g.setExpression({
					id: `g${i}${j}`,
					latex: graphs[i][j],
					color: colorsInvert[i % colorsInvert.length]
				});
			}
		}
	});

	onDestroy(() => {
		if (g) {
			g.destroy();
		}
	});
</script>

<div>
	<div class="flex justify-center space-x-3">
		{#each names as name, i}
			<div class="flex space-x-1 p-4">
				<span class="p-4 rounded-lg" style={`background-color: ${colors[i % colors.length]}`} />
				<p>{name}</p>
			</div>
		{/each}
	</div>
	<div id={gId} class="m-2 w-full h-[600px]" />
</div>
