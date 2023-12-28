<script lang="ts">
	export let parameters: Record<string, number>;
</script>

<label>
	a
	<input type="number" bind:value={parameters.a} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label>
	b
	<input type="number" bind:value={parameters.b} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label>
	c
	<input type="number" bind:value={parameters.c} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label>
	d
	<input type="number" bind:value={parameters.d} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label>
	height
	<input type="number" bind:value={parameters.height} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
