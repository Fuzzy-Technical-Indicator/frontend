<script lang="ts">
	export let parameters: Record<string, number>;
</script>

<label class="px-2">
	center -
	<input type="number" bind:value={parameters.center} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label class="px-2">
	width -
	<input type="number" bind:value={parameters.width} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
<label class="px-2">
	height -
	<input type="number" bind:value={parameters.height} class="bg-[#1A1A1A] text-[#A6A6A6] border border-[#313131] rounded-md" />
</label>
