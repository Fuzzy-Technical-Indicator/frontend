<script lang="ts">
	import IconButton, { Icon } from '@smui/icon-button';
	import Dialog from '@smui/dialog';
	import Tooltip, { Wrapper } from '@smui/tooltip';

    let openDialog: boolean = false;
</script>

<Wrapper>
	<IconButton class="material-icons" on:click={() => {openDialog = true}} size="button">
		<Icon class="material-symbols-outlined opacity-50">help</Icon>
	</IconButton>
	<Tooltip>click to view info.</Tooltip>
</Wrapper>

<div class="absolute z-20">
	<Dialog bind:open={openDialog}>
		<div class="p-4">
			<slot/>
		</div>
	</Dialog>
</div>