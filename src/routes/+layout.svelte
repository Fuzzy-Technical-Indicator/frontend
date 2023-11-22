<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<QueryClientProvider client={data.queryClient}>
	<main>
		<slot />
	</main>
</QueryClientProvider>
