<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';
	import Icon from '@smui/textfield/icon';

	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import CircularProgress from '@smui/circular-progress';

	export let form;
	let input = '';

	$: if (form?.incorrect) {
		open = true;
	}

	let open = false;
	let loading = false;
</script>

<Dialog bind:open aria-labelledby="simple-title" aria-describedby="simple-content">
	<Title id="simple-title">Login failed</Title>
	<Content id="simple-content">Invalid username.</Content>
	<Actions>
		<Button on:click={() => (open = false)}>
			<Label>OK</Label>
		</Button>
	</Actions>
</Dialog>

{#if loading}
	<div style="display: flex; justify-content: center">
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	</div>
{:else}
	<div class="flex flex-col justify-center items-center mt-20 bg-black">
		<div class="flex py-4">
			<img src="favicon.png" alt="fzt-logo" width="300" class="" />
			<!-- <h1
				class="font-yuji text-transparent text-4xl bg-clip-text bg-gradient-to-bl from-gray-900 via-gray-100 to-gray-900"
			>
				Fuzzy Technical Indicator
			</h1> -->
		</div>
		<form method="POST">
			<Textfield
				input$name="username"
				bind:value={input}
				class="my-text-field"
				label="Username"
				required
			>
				<Icon class="material-icons" slot="leadingIcon">person</Icon>
			</Textfield>
			<div class="text-center mt-8"><Button variant="raised" class="my-primary-button">
				<Label>Login</Label>
			</Button></div>
		</form>
	</div>
{/if}
