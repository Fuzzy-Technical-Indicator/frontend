<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import PageTransition from '$lib/components/PageTransition.svelte';
	import { username } from '$lib/auth';
	import { page } from '$app/stores';
	import CircularProgress from '@smui/circular-progress';

	export let data: PageData;

	$: if (data.username !== undefined) {
		username.set(data.username);
	} else {
		username.set('');
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,200,0,-25"
	/>
	<title>Fuzzy Technical Indicator</title>
	<script
		async
		src="https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
	></script>
	<script async src="https://cdn.plot.ly/plotly-2.29.1.min.js" charset="utf-8"></script>
</svelte:head>

<QueryClientProvider client={data.queryClient}>
	<main class="bg-black text-[#F8F9FA]">
		{#if $username !== ''}
			<Navbar />
		{/if}
		{#if $page.url.pathname === '/login' || $username !== ''}
			<div class="container mx-auto max-w-8xl bg-black">
				<PageTransition pathname={$page.url.pathname}>
					<slot />
				</PageTransition>
			</div>
		{:else}
			<div class="z-20 absolute bottom-0 left-0 right-0 top-0 grid place-items-center">
				<CircularProgress style="height: 128px; width: 128px;" indeterminate />
			</div>
		{/if}
		<Footer />
	</main>
</QueryClientProvider>
