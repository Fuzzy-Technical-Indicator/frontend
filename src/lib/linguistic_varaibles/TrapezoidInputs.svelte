<script lang="ts">
	export let parameters: Record<string, number>;
</script>

<label>
	a
	<input type="number" bind:value={parameters.a} class="border-black border" />
</label>
<label>
	b
	<input type="number" bind:value={parameters.b} class="border-black border" />
</label>
<label>
	c
	<input type="number" bind:value={parameters.c} class="border-black border" />
</label>
<label>
	d
	<input type="number" bind:value={parameters.d} class="border-black border" />
</label>
<label>
	height
	<input type="number" bind:value={parameters.height} class="border-black border" />
</label>
