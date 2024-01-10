<script lang="ts">
	export let name: string;
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	export let onSettingClick = () => {};
	export let showSettingButton = true;
</script>

<div class="flex items-center space-x-1 flex-nowrap">
	<slot />
	<span class="font-thin">{name}</span>
	{#if showSettingButton}
		<button on:click={onSettingClick} class="h-[24px]">
			<span class="material-symbols-outlined"> settings </span>
		</button>
	{/if}
</div>
