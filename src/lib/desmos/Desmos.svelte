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

	const colors = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#000000'];

	let g: any;
	afterUpdate(() => {
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
			xAxisLabel: 'X',
			yAxisLabel: 'Membership Value'
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
					color: colors[i % colors.length]
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

<svelte:head>
	<script
		src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
	>
	</script>
</svelte:head>

<div>
	<div class="mx-auto flex space-x-3">
		{#each names as name, i}
			<div class="flex space-x-1">
				<span class="p-4" style={`background-color: ${colors[i % colors.length]}`} />
				<p>{name}</p>
			</div>
		{/each}
	</div>
	<div id={gId} class="m-2 w-full h-[600px]" />
</div>
