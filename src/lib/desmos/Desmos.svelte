<script lang="ts">
	import { afterUpdate, onDestroy } from 'svelte';

	export let graphId: string;
	export let boundary: {
		left: number;
		right: number;
	};
	export let graphs: string[][];
	export let names: string[];

	// let gId = `${graphId}-desmos-graph`;

	const colors = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#ffffff'];
	const colorsInvert = ['#38bbbf', '#d28f4c', '#c773b9', '#9fbd59', '#0581e6', '#000000']; // desmos dark-mode by myself

	let g: any;
	afterUpdate(async () => {
		if (g) {
			g.destroy();
		}

		let elt = document.getElementById(`${graphId}-desmos-graph`);
		// @ts-expect-error : Desmos is an object from the script
		// eslint-disable-next-line
		g = Desmos.GraphingCalculator(elt, {
			expressions: false,
			lockViewport: true,
			settingsMenu: false,
			keypad: false
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
				<span class="px-4 rounded" style={`background-color: ${colors[i % colors.length]}`} />
				<p class="text-xs lg:text-base">{name}</p>
			</div>
		{/each}
	</div>
	<div id={`${graphId}-desmos-graph`} class="w-full h-[250px] md:h-[350px] lg:h-[450px] xl:h-[550px]" />
</div>
