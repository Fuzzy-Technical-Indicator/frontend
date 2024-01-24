<script lang="ts">
	import Textfield from '@smui/textfield';
	export let parameters: Record<string, number>;
</script>

<div class="grid grid-cols-3 gap-4">
	<Textfield type="number" class="" variant="filled" bind:value={parameters.center} label="Center">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.width} label="Width">
	</Textfield>
	<Textfield type="number" class="" variant="filled" bind:value={parameters.height} label="Height">
	</Textfield>
</div>