<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';
	import Navbar from '$lib/Navbar.svelte';

	export let data: PageData;

	let desmosLoaded = false;
	
</script>

<svelte:head>
	<title>Fuzzy Technical Indicator</title>
	<script
		async
		id="desmos-script"
		src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
		on:load={() => desmosLoaded = true}
	>
	</script>
</svelte:head>

{#if desmosLoaded}
	<QueryClientProvider client={data.queryClient}>
		<Navbar />
		<main>
			<slot />
		</main>
	</QueryClientProvider>
{/if}
