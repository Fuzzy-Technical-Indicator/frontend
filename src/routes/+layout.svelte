<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import { username } from '$lib/auth';

	export let data: PageData;
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,200,0,-25"
	/>
	<title>Fuzzy Technical Indicator</title>
	<script
		async
		src="https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
	></script>
</svelte:head>

<QueryClientProvider client={data.queryClient}>
	<main class="bg-black text-[#D4D4D4]">
		{#if $username !== ''}
			<Navbar />
		{/if}
		<div class="container mx-auto max-w-7xl bg-black font-nunito">
			<slot />
		</div>
		<Footer />
	</main>
</QueryClientProvider>
