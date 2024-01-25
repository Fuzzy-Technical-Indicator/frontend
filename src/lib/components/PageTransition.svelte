<script lang="ts">
	import { fly } from 'svelte/transition';
	export let pathname: string = '';
</script>

{#key pathname}
	<div in:fly={{ y: -30, duration: 1000, delay: 50 }}>
		<slot />
	</div>
{/key}