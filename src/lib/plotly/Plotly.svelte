<script lang="ts">
	let element: HTMLDivElement | undefined = undefined;

	export let data: {
		x: number[];
		y: number[];
		mode?: string;
		type?: string;
		name?: string;
		marker?: Record<string, any>;
	}[];
	export let title: string;

	$: if (element) {
		// @ts-expect-error : Plotly is an object from the script
		// eslint-disable-next-line
		Plotly.newPlot(element, data, { title }, { staticPlot: true });
	}
</script>

<div bind:this={element} />

<style>
	div {
		filter: invert(100%) hue-rotate(180deg);
	}
</style>
