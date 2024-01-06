<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/apiClient';
	import { username } from '$lib/auth';
	import Button from '@smui/button';

	let input: string;

	const handleLogin = async () => {
		const result = await api().isUsernameOkay(input);
		if (result) {
			username.set(input);
			goto('/');
		} else {
			alert('Invalid username');
		}
	};
</script>

<div class="flex flex-col justify-center items-center mt-56">
	<input
		bind:value={input}
		type="text"
		placeholder="username"
		class="bg-zinc-900 text-white p-2 rounded-md mb-4"
	/>
	<Button variant="raised" on:click={handleLogin}>Login</Button>
</div>
