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

	const layout = {
		plot_bgcolor: '#00000000',
		paper_bgcolor: '#20202080',
		font: {
			color: 'white'
		}
	};

	$: if (element) {
		// @ts-expect-error : Plotly is an object from the script
		// eslint-disable-next-line
		Plotly.newPlot(element, data, { title, ...layout }, { staticPlot: true, responsive: true });
	}
</script>

<div bind:this={element} />
