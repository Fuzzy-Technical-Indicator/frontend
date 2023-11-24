<script lang="ts">
	export let parameters: Record<string, number>;
</script>

<label>
	center
	<input type="number" bind:value={parameters.center} class="border-black border" />
</label>
<label>
	width
	<input type="number" bind:value={parameters.width} class="border-black border" />
</label>
<label>
	height
	<input type="number" bind:value={parameters.height} class="border-black border" />
</label>
