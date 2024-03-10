<script lang="ts">
	import Textfield from '@smui/textfield';
	export let parameters: Record<string, number>;
</script>

<div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
	<Textfield type="number" class="" variant="filled" bind:value={parameters.a} label="A">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.b} label="B">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.c} label="C">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.d} label="D">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.height} label="Height">
	</Textfield>
</div>
