<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';
	import Navbar from '$lib/Navbar.svelte';

	export let data: PageData;
</script>

<QueryClientProvider client={data.queryClient}>
	<Navbar />
	<main>
		<slot />
	</main>
</QueryClientProvider>
