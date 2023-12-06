<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';
	import Navbar from '$lib/Navbar.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Fuzzy Technical Indicator</title>
	<script
		id="desmos-script"
		src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
	>
	</script>
</svelte:head>

<QueryClientProvider client={data.queryClient}>
	<Navbar />
	<main>
		<slot />
	</main>
</QueryClientProvider>
