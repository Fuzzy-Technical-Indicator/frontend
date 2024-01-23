<script lang="ts">
	import Textfield from '@smui/textfield';
	export let parameters: Record<string, number>;
</script>

<div class="grid grid-cols-5 gap-4">
	<Textfield class="" variant="filled" bind:value={parameters.a} label="A">
	</Textfield>
	<Textfield class="" variant="filled" bind:value={parameters.b} label="B">
	</Textfield>
	<Textfield class="" variant="filled" bind:value={parameters.c} label="C">
	</Textfield>
	<Textfield class="" variant="filled" bind:value={parameters.d} label="D">
	</Textfield>
	<Textfield class="" variant="filled" bind:value={parameters.height} label="Height">
	</Textfield>
</div>
